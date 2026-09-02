import type { NotifyItem } from "./NotifyInbox";

export const NOTIFY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const KEY = "pl-notify-inbox";

export function expiresAtFrom(at = Date.now()): string {
  return new Date(at + NOTIFY_TTL_MS).toISOString();
}

export function isExpired(n: NotifyItem): boolean {
  const exp = n.expiresAt ? Date.parse(n.expiresAt) : Date.parse(n.at) + NOTIFY_TTL_MS;
  return Date.now() > exp;
}

export function loadNotices(): NotifyItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as NotifyItem[];
    const live = raw.filter((n) => !isExpired(n));
    if (live.length !== raw.length) localStorage.setItem(KEY, JSON.stringify(live));
    return live;
  } catch {
    return [];
  }
}

export function saveNotices(items: NotifyItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items.filter((n) => !isExpired(n)).slice(0, 200)));
}

export function pushNotice(item: NotifyItem) {
  const next = [
    { ...item, expiresAt: item.expiresAt || expiresAtFrom() },
    ...loadNotices().filter((x) => x.id !== item.id),
  ];
  saveNotices(next);
}
