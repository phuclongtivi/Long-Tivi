"use client";

import { useState } from "react";
import {
  STICKERS,
  sendGift,
  startCashGift,
  confirmCashGift,
  type BankProfile,
  type GiftRecord,
} from "./gifting";

type Props = {
  eventId: string;
  liveSessionId: string;
  fromUserId: string;
  toUserId: string;
  toLabel: string;
  /** STK người nhận đã kê khai lúc đăng ký user */
  payeeBank?: BankProfile;
  onSent?: () => void;
  onOpenBank?: (url: string) => void;
};

export function GiftPanel({
  eventId, liveSessionId, fromUserId, toUserId, toLabel, payeeBank, onSent, onOpenBank,
}: Props) {
  const [tab, setTab] = useState<"transfer" | "sticker">("sticker");
  const [amount, setAmount] = useState("");
  const [stickerId, setStickerId] = useState(STICKERS[0]?.id ?? "");
  const [pendingCash, setPendingCash] = useState<GiftRecord | null>(null);
  const [err, setErr] = useState("");

  function openBank() {
    setErr("");
    if (!payeeBank) {
      setErr("Người nhận chưa kê khai ngân hàng trong hồ sơ user.");
      return;
    }
    const amt = Number(amount.replace(/\D/g, "")) || 0;
    const { record, bankUrl } = startCashGift({
      eventId, liveSessionId, fromUserId, toUserId, amountVnd: amt, payee: payeeBank,
    });
    setPendingCash(record);
    onOpenBank?.(bankUrl);
    if (typeof window !== "undefined") window.open(bankUrl, "_blank");
  }

  function confirm(status: "completed" | "incomplete") {
    if (!pendingCash) return;
    const next = confirmCashGift(pendingCash, status);
    setPendingCash(next);
    if (status === "completed") onSent?.();
  }

  return (
    <div className="ev-form">
      <p style={{ fontWeight: 700, margin: 0 }}>Tặng quà → {toLabel}</p>
      <div className="ev-row">
        <button type="button" className="ev-publish" style={{ height: 36, background: tab === "sticker" ? "#E30613" : "#eee", color: tab === "sticker" ? "#fff" : "#111" }} onClick={() => setTab("sticker")}>Sticker</button>
        <button type="button" className="ev-publish" style={{ height: 36, background: tab === "transfer" ? "#E30613" : "#eee", color: tab === "transfer" ? "#fff" : "#111" }} onClick={() => setTab("transfer")}>Tiền mặt</button>
      </div>

      {tab === "transfer" ? (
        <>
          <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>
            Hệ thống mở app ngân hàng theo STK người nhận đã khai lúc đăng ký. Việc chuyển khoản nằm ngoài app. Sau đó chỉ cần xác nhận xong / chưa.
          </p>
          <label>Số tiền (VND)
            <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <button className="ev-publish" type="button" onClick={openBank}>Mở app ngân hàng</button>
          {pendingCash && pendingCash.payload.kind === "transfer" && pendingCash.payload.confirmStatus === "pending" && (
            <div className="ev-row">
              <button className="ev-publish" type="button" onClick={() => confirm("completed")}>Đã hoàn tất</button>
              <button className="ev-publish" type="button" style={{ background: "#eee", color: "#111" }} onClick={() => confirm("incomplete")}>Chưa hoàn tất</button>
            </div>
          )}
          {pendingCash?.payload.kind === "transfer" && pendingCash.payload.confirmStatus === "completed" && (
            <p style={{ fontSize: 13 }}>Đã xác nhận → thả sticker tiền trên live.</p>
          )}
          {pendingCash?.payload.kind === "transfer" && pendingCash.payload.confirmStatus === "incomplete" && (
            <p style={{ fontSize: 13 }}>Chưa hoàn tất → không hiện sticker trên live.</p>
          )}
        </>
      ) : STICKERS.length === 0 ? (
        <p style={{ fontSize: 13, color: "#666" }}>Chưa gắn bộ sticker. Sẽ gắn điểm khi nhận bộ ảnh.</p>
      ) : (
        <>
          <label>Sticker
            <select value={stickerId} onChange={(e) => setStickerId(e.target.value)}>
              {STICKERS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.points} điểm</option>
              ))}
            </select>
          </label>
          <button className="ev-publish" type="button" onClick={() => {
            sendGift({ eventId, liveSessionId, fromUserId, toUserId, payload: { kind: "sticker", stickerId, qty: 1 } });
            onSent?.();
          }}>Tặng sticker</button>
        </>
      )}
      {err && <p style={{ color: "#b71c1c", fontSize: 13 }}>{err}</p>}
    </div>
  );
}
