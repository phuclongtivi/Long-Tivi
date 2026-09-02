/** Nhạc chủ đề Live reel. AI admin đổi 17:00 GMT mỗi thứ Năm. Clip 20–90s, top 1–5 trending. */

export const THEME_MIN_SEC = 20;
export const THEME_MAX_SEC = 90;
export const THEME_TARGET_VOL = 0.45;
/** Mở tab Live: im 5 giây rồi mới phát nhạc chủ đề. Rời tab thì hủy. */
export const THEME_INTRO_SILENCE_MS = 5000;
export const ROOM_ENTER_VOL = 0.7;
export const THEME_SWAP_WEEKDAY = 4; // Thursday
export const THEME_SWAP_HOUR_GMT = 17;

export type ThemeTrack = {
  rank: 1 | 2 | 3 | 4 | 5;
  title: string;
  artist: string;
  source: "soundcloud" | "zing";
  pageUrl: string;
  /** clip 20–90s — boss gắn file/CDN sau */
  clipUrl?: string;
  durationSec: number;
};

/** Slot mặc định — AI admin ghi đè khi fetch trending. */
export const DEFAULT_TRENDING: ThemeTrack[] = [
  { rank: 1, title: "Trending #1", artist: "—", source: "soundcloud", pageUrl: "https://soundcloud.com/discover", durationSec: 45 },
  { rank: 2, title: "Trending #2", artist: "—", source: "soundcloud", pageUrl: "https://soundcloud.com/discover", durationSec: 40 },
  { rank: 3, title: "Trending #3", artist: "—", source: "zing", pageUrl: "https://zingmp3.vn/", durationSec: 50 },
  { rank: 4, title: "Trending #4", artist: "—", source: "zing", pageUrl: "https://zingmp3.vn/", durationSec: 35 },
  { rank: 5, title: "Trending #5", artist: "—", source: "soundcloud", pageUrl: "https://soundcloud.com/discover", durationSec: 60 },
];

const THEME_KEY = "plc-live-theme";

export type ThemeState = {
  weekId: string;
  picked: ThemeTrack;
  swappedAt: string;
};

export function thursdayWeekId(now = new Date()): string {
  const t = new Date(now.toISOString());
  const day = t.getUTCDay();
  const diff = (day + 6) % 7;
  t.setUTCDate(t.getUTCDate() - diff);
  t.setUTCHours(THEME_SWAP_HOUR_GMT, 0, 0, 0);
  if (now.getTime() < t.getTime()) t.setUTCDate(t.getUTCDate() - 7);
  return t.toISOString().slice(0, 10);
}

export function shouldSwapTheme(prevWeekId: string | undefined, now = new Date()): boolean {
  return thursdayWeekId(now) !== prevWeekId;
}

export function pickThemeFromTop5(tracks = DEFAULT_TRENDING, now = new Date()): ThemeTrack {
  const valid = tracks.filter((t) => t.durationSec >= THEME_MIN_SEC && t.durationSec <= THEME_MAX_SEC);
  const pool = valid.length ? valid : tracks;
  const i = Math.abs(hash(thursdayWeekId(now))) % Math.min(5, pool.length);
  return pool[i];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function loadTheme(): ThemeState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(THEME_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveTheme(s: ThemeState) {
  localStorage.setItem(THEME_KEY, JSON.stringify(s));
}

/** AI admin: mỗi thứ 5 17:00 GMT lấy top 5 SC/Zing rồi chọn 1 clip. */
export function adminRotateTheme(trending?: ThemeTrack[], now = new Date()): ThemeState {
  const weekId = thursdayWeekId(now);
  const picked = pickThemeFromTop5(trending ?? DEFAULT_TRENDING, now);
  const s: ThemeState = { weekId, picked, swappedAt: now.toISOString() };
  if (typeof localStorage !== "undefined") saveTheme(s);
  return s;
}

export function ensureTheme(now = new Date()): ThemeState {
  const cur = loadTheme();
  if (!cur || shouldSwapTheme(cur.weekId, now)) return adminRotateTheme(undefined, now);
  return cur;
}

export function fadeVolume(
  el: HTMLMediaElement,
  to: number,
  ms = 1600
): Promise<void> {
  const from = el.volume;
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * p));
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}
