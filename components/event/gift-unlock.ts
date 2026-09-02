import type { AppRole } from "./roles";
import type { GiftWarehouse } from "./gifting";
import { emptyWarehouse } from "./gifting";
import { TIER1_GRANT_COUNT, TIER1_POINT, TIER1_STICKERS } from "./stickers-tier1";
import { TIER2_GRANT_COUNT, TIER2_POINT, TIER2_STICKERS } from "./stickers-tier2";
import { TIER3_GRANT_COUNT, TIER3_POINT, TIER3_STICKERS } from "./stickers-tier3";

export type GiftTier = 1 | 2 | 3;

export type CccdProfile = {
  fullName: string;
  idNumber: string;
};

export type UnlockState = {
  warehouseOpen: boolean;
  unlockedTiers: GiftTier[];
  cccdOk: boolean;
};

export function isCccdComplete(p?: CccdProfile | null): boolean {
  if (!p) return false;
  const name = p.fullName.trim();
  const id = p.idNumber.replace(/\s/g, "");
  const nameOk = name.length >= 2 && /[\p{L}]/u.test(name);
  const idOk = /^\d{9}$|^\d{12}$/.test(id);
  return nameOk && idOk;
}

/**
 * Đợt 1: user mới + CCCD (họ tên + số) → mở kho + quà cấp 1
 * Đợt 2: hạng Phóng viên → quà cấp 2
 * Đợt 3: hạng Nghệ sỹ → quà cấp 3
 * Admin/Boss: đủ 3 đợt khi đã có CCCD.
 */
export function giftTiersFor(
  role: AppRole | undefined | null,
  cccd?: CccdProfile | null,
  earnedPoints = 0
): GiftTier[] {
  if (!isCccdComplete(cccd)) return [];
  const tiers: GiftTier[] = [1];
  const byRole2 =
    role === "journalist" || role === "artist" || role === "admin" || role === "boss";
  const byRole3 = role === "artist" || role === "admin" || role === "boss";
  if (byRole2 || earnedPoints >= 20) tiers.push(2);
  if (byRole3 || earnedPoints >= 100) tiers.push(3);
  return tiers;
}

export function unlockState(
  role: AppRole | undefined | null,
  cccd?: CccdProfile | null,
  earnedPoints = 0
): UnlockState {
  const tiers = giftTiersFor(role, cccd, earnedPoints);
  return {
    warehouseOpen: tiers.length > 0,
    unlockedTiers: tiers,
    cccdOk: isCccdComplete(cccd),
  };
}

/** Quà mở khoá theo cấp — lát gán sticker/điểm khi có bộ quy tắc. */
export type TierGiftPack = {
  tier: GiftTier;
  stickerIds: string[];
  bonusPoints: number;
};

export const TIER_PACKS: TierGiftPack[] = [
  { tier: 1, stickerIds: [], bonusPoints: 0 },
  { tier: 2, stickerIds: [], bonusPoints: 0 },
  { tier: 3, stickerIds: [], bonusPoints: 0 },
];

export function grantTier1Random(count = TIER1_GRANT_COUNT): string[] {
  const pool = [...TIER1_STICKERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length)).map((s) => s.id);
}

export function grantTier2Random(count = TIER2_GRANT_COUNT): string[] {
  const pool = [...TIER2_STICKERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length)).map((s) => s.id);
}

export function grantTier3Random(count = TIER3_GRANT_COUNT): string[] {
  const pool = [...TIER3_STICKERS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length)).map((s) => s.id);
}

export function applyUnlockedPacks(
  userId: string,
  already: GiftTier[],
  nextTiers: GiftTier[],
  warehouse: GiftWarehouse = emptyWarehouse(userId)
): { warehouse: GiftWarehouse; newlyGranted: GiftTier[] } {
  const newly = nextTiers.filter((t) => !already.includes(t));
  const nextWh = { ...warehouse, stickers: { ...warehouse.stickers } };
  for (const tier of newly) {
    const pack = TIER_PACKS.find((p) => p.tier === tier);
    if (!pack) continue;
    const ids = tier === 1 ? grantTier1Random() : tier === 2 ? grantTier2Random() : tier === 3 ? grantTier3Random() : pack.stickerIds;
    const pts = tier === 1 ? ids.length * TIER1_POINT : tier === 2 ? ids.length * TIER2_POINT : tier === 3 ? ids.length * TIER3_POINT : pack.bonusPoints;
    nextWh.totalPoints += pts;
    for (const id of ids) {
      const cur = nextWh.stickers[id] ?? { qty: 0, points: 0 };
      nextWh.stickers[id] = { qty: cur.qty + 1, points: cur.points + (tier === 1 ? TIER1_POINT : tier === 2 ? TIER2_POINT : tier === 3 ? TIER3_POINT : 0) };
    }
  }
  return { warehouse: nextWh, newlyGranted: newly };
}

export const UNLOCK_HINT = {
  needCccd: "Điền đúng họ tên + số CCCD để mở kho quà và nhận quà lần 1.",
  tier2: "Lên hạng Phóng viên hoặc đủ 20 điểm (gói cấp 2) để mở quà cấp 2.",
  tier3: "Lên hạng Nghệ sỹ hoặc đủ 100 điểm (gói cấp 3) để mở quà cấp 3.",
  holdRank: "Đã lên hạng thì không xuống, trừ khi Admin/Boss gắn đủ 2 cảnh báo.",
} as const;
