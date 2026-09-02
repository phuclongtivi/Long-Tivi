import { STICKERS, emptyWarehouse, type GiftWarehouse } from "./gifting";

export const BOSS_STOCK_EACH = 1_000_000;

export function seedBossVault(bossUserId = "boss"): GiftWarehouse {
  const wh = emptyWarehouse(bossUserId);
  for (const s of STICKERS) {
    wh.stickers[s.id] = { qty: BOSS_STOCK_EACH, points: s.points * BOSS_STOCK_EACH };
    wh.totalPoints += s.points * BOSS_STOCK_EACH;
  }
  return wh;
}

export function bossGiveSticker(opts: {
  bossWh: GiftWarehouse;
  userWh: GiftWarehouse;
  stickerId: string;
  qty: number;
}): { bossWh: GiftWarehouse; userWh: GiftWarehouse } {
  const qty = Math.max(1, Math.floor(opts.qty));
  const src = opts.bossWh.stickers[opts.stickerId];
  if (!src || src.qty < qty) throw new Error("Kho Boss không đủ sticker.");
  const defPts = src.qty ? Math.round(src.points / src.qty) : 0;
  const nextBoss = { ...opts.bossWh, stickers: { ...opts.bossWh.stickers } };
  nextBoss.stickers[opts.stickerId] = { qty: src.qty - qty, points: src.points - defPts * qty };
  nextBoss.totalPoints = Math.max(0, nextBoss.totalPoints - defPts * qty);
  const nextUser = { ...opts.userWh, stickers: { ...opts.userWh.stickers } };
  const cur = nextUser.stickers[opts.stickerId] ?? { qty: 0, points: 0 };
  nextUser.stickers[opts.stickerId] = { qty: cur.qty + qty, points: cur.points + defPts * qty };
  nextUser.totalPoints += defPts * qty;
  return { bossWh: nextBoss, userWh: nextUser };
}

export function stickersByTier() {
  const t1 = STICKERS.filter((s) => s.points === 1);
  const t2 = STICKERS.filter((s) => s.points === 2);
  const t3 = STICKERS.filter((s) => s.points === 5);
  return { t1, t2, t3 };
}
