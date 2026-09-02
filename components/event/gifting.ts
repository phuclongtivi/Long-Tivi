import { TIER1_STICKERS } from "./stickers-tier1";
import { TIER2_STICKERS } from "./stickers-tier2";
import { TIER3_STICKERS } from "./stickers-tier3";
/**
 * Tặng quà trong mọi phiên live / sự kiện.
 * Role biểu diễn chỉ gắn theo phiên — không đụng hạng app.
 */

export type SessionRole = "organizer" | "performer" | "guest";

export type GiftKind = "transfer" | "sticker";

export type StickerDef = {
  id: string;
  name: string;
  imageUrl: string;
  points: number; // điểm cộng cho người nhận khi nhận sticker này
};

/** Catalog 3 cấp đã gắn điểm. */
export const STICKERS: StickerDef[] = [...TIER1_STICKERS, ...TIER2_STICKERS, ...TIER3_STICKERS];

export type BankProfile = {
  userId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  /** deep link / scheme app ngân hàng nếu có */
  bankAppScheme?: string;
};

export type CashConfirmStatus = "pending" | "completed" | "incomplete";

export type GiftTransfer = {
  kind: "transfer";
  amountVnd: number;
  note?: string;
  /** Chỉ khi người tặng xác nhận đã chuyển xong */
  confirmStatus: CashConfirmStatus;
  /** Sticker tiền trên overlay live — chỉ true khi completed */
  showCashStickerOnLive: boolean;
};

export type GiftSticker = {
  kind: "sticker";
  stickerId: string;
  qty: number;
};

export type GiftPayload = GiftTransfer | GiftSticker;

export type GiftRecord = {
  id: string;
  eventId: string;
  liveSessionId: string;
  fromUserId: string;
  toUserId: string;
  payload: GiftPayload;
  pointsAwarded: number;
  createdAt: string;
};

export type InventoryItem =
  | { type: "money"; amountVnd: number }
  | { type: "sticker"; stickerId: string; qty: number; points: number };

export type GiftWarehouse = {
  userId: string;
  moneyVnd: number;
  stickers: Record<string, { qty: number; points: number }>;
  totalPoints: number;
};

export type SessionCast = {
  liveSessionId: string;
  organizerId: string;
  /** User được BTC gắn role biểu diễn trong phiên này thôi */
  performerIds: string[];
};

export function sessionRoleOf(cast: SessionCast, userId: string): SessionRole {
  if (userId === cast.organizerId) return "organizer";
  if (cast.performerIds.includes(userId)) return "performer";
  return "guest";
}

/** Ai cũng tặng được ai trong phiên (BTC ↔ khách, khách ↔ nghệ sỹ phiên, khách ↔ khách). */
export function canGiftInSession(fromUserId: string, toUserId: string): boolean {
  return !!fromUserId && !!toUserId && fromUserId !== toUserId;
}

export function stickerPoints(stickerId: string, qty: number, catalog = STICKERS): number {
  const def = catalog.find((s) => s.id === stickerId);
  if (!def) return 0;
  return def.points * Math.max(1, qty);
}

export function applyGift(wh: GiftWarehouse, gift: GiftRecord, catalog = STICKERS): GiftWarehouse {
  const next: GiftWarehouse = {
    ...wh,
    stickers: { ...wh.stickers },
  };
  if (gift.payload.kind === "transfer") {
    if (gift.payload.confirmStatus !== "completed") return wh;
    next.moneyVnd += gift.payload.amountVnd;
  } else {
    const pts = stickerPoints(gift.payload.stickerId, gift.payload.qty, catalog);
    const cur = next.stickers[gift.payload.stickerId] ?? { qty: 0, points: 0 };
    next.stickers[gift.payload.stickerId] = {
      qty: cur.qty + gift.payload.qty,
      points: cur.points + pts,
    };
    next.totalPoints += pts;
  }
  return next;
}

export function sendGift(opts: {
  eventId: string;
  liveSessionId: string;
  fromUserId: string;
  toUserId: string;
  payload: GiftPayload;
  catalog?: StickerDef[];
}): GiftRecord {
  if (!canGiftInSession(opts.fromUserId, opts.toUserId)) {
    throw new Error("Không tự tặng mình / thiếu người nhận.");
  }
  const catalog = opts.catalog ?? STICKERS;
  const points =
    opts.payload.kind === "sticker"
      ? stickerPoints(opts.payload.stickerId, opts.payload.qty, catalog)
      : 0;
  return {
    id: `GIFT-${Date.now()}`,
    eventId: opts.eventId,
    liveSessionId: opts.liveSessionId,
    fromUserId: opts.fromUserId,
    toUserId: opts.toUserId,
    payload: opts.payload,
    pointsAwarded: points,
    createdAt: new Date().toISOString(),
  };
}

export function emptyWarehouse(userId: string): GiftWarehouse {
  return { userId, moneyVnd: 0, stickers: {}, totalPoints: 0 };
}

/** Mở app/ngân hàng theo STK người NHẬN đã kê khai lúc đăng ký user. */
export function bankHandoffUrl(payee: BankProfile, amountVnd: number): string {
  const q = new URLSearchParams({
    bank: payee.bankName,
    acc: payee.accountNumber,
    name: payee.accountName,
    amount: String(amountVnd),
  });
  if (payee.bankAppScheme) {
    return `${payee.bankAppScheme}?${q.toString()}`;
  }
  return `https://dl.vietqr.io/pay?${q.toString()}`;
}

export function startCashGift(opts: {
  eventId: string;
  liveSessionId: string;
  fromUserId: string;
  toUserId: string;
  amountVnd: number;
  payee: BankProfile;
}): { record: GiftRecord; bankUrl: string } {
  const record = sendGift({
    ...opts,
    payload: {
      kind: "transfer",
      amountVnd: opts.amountVnd,
      confirmStatus: "pending",
      showCashStickerOnLive: false,
    },
  });
  return { record, bankUrl: bankHandoffUrl(opts.payee, opts.amountVnd) };
}

/**
 * Xác nhận độc lập với app ngân hàng.
 * completed → thả sticker tiền trên live + cộng kho.
 * incomplete → không hiện sticker trên live.
 */
export function confirmCashGift(
  gift: GiftRecord,
  status: "completed" | "incomplete"
): GiftRecord {
  if (gift.payload.kind !== "transfer") return gift;
  return {
    ...gift,
    payload: {
      ...gift.payload,
      confirmStatus: status,
      showCashStickerOnLive: status === "completed",
    },
  };
}

export function liveCashStickers(gifts: GiftRecord[]): GiftRecord[] {
  return gifts.filter(
    (g) => g.payload.kind === "transfer" && g.payload.showCashStickerOnLive
  );
}
