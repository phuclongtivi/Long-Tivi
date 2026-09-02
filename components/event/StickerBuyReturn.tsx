"use client";

import { useState } from "react";
import { STICKER_BILL_HINT } from "./organizer-points";

type Props = {
  username: string;
  returnToCreate: () => void;
};

export function StickerBuyReturn({ username, returnToCreate }: Props) {
  const [handle, setHandle] = useState(username.startsWith("@") ? username : `@${username}`);
  const [qty, setQty] = useState("10");
  const [tier, setTier] = useState<"1" | "2" | "3">("1");

  return (
    <section style={{ background: "var(--pl-surface)", borderRadius: 14, padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Gian hàng sticker · superBUY™</h3>
      <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>{STICKER_BILL_HINT}</p>
      <label>@Username
        <input value={handle} onChange={(e) => setHandle(e.target.value)} />
      </label>
      <label>Số lượng sticker
        <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
      </label>
      <label>Loại
        <select value={tier} onChange={(e) => setTier(e.target.value as "1" | "2" | "3")}>
          <option value="1">Loại 1 (1 điểm / sticker)</option>
          <option value="2">Loại 2 (2 điểm / sticker)</option>
          <option value="3">Loại 3 (5 điểm / sticker)</option>
        </select>
      </label>
      <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>
        Boss/Admin gửi sticker vào kho sau. Có thể tiếp tục tạo sự kiện — điểm được phép âm.
      </p>
      <button
        type="button"
        className="ev-publish"
        onClick={() => {
          try {
            sessionStorage.setItem(
              "pl-sticker-order",
              JSON.stringify({ handle, qty, tier, at: Date.now() })
            );
          } catch {
            /* ignore */
          }
          returnToCreate();
        }}
      >
        Hoàn tất — quay lại khởi tạo sự kiện
      </button>
    </section>
  );
}
