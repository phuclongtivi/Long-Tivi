/** Thông báo sự kiện trước live: tối đa 15 ngày. */

export const ANNOUNCE_TO_LIVE_MAX_DAYS = 15;
export const PROGRAM_MAX_CHARS = 2000;
export const GUEST_NAME_MAX = 30;

export function stripMarks(s: string): string {
  return s.normalize("NFD").replace(/\p{M}+/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

/** Dấu không tính. */
export function guestNameUnits(name: string): number {
  return stripMarks(name).replace(/\s+/g, " ").trim().length;
}

export function guestNameOk(name: string): boolean {
  const t = name.trim();
  if (!t) return true;
  return guestNameUnits(t) <= GUEST_NAME_MAX;
}

export function liveWindowOk(startsAt: string, from = new Date()): { ok: boolean; reason?: string } {
  const start = new Date(startsAt);
  if (Number.isNaN(+start)) return { ok: false, reason: "Chọn thời gian livestream." };
  if (+start < +from - 60_000) return { ok: false, reason: "Giờ live không được trước lúc đăng thông báo." };
  const max = +from + ANNOUNCE_TO_LIVE_MAX_DAYS * 24 * 60 * 60 * 1000;
  if (+start > max) {
    return { ok: false, reason: `Live phải diễn ra trong ${ANNOUNCE_TO_LIVE_MAX_DAYS} ngày kể từ lúc hoàn thành thông báo.` };
  }
  return { ok: true };
}

export function liveMustStartBy(from = new Date()): Date {
  return new Date(+from + ANNOUNCE_TO_LIVE_MAX_DAYS * 24 * 60 * 60 * 1000);
}

export type EventTypeTick = "gift" | "ticket" | "invite";

export function typeToKind(t: EventTypeTick): { kind: "gift" | "ticket" | "live"; ticketMode?: "fixed" | "invite"; joinAccess: "open" | "ticket" | "invite" } {
  if (t === "gift") return { kind: "gift", joinAccess: "open" };
  if (t === "invite") return { kind: "ticket", ticketMode: "invite", joinAccess: "invite" };
  return { kind: "ticket", ticketMode: "fixed", joinAccess: "ticket" };
}
