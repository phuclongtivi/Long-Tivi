/** Phí phòng live bằng điểm sticker. App không trần số phòng / số xem — BTC tự khai. */

export type CastRole = "nghe-sy" | "mc" | "phong-vien" | "khach-moi";

export type CastMember = {
  name: string;
  role: CastRole;
};

export const CAST_ROLE_LABEL: Record<CastRole, string> = {
  "nghe-sy": "Nghệ sỹ",
  mc: "MC",
  "phong-vien": "Phóng viên",
  "khach-moi": "Khách mời",
};

/** Ô điền trên form: thành viên tổ chức + khách mời, tối đa 10 dòng */
export const CAST_FORM_MAX = 10;
/** Khách mời miễn phí */
export const FREE_GUESTS = 5;

export const GUEST_FEE_TIERS: { min: number; max: number; points: number }[] = [
  { min: 0, max: 5, points: 0 },
  { min: 6, max: 10, points: 200 },
  { min: 11, max: 15, points: 1000 },
  { min: 16, max: 20, points: 2000 },
  { min: 21, max: 49, points: 3500 },
  { min: 50, max: 100, points: 5000 },
  { min: 101, max: 1000, points: 20000 },
  { min: 1001, max: Number.POSITIVE_INFINITY, points: 100000 },
];

export const AUDIENCE_FEE_TIERS: { min: number; max: number; points: number }[] = [
  { min: 0, max: 200, points: 0 },
  { min: 201, max: 500, points: 1000 },
  { min: 501, max: 1000, points: 2000 },
  { min: 1001, max: 5000, points: 5000 },
  { min: 5001, max: 10000, points: 10000 },
  { min: 10001, max: Number.POSITIVE_INFINITY, points: 20000 },
];

export function feeForCount(
  n: number,
  tiers: { min: number; max: number; points: number }[]
): number {
  const x = Math.max(0, Math.floor(n));
  const hit = tiers.find((t) => x >= t.min && x <= t.max);
  return hit?.points ?? 0;
}

export function guestSeatFee(guestCount: number): number {
  return feeForCount(guestCount, GUEST_FEE_TIERS);
}

export function audienceFee(audienceCap: number): number {
  return feeForCount(audienceCap, AUDIENCE_FEE_TIERS);
}

export function liveRoomPointsDue(opts: { guestCount: number; audienceCap: number }) {
  const guests = guestSeatFee(opts.guestCount);
  const audience = audienceFee(opts.audienceCap);
  return { guests, audience, total: guests + audience };
}

/** Chỉ thu phần tăng trần khán giả / khách mời so với mức đã trả. */
export function extraFeeForCapRaise(opts: {
  paidCap: number;
  newCap: number;
  kind: "audience" | "guest";
}): { paidFee: number; newFee: number; extra: number } {
  const tiers = opts.kind === "audience" ? AUDIENCE_FEE_TIERS : GUEST_FEE_TIERS;
  const paidFee = feeForCount(opts.paidCap, tiers);
  const newFee = feeForCount(opts.newCap, tiers);
  return { paidFee, newFee, extra: Math.max(0, newFee - paidFee) };
}

/** Cấu hình tiết kiệm — không khóa số phòng / số xem ở tầng app */
export type LiveRoomMode = "broadcast" | "interactive";

export type LiveRoomPlan = {
  mode: LiveRoomMode;
  /** Trần khán giả do BTC nhập (0 = không khai) */
  audienceCap: number;
  /** Số khách mời BTC khai (tính phí) */
  guestCount: number;
  hostMaxPx: 720;
  viewerDefaultPx: 480;
  guestOnStagePx: 720;
  maxRtcOnStage: number;
  recordByDefault: false;
  overlayOnClient: true;
  phucTapOnly: true;
};

export function defaultLiveRoomPlan(audienceCap: number, guestCount: number): LiveRoomPlan {
  const onStage = Math.min(CAST_FORM_MAX, Math.max(1, guestCount + 1));
  return {
    mode: audienceCap > 200 ? "broadcast" : "interactive",
    audienceCap,
    guestCount,
    hostMaxPx: 720,
    viewerDefaultPx: 480,
    guestOnStagePx: 720,
    maxRtcOnStage: onStage,
    recordByDefault: false,
    overlayOnClient: true,
    phucTapOnly: true,
  };
}

export const GUEST_PERKS = [
  "Ghế đầu trên màn hình sự kiện (ô lớn, sát host).",
  "Độ phân giải cao (720p) khi lên sóng — khán giả thường 480p HLS.",
  "Tương tác AI Phúc bán hàng: chạm sản phẩm, ghim link superBUY.",
  "Được tặng / nhận quà và hiện tên trên overlay (không che mặt).",
  "Gắn role phiên (không liên quan hạng app) do BTC chọn.",
];
