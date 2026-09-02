import type { CartOrder } from "./cart-order";
import type { NotifyItem } from "./NotifyInbox";
import { TRACK_STEPS, trackFromFulfill, type OrderTrackStep } from "./order-track";

const KEY = "pl-order-notices";
const MAIL_KEY = "pl-order-mail-log";

export type OrderParty = "buyer" | "seller";

export type OrderMail = {
  to: string;
  party: OrderParty;
  step: OrderTrackStep;
  subject: string;
  body: string;
  at: string;
};

export function orderStatusLabel(order: CartOrder): string {
  const step = trackFromFulfill({
    confirmed: order.confirmed,
    payment: order.fulfill.payment,
    payStatus: order.fulfill.payStatus,
    shipStatus: order.fulfill.shipStatus,
  });
  const meta = TRACK_STEPS.find((s) => s.id === step)!;
  return `${meta.buyer} · TT ${order.fulfill.payStatus} · GH ${order.fulfill.shipStatus}`;
}

function mailCopy(party: OrderParty, step: OrderTrackStep, order: CartOrder): { subject: string; body: string } {
  const meta = TRACK_STEPS.find((s) => s.id === step)!;
  const title = party === "buyer" ? meta.buyer : meta.seller;
  const lines = order.lines.map((l) => `• ${l.name} ×${l.qty}`).join("\n");
  const subject = `[Phúc Long superBUY™] ${title}`;
  const body =
    party === "buyer"
      ? `Xin chào ${order.fulfill.receiverName || "bạn"},\n\nĐơn hàng: ${title}\n${lines}\n\nGiao tới: ${order.fulfill.address}\nSĐT: ${order.fulfill.phone}\n\nBạn sẽ nhận email ở mỗi mốc: đặt hàng → thanh toán → đóng gói → bàn giao ĐVVC → đang giao → đã nhận (tần suất giống Shopee).\n`
      : `Đơn bên bán vừa cập nhật: ${title}\nNgười nhận: ${order.fulfill.receiverName} · ${order.fulfill.phone}\n${lines}\n`;
  return { subject, body };
}

export function orderNoticesFrom(order: CartOrder, party: OrderParty): NotifyItem[] {
  const step = trackFromFulfill({
    confirmed: order.confirmed,
    payment: order.fulfill.payment,
    payStatus: order.fulfill.payStatus,
    shipStatus: order.fulfill.shipStatus,
  });
  const meta = TRACK_STEPS.find((s) => s.id === step)!;
  const title = party === "buyer" ? meta.buyer : meta.seller;
  const body = `${order.lines.map((l) => `${l.name} ×${l.qty}`).join(", ")} · ${meta.icon} ${title}`;
  return [
    {
      id: `ord-${party}-${step}-${order.lines.map((l) => l.productId).join("-")}`,
      title,
      body,
      at: new Date().toISOString(),
      href: "/shop/cart",
    },
  ];
}

export function loadOrderNotices(): NotifyItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as NotifyItem[];
  } catch {
    return [];
  }
}

export function pushOrderNotice(item: NotifyItem) {
  if (typeof localStorage === "undefined") return;
  const next = [item, ...loadOrderNotices()].slice(0, 80);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function loadMailLog(): OrderMail[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MAIL_KEY) || "[]") as OrderMail[];
  } catch {
    return [];
  }
}

/** Push 1 email / 1 bên / 1 mốc — không gửi trùng mốc (tần suất Shopee). */
export function enqueueMail(mail: OrderMail) {
  const log = loadMailLog();
  const dup = log.some((m) => m.to === mail.to && m.step === mail.step && m.party === mail.party);
  if (dup) return false;
  localStorage.setItem(MAIL_KEY, JSON.stringify([mail, ...log].slice(0, 200)));
  return true;
}

export function notifyOrderParties(order: CartOrder, forceStep?: OrderTrackStep) {
  const step =
    forceStep ??
    trackFromFulfill({
      confirmed: order.confirmed,
      payment: order.fulfill.payment,
      payStatus: order.fulfill.payStatus,
      shipStatus: order.fulfill.shipStatus,
    });

  const parties: { party: OrderParty; email?: string }[] = [
    { party: "buyer", email: order.fulfill.email },
    { party: "seller", email: order.fulfill.sellerEmail },
  ];

  for (const { party, email } of parties) {
    const [n] = orderNoticesFrom(order, party);
    pushOrderNotice({ ...n, id: n.id + "-" + Date.now() });
    if (!email?.trim()) continue;
    const copy = mailCopy(party, step, order);
    const fresh = enqueueMail({
      to: email.trim(),
      party,
      step,
      subject: copy.subject,
      body: copy.body,
      at: new Date().toISOString(),
    });
    if (fresh && typeof window !== "undefined" && party === "buyer") {
      window.open(
        `mailto:${email.trim()}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(copy.body)}`,
        "_self"
      );
    }
  }
}

/** Gọi khi shop/shipper đổi mốc — 1 push / 1 bước. */
export function pushTrackChange(order: CartOrder, step: OrderTrackStep) {
  notifyOrderParties(order, step);
}
