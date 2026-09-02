export type OrderTrackStep =
  | "placed"
  | "await_pay"
  | "paid"
  | "packing"
  | "handed"
  | "shipping"
  | "out"
  | "delivered";

export const TRACK_STEPS: { id: OrderTrackStep; buyer: string; seller: string; icon: string }[] = [
  { id: "placed", buyer: "Đã đặt hàng", seller: "Đơn mới", icon: "🧾" },
  { id: "await_pay", buyer: "Chờ thanh toán", seller: "Chờ khách thanh toán", icon: "💳" },
  { id: "paid", buyer: "Đã thanh toán", seller: "Đã nhận thanh toán", icon: "✅" },
  { id: "packing", buyer: "Shop đang chuẩn bị", seller: "Đóng gói hàng", icon: "📦" },
  { id: "handed", buyer: "Đã giao cho ĐVVC", seller: "Đã bàn giao vận chuyển", icon: "🤝" },
  { id: "shipping", buyer: "Đang vận chuyển", seller: "Hàng đang trên đường", icon: "🚚" },
  { id: "out", buyer: "Đang giao tới bạn", seller: "Shipper đang giao", icon: "🛵" },
  { id: "delivered", buyer: "Đã giao thành công", seller: "Khách đã nhận", icon: "🏠" },
];

export function stepIndex(id: OrderTrackStep): number {
  return TRACK_STEPS.findIndex((s) => s.id === id);
}

/** Map pay/ship → mốc Shopee-like */
export function trackFromFulfill(opts: {
  confirmed: boolean;
  payment: string;
  payStatus: string;
  shipStatus: string;
}): OrderTrackStep {
  if (!opts.confirmed) return "placed";
  if (opts.shipStatus === "delivered") return "delivered";
  if (opts.shipStatus === "shipping") return "shipping";
  if (opts.payStatus === "unpaid" && opts.payment !== "cod") return "await_pay";
  if (opts.payStatus === "paid" && opts.shipStatus === "none") return "paid";
  if (opts.shipStatus === "preparing") return "packing";
  if (opts.payStatus === "pending" && opts.payment === "cod") return "packing";
  return "packing";
}

export function nextTrack(cur: OrderTrackStep): OrderTrackStep {
  const i = stepIndex(cur);
  return TRACK_STEPS[Math.min(TRACK_STEPS.length - 1, i + 1)].id;
}
