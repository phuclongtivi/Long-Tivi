"use client";

import type { EventPost } from "./types";
import "./event-feature.css";

type Props = {
  post: EventPost | null;
  onClose: () => void;
  onAttend?: (post: EventPost) => void;
  onBuyTicket?: (post: EventPost) => void;
};

function formatMoney(n?: number | null) {
  if (n == null) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export function EventDetailSheet({ post, onClose, onAttend, onBuyTicket }: Props) {
  if (!post) return null;
  const needTicket =
    post.kind === "ticket" ||
    post.ticketMode === "fixed" ||
    post.ticketMode === "flexible" ||
    post.ticketMode === "invite";

  return (
    <div className="ev-sheet-backdrop" onClick={onClose}>
      <div className="ev-sheet" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>{post.title}</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{post.description}</p>
        <p><b>Người tổ chức:</b> {post.organizerName}</p>
        <p><b>Quà tặng:</b> {post.gift || "—"}</p>
        <p><b>Vé:</b> {post.ticketMode === "flexible" ? "Từ 1.000đ — khách chọn" : post.ticketMode === "invite" ? "Vé mời Nghệ sỹ" : formatMoney(post.ticketPriceVnd)}</p>
        <p><b>Thời gian:</b> {post.startsAt}</p>
        <p><b>Địa điểm:</b> {post.venue}</p>
        <div className="ev-actions">
          <button className="ghost" type="button" onClick={() => onAttend?.(post)}>
            Tham dự
          </button>
          {needTicket && (
            <button className="primary" type="button" onClick={() => onBuyTicket?.(post)}>
              Mua vé
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
