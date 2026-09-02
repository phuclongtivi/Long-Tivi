/** Nguồn âm trong 1 phiên livestream — user chọn và trộn. */

export type LiveAudioSourceId =
  | "mic"
  | "device"
  | "file"
  | "guest"
  | "assistant"
  | "youtube"
  | "zing"
  | "soundcloud"
  | "handheld";

export type StreamProvider = "youtube" | "zing" | "soundcloud" | "unknown";

export type LiveAudioSource = {
  id: LiveAudioSourceId;
  label: string;
  enabled: boolean;
  /** 0–1 */
  volume: number;
  muted: boolean;
  deviceId?: string;
  url?: string;
};

export const DEFAULT_LIVE_SOURCES: LiveAudioSource[] = [
  { id: "mic", label: "Micro máy / điện thoại", enabled: true, volume: 1, muted: false },
  { id: "device", label: "Âm thanh máy (nhạc / tab khác)", enabled: false, volume: 0.8, muted: false },
  { id: "file", label: "File nhạc / audio", enabled: false, volume: 0.8, muted: false },
  { id: "guest", label: "Khách mời trên sóng", enabled: true, volume: 1, muted: false },
  { id: "assistant", label: "Giọng trợ lý AI", enabled: true, volume: 0.55, muted: false },
  { id: "youtube", label: "YouTube", enabled: true, volume: 0.8, muted: false },
  { id: "zing", label: "Zing MP3", enabled: true, volume: 0.8, muted: false },
  { id: "soundcloud", label: "SoundCloud", enabled: true, volume: 0.8, muted: false },
  { id: "handheld", label: "USB / iPod / iPhone khác", enabled: false, volume: 0.85, muted: false },
];

export const ASSISTANT_MAY_PLAY_DEFAULT = true;

export function detectProvider(url: string): StreamProvider {
  const u = url.toLowerCase();
  if (/youtube\.com|youtu\.be/.test(u)) return "youtube";
  if (/zingmp3|mp3\.zing/.test(u)) return "zing";
  if (/soundcloud\.com/.test(u)) return "soundcloud";
  return "unknown";
}

export function youtubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]{6,})/) ||
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/embed\/([\w-]{6,})/);
  return m?.[1] ?? null;
}

export function embedUrl(url: string): string | null {
  const p = detectProvider(url);
  if (p === "youtube") {
    const id = youtubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
  }
  if (p === "soundcloud") {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true`;
  }
  if (p === "zing") return url;
  return null;
}

export function gainOf(s: LiveAudioSource): number {
  if (!s.enabled || s.muted) return 0;
  return Math.max(0, Math.min(1, s.volume));
}

export function patchSource(
  list: LiveAudioSource[],
  id: LiveAudioSourceId,
  patch: Partial<LiveAudioSource>
): LiveAudioSource[] {
  return list.map((s) => (s.id === id ? { ...s, ...patch } : s));
}
