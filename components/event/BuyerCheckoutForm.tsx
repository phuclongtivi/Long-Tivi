"use client";

import { useState } from "react";
import { PaymentMethodPicker, type CashPayId } from "./PaymentMethodPicker";
import type { CartLine, Fulfillment } from "./cart-order";
import type { StickerVoucher } from "./sticker-voucher";
import { OrderTrackBar } from "./OrderTrackBar";
import { trackFromFulfill } from "./order-track";
import { printOrderToNotify } from "./order-print";
import { PrintAskModal } from "./PrintAskModal";
import type { CartOrder } from "./cart-order";

export function BuyerCheckoutForm({
  fulfill,
  onChange,
  voucher,
  onVoucher,
  lines = [],
  confirmed = false,
  onConfirmDone,
}: {
  fulfill: Fulfillment;
  onChange: (f: Fulfillment) => void;
  voucher: StickerVoucher;
  onVoucher: (v: StickerVoucher) => void;
  lines?: CartLine[];
  confirmed?: boolean;
  onConfirmDone?: () => void;
}) {
  const set = (p: Partial<Fulfillment>) => onChange({ ...fulfill, ...p });
  const step = trackFromFulfill({
    confirmed: confirmed || (!!fulfill.receiverName && fulfill.shipStatus !== "none"),
    payment: fulfill.payment,
    payStatus: fulfill.payStatus,
    shipStatus: fulfill.shipStatus,
  });
  const [ask, setAsk] = useState(false);
  const [toast, setToast] = useState("");

  const order: CartOrder = {
    confirmed,
    lines,
    fulfill,
  };

  async function doPrint() {
    await printOrderToNotify(order);
    setAsk(false);
    setToast("Đơn hàng đã chuyển vào tab Thông báo.");
    setTimeout(() => setToast(""), 3200);
  }

  return (
    <div style={{ display: "grid", gap: 10, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <OrderTrackBar step={fulfill.shipStatus === "none" && fulfill.payStatus === "unpaid" ? "placed" : step} />
        </div>
        <button
          type="button"
          onClick={() => void doPrint()}
          style={{
            height: 36,
            padding: "0 12px",
            borderRadius: 10,
            border: "none",
            background: "#f43f5e",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          In đơn
        </button>
      </div>

      <fieldset
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 12,
          background: "#fff",
        }}
      >
        <legend style={{ fontWeight: 800, fontSize: 13 }}>Thông tin giao hàng</legend>
        <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600 }}>
          Người nhận
          <input value={fulfill.receiverName} onChange={(e) => set({ receiverName: e.target.value })} />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600, marginTop: 8 }}>
          Số điện thoại
          <input value={fulfill.phone} onChange={(e) => set({ phone: e.target.value })} inputMode="tel" />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600, marginTop: 8 }}>
          Địa chỉ giao hàng
          <textarea value={fulfill.address} onChange={(e) => set({ address: e.target.value })} rows={2} />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 13, fontWeight: 600, marginTop: 8 }}>
          Email nhận thông báo đơn hàng
          <input
            type="email"
            value={fulfill.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="ban@email.com"
          />
        </label>
      </fieldset>

      <PaymentMethodPicker
        cashMethod={(fulfill.payment || "cod") as CashPayId}
        onCashMethod={(id) => set({ payment: id })}
        voucher={voucher}
        onVoucher={onVoucher}
      />

      <button
        type="button"
        onClick={() => {
          onConfirmDone?.();
          setAsk(true);
        }}
        style={{
          height: 46,
          borderRadius: 12,
          border: "none",
          background: "#1a1024",
          color: "#fff",
          fontWeight: 800,
        }}
      >
        Hoàn tất đặt đơn
      </button>

      <PrintAskModal open={ask} onPrint={() => void doPrint()} onSkip={() => setAsk(false)} />

      {toast && (
        <div
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 88,
            background: "#1a1024",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 12,
            fontSize: 13,
            zIndex: 90,
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
