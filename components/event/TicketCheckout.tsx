"use client";

import type { EventPost } from "./types";
import { FLEXIBLE_TICKET_HINT, FLEXIBLE_MIN, FLEXIBLE_MAX, PLC_TICKET_DISCLAIMER, redactCccdMiddle5 } from "./types";
import { POINT_TO_VND, pointsFromVnd, STICKER_PAY_HINT } from "./sticker-pay";

type Props = {
  post: EventPost;
  onClose: () => void;
  onConfirm: (payload: { post: EventPost; amountVnd: number; pointsUsed: number }) => void;
  pointBalance?: number;
};

function ticketAmount(post: EventPost, chosen?: number): number {
  if (post.ticketMode === "fixed") return post.ticketPriceVnd ?? 0;
  if (post.ticketMode === "flexible") {
    const n = chosen ?? FLEXIBLE_MIN;
    return Math.min(FLEXIBLE_MAX, Math.max(FLEXIBLE_MIN, n));
  }
  return 0; // invite
}

export function TicketCheckout({ post, onClose, onConfirm, pointBalance = 0 }: Props) {
  const mode = post.ticketMode ?? "fixed";
  const defaultAmt = ticketAmount(post);
  const capPts = post.maxStickerPoints ?? pointsFromVnd(post.pointsDiscountVnd ?? 0);
  const maxOff =
    post.acceptStickerPay || post.acceptPointsDiscount
      ? Math.min(defaultAmt, capPts * POINT_TO_VND || defaultAmt)
      : 0;
  return (
    <div className="ev-sheet-backdrop" onClick={onClose}>
      <div className="ev-sheet" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Đặt vé — {post.title}</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{post.description}</p>

        <div className="ev-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 8, background: "#fafafa" }}>
            <div style={{ fontSize: 11, color: "#666" }}>Tham chiếu 1 · Ảnh CCCD (che 5 số giữa)</div>
            <div style={{ position: "relative" }}>
              {post.organizerIdPhotoUrl ? (
                <img src={post.organizerIdPhotoUrl} alt="CCCD BTC" style={{ width: "100%", borderRadius: 6, display: "block" }} />
              ) : (
                <div style={{ height: 72, background: "#eee", borderRadius: 6 }} />
              )}
              <div style={{
                position: "absolute", left: "22%", right: "22%", top: "58%", height: 14,
                background: "#111", opacity: 0.85, borderRadius: 2,
              }} />
            </div>
            <div style={{ fontWeight: 700, letterSpacing: 1, marginTop: 6, fontSize: 12 }}>
              {redactCccdMiddle5(post.organizerIdNumber)}
            </div>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 8, background: "#fafafa" }}>
            <div style={{ fontSize: 11, color: "#666" }}>Tham chiếu 2 · Ảnh xác nhận</div>
            {post.organizerProofUrl ? (
              <img src={post.organizerProofUrl} alt="Xác nhận nghệ sỹ" style={{ width: "100%", borderRadius: 6 }} />
            ) : (
              <div style={{ fontSize: 12, color: "#999" }}>Chưa gửi ảnh xác nhận</div>
            )}
          </div>
        </div>

        <p><b>Vé:</b> {label(post)}</p>
        {mode === "flexible" && <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>{FLEXIBLE_TICKET_HINT}</p>}
        {(post.acceptStickerPay || post.acceptPointsDiscount) && (
          <div style={{ border: "1px dashed #D4C9B5", borderRadius: 10, padding: 10, background: "var(--pl-surface)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Thanh toán bằng điểm + sticker</p>
            <p style={{ fontSize: 12, margin: "6px 0 0" }}>
              Trần BTC: {capPts} điểm = {maxOff.toLocaleString("vi-VN")}đ
              (1 điểm = {POINT_TO_VND.toLocaleString("vi-VN")}đ). Số dư: {pointBalance} điểm.
            </p>
            <p style={{ fontSize: 11, color: "var(--pl-muted,#C5D0E8)", margin: "6px 0 0" }}>{STICKER_PAY_HINT}</p>
          </div>
        )}

        <button
          className="ev-publish"
          type="button"
          onClick={() =>
            onConfirm({
              post,
              amountVnd: Math.max(0, defaultAmt - maxOff),
              pointsUsed: Math.min(pointBalance, capPts, pointsFromVnd(maxOff)),
            })
          }
        >
          Xác nhận đặt vé{post.acceptPointsDiscount ? " (đã trừ điểm)" : ""}
        </button>
        <p style={{ fontSize: 11, color: "#666", lineHeight: 1.45 }}>{PLC_TICKET_DISCLAIMER}</p>
      </div>
    </div>
  );
}

function label(post: EventPost) {
  if (post.ticketMode === "flexible") return "Từ 1.000đ — khách chọn";
  if (post.ticketMode === "invite") return "Vé mời Nghệ sỹ";
  if (post.ticketPriceVnd != null) return new Intl.NumberFormat("vi-VN").format(post.ticketPriceVnd) + "đ";
  return "Vé";
}
