import { sessionAccount } from "./account-links";
import type { CccdProfile } from "./gift-unlock";

export const TITLE_COLORS = [
  { id: "navy", hex: "#1d2951", label: "Navy" },
  { id: "red", hex: "#E11D48", label: "Đỏ" },
  { id: "yellow", hex: "#FFD166", label: "Vàng" },
  { id: "white", hex: "#ffffff", label: "Trắng" },
  { id: "cyan", hex: "#7AD0FF", label: "Xanh" },
] as const;

export type TitleColorId = (typeof TITLE_COLORS)[number]["id"];

export type UserChatRoom = {
  id: string;
  title: string;
  startsAt: string;
  creatorLabel: string;
  creatorId: string;
  isLive: boolean;
  createdAt: string;
  titleColor: TitleColorId;
  btcIds?: string[];
  guestIds?: string[];
  insideCount?: number;
  watchingCount?: number;
  creatorRank?: string;
};

export type RoomChatMsg = {
  id: string;
  roomId: string;
  text: string;
  at: string;
  fromLabel: string;
  pinned: boolean;
};

const KEY = "pl-user-chat-rooms";
const MSG = "pl-user-chat-msgs";

export function formatProfileUsername(opts?: {
  username?: string;
  cccd?: CccdProfile | null;
}): string {
  const acc = sessionAccount();
  const raw =
    opts?.username ||
    acc?.displayName ||
    acc?.email?.split("@")[0] ||
    acc?.phone ||
    "user";
  const user = String(raw).replace(/^@/, "").replace(/\s+/g, "").slice(0, 18);
  const id = (opts?.cccd?.idNumber || acc?.cccd?.idNumber || "").replace(/\D/g, "");
  const last6 = id.length >= 6 ? id.slice(-6) : id || "000000";
  const parts = String(opts?.cccd?.fullName || acc?.cccd?.fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const given = parts.length >= 2 ? parts.slice(-2).join(" ") : parts[0] || "";
  return given ? `@${user}${last6} ${given}` : `@${user}${last6}`;
}

export function loadUserChatRooms(): UserChatRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as UserChatRoom[]) : [];
    return Array.isArray(list) ? list.map((r) => ({ ...r, titleColor: r.titleColor || "navy" })) : [];
  } catch {
    return [];
  }
}

export function saveUserChatRoom(row: UserChatRoom) {
  const list = [row, ...loadUserChatRooms().filter((r) => r.id !== row.id)];
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 80)));
}

export function titleHex(id?: string) {
  return TITLE_COLORS.find((c) => c.id === id)?.hex || "#1d2951";
}

const FAME: Record<string, number> = {
  boss: 0,
  admin: 1,
  artist: 2,
  journalist: 3,
  user: 4,
  guest: 5,
};

export function isOnEventStaff(r: UserChatRoom, me?: string) {
  if (!me) return false;
  if (r.creatorId === me) return true;
  if (r.btcIds?.includes(me)) return true;
  if (r.guestIds?.includes(me)) return true;
  return false;
}

function near(a: string, b: string) {
  const n = Date.now();
  return Math.abs(+new Date(a) - n) - Math.abs(+new Date(b) - n);
}

function crowd(r: UserChatRoom) {
  return (r.insideCount || 0) + (r.watchingCount || 0);
}

function fame(r: UserChatRoom) {
  return FAME[r.creatorRank || "user"] ?? 4;
}

function tier(r: UserChatRoom, me?: string) {
  if (isOnEventStaff(r, me)) return 0;
  if (crowd(r) > 0) return 1;
  return 2;
}

/** Ưu tiên: user trong BTC/khách + gần giờ live → đông người + gần giờ → người nổi tiếng. */
export function sortChatDrops(list: UserChatRoom[], me?: string) {
  return [...list].sort((a, b) => {
    const ta = tier(a, me);
    const tb = tier(b, me);
    if (ta !== tb) return ta - tb;
    if (ta === 0) return near(a.startsAt, b.startsAt);
    if (ta === 1) {
      const c = crowd(b) - crowd(a);
      if (c) return c;
      return near(a.startsAt, b.startsAt);
    }
    const f = fame(a) - fame(b);
    if (f) return f;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });
}

/** Khoang live: gần giờ hệ thống nhất lên đầu. */
export function sortNearestNow(a: { startsAt: string }, b: { startsAt: string }) {
  const n = Date.now();
  return Math.abs(+new Date(a.startsAt) - n) - Math.abs(+new Date(b.startsAt) - n);
}

/** Khoang đợi: giờ live sớm hơn lên đầu, không nhảy feed. */
export function sortSoonestLive(a: { startsAt: string }, b: { startsAt: string }) {
  return +new Date(a.startsAt) - +new Date(b.startsAt);
}

export function loadRoomMsgs(roomId: string): RoomChatMsg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MSG);
    const list = raw ? (JSON.parse(raw) as RoomChatMsg[]) : [];
    return list.filter((m) => m.roomId === roomId);
  } catch {
    return [];
  }
}

export function saveRoomMsg(m: RoomChatMsg) {
  const raw = localStorage.getItem(MSG);
  const list: RoomChatMsg[] = raw ? JSON.parse(raw) : [];
  list.push(m);
  localStorage.setItem(MSG, JSON.stringify(list.slice(-400)));
}

export function sortPinnedFirst(list: RoomChatMsg[]) {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return +new Date(a.at) - +new Date(b.at);
  });
}
