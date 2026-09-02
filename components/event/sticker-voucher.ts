import { POINT_TO_VND, vndFromPoints, pointsFromVnd } from "./sticker-pay";

export { POINT_TO_VND, vndFromPoints, pointsFromVnd };

export type StickerVoucher = {
  apply: boolean;
  /** Số tiền phiếu giảm giá người bán điền (VND) */
  voucherVnd: number;
  /** Điểm sticker tối đa được đổi vào phiếu (1 điểm = 1.000đ) */
  maxPoints: number;
};

export const STICKER_VOUCHER_HINT_SELLER =
  "Phiếu giảm giá riêng. Tick áp dụng điểm sticker thì 1 điểm = 1.000đ. Người mua trừ điểm + sticker trong kho; người bán nhận thông báo đã áp dụng phiếu.";

export const STICKER_VOUCHER_HINT_BUYER =
  "Đơn này được trừ bằng phiếu giảm giá từ điểm sticker (1 điểm = 1.000đ). Điểm và sticker tương ứng sẽ ra khỏi kho của bạn.";

export function capVoucherVnd(v: StickerVoucher, orderVnd: number): number {
  if (!v.apply) return 0;
  const fromPts = vndFromPoints(v.maxPoints);
  const want = Math.max(v.voucherVnd, 0);
  const cap = Math.min(want || fromPts, fromPts || want, Math.max(0, orderVnd));
  return cap;
}

export function pointsToSpend(v: StickerVoucher, orderVnd: number): number {
  return pointsFromVnd(capVoucherVnd(v, orderVnd));
}

export function voucherNotice(side: "buyer" | "seller", v: StickerVoucher, orderVnd: number): string {
  if (!v.apply) return "";
  const off = capVoucherVnd(v, orderVnd);
  const pts = pointsFromVnd(off);
  if (side === "seller") {
    return `Người bán đã mở phiếu giảm giá ${off.toLocaleString("vi-VN")}đ ≈ ${pts} điểm sticker (1 điểm = 1.000đ).`;
  }
  return `Người mua được trừ ${off.toLocaleString("vi-VN")}đ bằng ${pts} điểm sticker. Kho quà sẽ trừ tương ứng.`;
}
