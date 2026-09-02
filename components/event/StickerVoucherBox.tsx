"use client";

import { POINT_TO_VND, STICKER_VOUCHER_HINT_BUYER, STICKER_VOUCHER_HINT_SELLER, type StickerVoucher, vndFromPoints } from "./sticker-voucher";

export function StickerVoucherBox({
  value,
  onChange,
  side = "seller",
}: {
  value: StickerVoucher;
  onChange: (v: StickerVoucher) => void;
  side?: "seller" | "buyer";
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 10,
        borderRadius: 12,
        border: "1px solid #E11D48",
        background: "rgba(225,29,72,.06)",
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 800, margin: "0 0 6px" }}>
        4. Phiếu giảm giá · điểm sticker
      </p>
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
        <input
          type="checkbox"
          checked={value.apply}
          onChange={(e) => onChange({ ...value, apply: e.target.checked })}
        />
        Áp dụng điểm sticker (1 điểm = {POINT_TO_VND.toLocaleString("vi-VN")}đ)
      </label>
      {value.apply && (
        <>
          <label style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 13, fontWeight: 600 }}>
            Số tiền phiếu giảm giá (đ)
            <input
              inputMode="numeric"
              value={value.voucherVnd || ""}
              onChange={(e) =>
                onChange({ ...value, voucherVnd: Number(e.target.value.replace(/\D/g, "")) || 0 })
              }
            />
          </label>
          <label style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 13, fontWeight: 600 }}>
            Điểm sticker tối đa đổi vào phiếu
            <input
              inputMode="numeric"
              value={value.maxPoints || ""}
              onChange={(e) =>
                onChange({ ...value, maxPoints: Number(e.target.value.replace(/\D/g, "")) || 0 })
              }
            />
          </label>
          <p style={{ fontSize: 12, margin: "6px 0 0" }}>
            Tối đa {vndFromPoints(value.maxPoints).toLocaleString("vi-VN")}đ từ điểm.
          </p>
        </>
      )}
      <p style={{ fontSize: 11, color: "var(--pl-muted,#C5D0E8)", lineHeight: 1.45, margin: "8px 0 0" }}>
        {side === "buyer" ? STICKER_VOUCHER_HINT_BUYER : STICKER_VOUCHER_HINT_SELLER}
      </p>
    </div>
  );
}
