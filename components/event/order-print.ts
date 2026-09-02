import type { CartOrder } from "./cart-order";
import { TRACK_STEPS, trackFromFulfill, type OrderTrackStep } from "./order-track";
import { expiresAtFrom, pushNotice } from "./notify-store";

export function renderOrderJpeg(order: CartOrder): Promise<string> {
  const step: OrderTrackStep = trackFromFulfill({
    confirmed: order.confirmed,
    payment: order.fulfill.payment,
    payStatus: order.fulfill.payStatus,
    shipStatus: order.fulfill.shipStatus,
  });
  const cur = TRACK_STEPS.findIndex((s) => s.id === step);
  const w = 900;
  const h = 1280;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1a1024");
  g.addColorStop(1, "#3b1020");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 36px Inter, sans-serif";
  ctx.fillText("Phúc Long superBUY™", 40, 70);
  ctx.font = "22px Inter, sans-serif";
  ctx.fillStyle = "#fb7185";
  ctx.fillText("Đơn đặt hàng · " + (TRACK_STEPS[cur]?.buyer ?? ""), 40, 110);

  TRACK_STEPS.forEach((s, i) => {
    const x = 40 + i * 105;
    ctx.beginPath();
    ctx.arc(x + 20, 180, i <= cur ? 16 : 12, 0, Math.PI * 2);
    ctx.fillStyle = i <= cur ? "#f43f5e" : "#4b3a58";
    ctx.fill();
    if (i < TRACK_STEPS.length - 1) {
      ctx.fillStyle = i < cur ? "#f43f5e" : "#4b3a58";
      ctx.fillRect(x + 36, 177, 70, 6);
    }
    ctx.fillStyle = i <= cur ? "#fff" : "#9ca3af";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText(s.buyer.slice(0, 12), x - 8, 220);
  });

  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Inter, sans-serif";
  ctx.fillText("Người nhận: " + order.fulfill.receiverName, 40, 280);
  ctx.font = "18px Inter, sans-serif";
  ctx.fillText("SĐT: " + order.fulfill.phone, 40, 316);
  wrap(ctx, "Địa chỉ: " + order.fulfill.address, 40, 352, 820, 26);
  ctx.fillText("Email: " + order.fulfill.email, 40, 430);
  ctx.fillText("Thanh toán: " + (order.fulfill.payment || "—"), 40, 466);

  let y = 530;
  ctx.font = "bold 22px Inter, sans-serif";
  ctx.fillText("Sản phẩm", 40, y);
  y += 36;
  ctx.font = "18px Inter, sans-serif";
  let sum = 0;
  order.lines.forEach((l) => {
    const line = l.priceVnd * l.qty;
    sum += line;
    ctx.fillText(`${l.name}  ×${l.qty}`, 40, y);
    ctx.fillText(line.toLocaleString("vi-VN") + "đ", 620, y);
    y += 32;
  });
  ctx.font = "bold 24px Inter, sans-serif";
  ctx.fillStyle = "#fb7185";
  ctx.fillText("Tổng: " + sum.toLocaleString("vi-VN") + "đ", 40, y + 20);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText("In từ timeline đơn · lưu 30 ngày trên tab Thông báo", 40, h - 40);

  return Promise.resolve(c.toDataURL("image/jpeg", 0.92));
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > max) {
      ctx.fillText(line, x, yy);
      line = w + " ";
      yy += lh;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
}

export async function printOrderToNotify(order: CartOrder): Promise<string> {
  const jpeg = await renderOrderJpeg(order);
  pushNotice({
    id: "print-" + Date.now(),
    title: "Đơn đã in",
    body: order.lines.map((l) => l.name).join(", ") || "Đơn hàng superBUY",
    at: new Date().toISOString(),
    expiresAt: expiresAtFrom(),
    imageUrl: jpeg,
    kind: "order-print",
    href: "/notify",
  });
  return jpeg;
}
