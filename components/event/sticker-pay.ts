/** Thanh toán bằng điểm sticker. 1 điểm = 1.000đ. */

export const POINT_TO_VND = 1000;

/** Điểm / 1 sticker theo 3 cấp đã chốt */
export const STICKER_TIER_POINTS = {
  1: 1, // 1.000đ
  2: 2, // 2.000đ
  3: 5, // 5.000đ
} as const;

export function vndFromPoints(points: number): number {
  return Math.max(0, Math.floor(points)) * POINT_TO_VND;
}

export function pointsFromVnd(vnd: number): number {
  if (vnd <= 0) return 0;
  return Math.ceil(vnd / POINT_TO_VND);
}

export function stickerValueVnd(tier: 1 | 2 | 3, qty = 1): number {
  return STICKER_TIER_POINTS[tier] * POINT_TO_VND * Math.max(0, qty);
}

export const STICKER_PAY_HINT =
  "Cấp 1 = 1 điểm = 1.000đ · Cấp 2 = 2 điểm = 2.000đ · Cấp 3 = 5 điểm = 5.000đ. Hệ thống trừ sticker + điểm trong kho quà của người mua, chuyển sang kho người nhận.";
