import { STICKERS, type StickerDef } from "./gifting";

export type PointReason =
  | "event-sticker-received"
  | "event-sticker-sent-spend"
  | "redeem"
  | "adjust";

export type PointEntry = {
  id: string;
  userId: string;
  eventId?: string;
  liveSessionId?: string;
  delta: number; // + nhận / − dùng
  reason: PointReason;
  stickerId?: string;
  createdAt: string;
};

export type UserPoints = {
  userId: string;
  balance: number;
  earned: number;
  spent: number;
  ledger: PointEntry[];
};

export function emptyPoints(userId: string): UserPoints {
  return { userId, balance: 0, earned: 0, spent: 0, ledger: [] };
}

function push(acc: UserPoints, entry: Omit<PointEntry, "id" | "createdAt">): UserPoints {
  if (entry.delta < 0 && acc.balance + entry.delta < 0) {
    throw new Error("Không đủ điểm.");
  }
  const row: PointEntry = {
    ...entry,
    id: `PT-${Date.now()}-${acc.ledger.length}`,
    createdAt: new Date().toISOString(),
  };
  const earned = acc.earned + Math.max(0, row.delta);
  const spent = acc.spent + Math.max(0, -row.delta);
  return {
    ...acc,
    balance: acc.balance + row.delta,
    earned,
    spent,
    ledger: [row, ...acc.ledger],
  };
}

/** Người nhận sticker trong sự kiện → cộng điểm sticker. */
export function earnFromReceivedSticker(
  acc: UserPoints,
  opts: { eventId: string; liveSessionId: string; stickerId: string; qty?: number; catalog?: StickerDef[] }
): UserPoints {
  const catalog = opts.catalog ?? STICKERS;
  const def = catalog.find((s) => s.id === opts.stickerId);
  const qty = Math.max(1, opts.qty ?? 1);
  const delta = (def?.points ?? 0) * qty;
  if (delta <= 0) return acc;
  return push(acc, {
    userId: acc.userId,
    eventId: opts.eventId,
    liveSessionId: opts.liveSessionId,
    delta,
    reason: "event-sticker-received",
    stickerId: opts.stickerId,
  });
}

/** Dùng điểm để tặng sticker (trừ đúng số điểm sticker × qty). */
export function spendToSendSticker(
  acc: UserPoints,
  opts: { eventId: string; liveSessionId: string; stickerId: string; qty?: number; catalog?: StickerDef[] }
): UserPoints {
  const catalog = opts.catalog ?? STICKERS;
  const def = catalog.find((s) => s.id === opts.stickerId);
  if (!def) throw new Error("Sticker chưa gắn điểm.");
  const qty = Math.max(1, opts.qty ?? 1);
  return push(acc, {
    userId: acc.userId,
    eventId: opts.eventId,
    liveSessionId: opts.liveSessionId,
    delta: -(def.points * qty),
    reason: "event-sticker-sent-spend",
    stickerId: opts.stickerId,
  });
}

export function redeemPoints(acc: UserPoints, amount: number, noteEventId?: string): UserPoints {
  if (amount <= 0) throw new Error("Số điểm đổi phải > 0.");
  return push(acc, {
    userId: acc.userId,
    eventId: noteEventId,
    delta: -amount,
    reason: "redeem",
  });
}

export function canAffordSticker(
  acc: UserPoints,
  stickerId: string,
  qty = 1,
  catalog = STICKERS
): boolean {
  const def = catalog.find((s) => s.id === stickerId);
  if (!def) return false;
  return acc.balance >= def.points * qty;
}
