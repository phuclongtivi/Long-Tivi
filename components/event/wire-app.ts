/**
 * Liên thông luồng chính — checkpoint 2026-08-28 21:10 +07
 */
import { sendGift, emptyWarehouse, type GiftRecord, type GiftWarehouse } from "./gifting";
import { earnFromReceivedSticker, spendToSendSticker, emptyPoints } from "./points";
import { unlockState, applyUnlockedPacks, type CccdProfile } from "./gift-unlock";
import type { AppRole } from "./roles";
import { overlaySlot } from "./live-sticker-overlay";
import { spendRewards, pointsForVnd } from "./rewards-spend";
import { seedBossVault, bossGiveSticker, BOSS_STOCK_EACH } from "./boss-vault";
import { STICKER_PRODUCTS, STICKER_SHOPS } from "./sticker-shops";
import { STICKER_PACK_QTY } from "./boss-bank";
import { TIER1_STICKERS } from "./stickers-tier1";
import { TIER2_STICKERS } from "./stickers-tier2";
import { TIER3_STICKERS } from "./stickers-tier3";

export function afterUnlock(userId: string, role: AppRole, cccd: CccdProfile | null, already: (1 | 2 | 3)[]) {
  const state = unlockState(role, cccd);
  const pack = applyUnlockedPacks(userId, already, state.unlockedTiers);
  return { state, ...pack };
}

export function giftOnLive(opts: Parameters<typeof sendGift>[0] & { overlayIndex?: number }) {
  const record = sendGift(opts);
  const slot = overlaySlot(opts.overlayIndex ?? 0);
  return { record, overlay: record.payload.kind === "sticker" ? slot : null };
}

export function ticketWithPoints(priceVnd: number, accept: boolean, capVnd: number, balance: number) {
  if (!accept) return { payVnd: priceVnd, pointsUsed: 0 };
  const off = Math.min(priceVnd, capVnd, balance * 1000);
  return { payVnd: Math.max(0, priceVnd - off), pointsUsed: pointsForVnd(off) };
}

const POOLS = { 1: TIER1_STICKERS, 2: TIER2_STICKERS, 3: TIER3_STICKERS };

/** Mua gói sticker 5 cái → trừ kho Boss, cộng kho user (random trong cấp). */
export function fulfillStickerPack(opts: {
  bossWh: GiftWarehouse;
  userWh: GiftWarehouse;
  tier: 1 | 2 | 3;
  qty?: number;
}) {
  const qty = opts.qty ?? STICKER_PACK_QTY;
  const pool = POOLS[opts.tier];
  let bossWh = opts.bossWh;
  let userWh = opts.userWh;
  const granted: string[] = [];
  for (let i = 0; i < qty; i++) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const res = bossGiveSticker({
      bossWh,
      userWh,
      stickerId: pick.id,
      qty: 1,
    });
    bossWh = res.bossWh;
    userWh = res.userWh;
    granted.push(pick.id);
  }
  return { bossWh, userWh, granted, pay: "bank-qr" as const };
}

export {
  emptyWarehouse,
  emptyPoints,
  spendRewards,
  spendToSendSticker,
  earnFromReceivedSticker,
  seedBossVault,
  bossGiveSticker,
  STICKER_PRODUCTS,
  STICKER_SHOPS,
  BOSS_STOCK_EACH,
};
export type { GiftRecord, GiftWarehouse };
