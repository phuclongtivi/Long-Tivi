"use client";

import { useMemo, useState } from "react";
import { AUDIENCE_FEE_TIERS, extraFeeForCapRaise } from "./live-room-cost";
import { StickerBuyReturn } from "./StickerBuyReturn";

export function LiveAudienceCapControl({
  paidCap,
  currentCap,
  username = "user",
  onApply,
}: {
  paidCap: number;
  currentCap: number;
  username?: string;
  onApply: (newCap: number, extraPoints: number) => void;
}) {
  const [cap, setCap] = useState(String(currentCap || paidCap || 200));
  const n = Math.max(0, Number(cap) || 0);
  const extra = useMemo(
    () => extraFeeForCapRaise({ paidCap, newCap: n, kind: "audience" }).extra,
    [paidCap, n]
  );
  const tier = AUDIENCE_FEE_TIERS.find((t) => n >= t.min && n <= t.max);

  return (
    <section className="ev-form">
      <h3 style={{ marginTop: 0 }}>Giới hạn khán giả</h3>
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        Đổi được từ lúc tạo phòng đến khi kết thúc. Đã thanh toán mốc {paidCap.toLocaleString("vi-VN")}.
      </p>
      <label>
        Trần khán giả mới
        <input value={cap} inputMode="numeric" onChange={(e) => setCap(e.target.value)} />
      </label>
      <p style={{ fontSize: 13 }}>
        {n <= (paidCap || 0)
          ? "Không tăng phí (bằng hoặc thấp hơn mốc đã trả)."
          : `Bạn cần có ${extra} điểm sticker cho phần tăng thêm (mốc ${tier?.points ?? 0} − đã trả).`}
      </p>
      {n > paidCap && extra > 0 && (
        <>
          <button type="button" className="ev-publish" onClick={() => onApply(n, extra)}>
            Trừ {extra} điểm + sticker
          </button>
          <StickerBuyReturn username={username} returnToCreate={() => onApply(n, extra)} />
        </>
      )}
      {n > paidCap && extra === 0 && (
        <button type="button" className="ev-publish" onClick={() => onApply(n, 0)}>
          Cập nhật trần
        </button>
      )}
    </section>
  );
}
