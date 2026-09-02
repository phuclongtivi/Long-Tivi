/** Thanh toán người mua + Boss gắn ĐVVC */

export type PayMethod =
  | "cod"
  | "bank-transfer"
  | "card-visa-master"
  | "zalopay"
  | "momo"
  | "points-voucher"
  | "sticker-points";

export const PAY_METHODS: {
  id: PayMethod;
  label: string;
  how: string;
}[] = [
  {
    id: "cod",
    label: "COD — nhận hàng trả tiền",
    how: "Khách chọn khi xác nhận đơn. Thanh toán khi nhận. Trạng thái: pending → paid khi giao xong.",
  },
  {
    id: "bank-transfer",
    label: "Chuyển khoản",
    how: "Mở app ngân hàng theo STK người bán / BTC đã kê khai hồ sơ user. App không thu hộ. Khách xác nhận đã/chưa CK.",
  },
  {
    id: "points-voucher",
    label: "Điểm thưởng (voucher)",
    how: "Trừ một phần hoặc hết giá hàng/vé nếu shop/BTC tick áp dụng điểm. Phần còn lại COD hoặc CK.",
  },
  {
    id: "sticker-points",
    label: "Điểm + sticker (1 điểm = 1.000đ)",
    how: "Cấp 1 = 1 điểm, cấp 2 = 2 điểm, cấp 3 = 5 điểm. BTC/shop chọn Có hoặc Không trên dashboard. Khách trừ sticker trong kho quà.",
  },
];

export type Carrier = {
  id: string;
  name: string;
  trackUrlTemplate: string; // chứa {code}
};

export const DEFAULT_CARRIERS: Carrier[] = [
  { id: "ghn", name: "Giao Hàng Nhanh", trackUrlTemplate: "https://donhang.ghn.vn/?order_code={code}" },
  { id: "ghtk", name: "Giao Hàng Tiết Kiệm", trackUrlTemplate: "https://i.ghtk.vn/{code}" },
  { id: "viettelpost", name: "Viettel Post", trackUrlTemplate: "https://viettelpost.com.vn/tra-cuu-hanh-trinh?code={code}" },
  { id: "jnt", name: "J&T Express", trackUrlTemplate: "https://jtexpress.vn/vi/tracking?type=track&billcode={code}" },
  { id: "other", name: "Đơn vị khác", trackUrlTemplate: "{code}" },
];

export type BossShipment = {
  orderId: string;
  carrierId: string;
  trackingCode: string;
  trackUrl: string;
  attachedBy: "boss";
  attachedAt: string;
};

/** Link Boss dán mã vận đơn + chọn ĐVVC */
export function bossAttachCarrier(opts: {
  orderId: string;
  carrierId: string;
  trackingCode: string;
}): BossShipment {
  const c = DEFAULT_CARRIERS.find((x) => x.id === opts.carrierId) ?? DEFAULT_CARRIERS[4];
  const code = opts.trackingCode.trim();
  const trackUrl = c.trackUrlTemplate.includes("{code}")
    ? c.trackUrlTemplate.replace("{code}", encodeURIComponent(code))
    : code;
  return {
    orderId: opts.orderId,
    carrierId: c.id,
    trackingCode: code,
    trackUrl,
    attachedBy: "boss",
    attachedAt: new Date().toISOString(),
  };
}

/** Đường dẫn trong app cho Boss */
export const BOSS_SHIP_PATH = "/boss/orders/:orderId/ship";
export function bossShipLink(orderId: string) {
  return `/boss/orders/${encodeURIComponent(orderId)}/ship`;
}
