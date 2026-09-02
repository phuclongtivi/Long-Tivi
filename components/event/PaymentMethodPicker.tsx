"use client";

import { StickerVoucherBox } from "./StickerVoucherBox";
import type { StickerVoucher } from "./sticker-voucher";

export type CashPayId =
  | "cod"
  | "apple-pay"
  | "bank-qr"
  | "card-visa-master"
  | "zalopay"
  | "momo"
  | "bank-transfer";

const DIGITAL: { id: CashPayId; label: string }[] = [
  { id: "apple-pay", label: "1. Apple Pay" },
  { id: "bank-qr", label: "2. Chuyển khoản QR ngân hàng (kiểu ShopeeFood)" },
  { id: "card-visa-master", label: "3. Thẻ tín dụng / debit Visa · Mastercard" },
];

type Props = {
  cashMethod: CashPayId;
  onCashMethod: (id: CashPayId) => void;
  voucher: StickerVoucher;
  onVoucher: (v: StickerVoucher) => void;
  title?: string;
};

export function PaymentMethodPicker({
  cashMethod,
  onCashMethod,
  voucher,
  onVoucher,
  title = "Phương thức thanh toán superBUY™",
}: Props) {
  return (
    <fieldset
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 12,
        background: "var(--pl-surface)",
      }}
    >
      <legend style={{ fontWeight: 800, fontSize: 13 }}>{title}</legend>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 12,
          background: cashMethod === "cod" ? "rgba(225,29,72,.12)" : "#fff",
          border: "1px solid #E11D48",
          marginBottom: 10,
        }}
      >
        <input
          type="radio"
          name="pl-cash-pay"
          checked={cashMethod === "cod"}
          onChange={() => onCashMethod("cod")}
        />
        <div>
          <div style={{ fontWeight: 800, fontSize: 13 }}>Tiền mặt khi giao hàng (COD)</div>
          <div style={{ fontSize: 11, color: "var(--pl-muted,#C5D0E8)" }}>Thanh toán cho shipper khi nhận hàng</div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: "#666", margin: "0 0 6px" }}>Hoặc thanh toán trước</p>
      <div style={{ display: "grid", gap: 8 }}>
        {DIGITAL.map((o) => (
          <label key={o.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
            <input
              type="radio"
              name="pl-cash-pay"
              checked={cashMethod === o.id}
              onChange={() => onCashMethod(o.id)}
            />
            {o.label}
          </label>
        ))}
      </div>
      <StickerVoucherBox value={voucher} onChange={onVoucher} />
    </fieldset>
  );
}
