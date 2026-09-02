"use client";

import type { EventPost } from "./types";
import { FLEXIBLE_TICKET_HINT } from "./types";
import { FollowButton } from "./FollowButton";
import { RoomCountsLabel } from "./RoomCountsLabel";
import "./event-feature.css";

const KIND_LABEL: Record<EventPost["kind"], string> = {
  live: "LIVE", gift: "Có quà", ticket: "Cần vé",
};

function formatMoney(n?: number | null) {
  if (n == null) return null;
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function ticketLabel(post: EventPost) {
  if (post.ticketMode === "flexible") return "Từ 1.000đ — khách chọn";
  if (post.ticketMode === "invite") return "Vé mời Nghệ sỹ";
  if (post.ticketMode === "fixed") return formatMoney(post.ticketPriceVnd) ?? "Giá cố định";
  if (post.ticketPriceVnd != null) return formatMoney(post.ticketPriceVnd)!;
  return "—";
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("vi-VN");
}

type Props = {
  post: EventPost;
  onOpen?: (post: EventPost) => void;
  following?: boolean;
  onFollow?: () => void;
};

export function EventFeedCard({ post, onOpen, following, onFollow }: Props) {
  return (
    <article
      className="ev-card double pl-wall-card"
      onClick={() => onOpen?.(post)}
      role="button"
      style={{
        border: "1px solid var(--pl-frame)",
        boxShadow: "0 0 0 1px rgba(29,41,81,.12), 0 3px 10px rgba(29,41,81,.06)",
        borderRadius: 14,
        marginBottom: 12,
        background: "transparent",
        color: "var(--pl-text)",
      }}
    >
      <div className="cover">{KIND_LABEL[post.kind]}</div>
      <div className="body">
        <h3>{post.title}</h3>
        <RoomCountsLabel
          counts={{ inside: post.insideCount ?? 0, watching: post.watchingCount ?? 0 }}
        />
        <div className="ev-meta">
          <div>
            <b>Người tổ chức:</b> @{post.organizerName.replace(/^@/, "")}
            {onFollow && (
              <span onClick={(e) => e.stopPropagation()}>
                <FollowButton following={!!following} onToggle={onFollow} />
              </span>
            )}
          </div>
          <div><b>Quà tặng:</b> {post.gift || "—"}</div>
          <div><b>Vé vào:</b> {ticketLabel(post)}</div>
          {post.acceptPointsDiscount && (
            <div style={{ fontSize: 12, color: "#b71c1c" }}>
              Có thể trừ điểm vào vé{post.pointsDiscountVnd ? ` — tối đa ${new Intl.NumberFormat("vi-VN").format(post.pointsDiscountVnd)}đ` : ""}
            </div>
          )}
          {post.ticketMode === "flexible" && (
            <div style={{ fontSize: 12 }}>{FLEXIBLE_TICKET_HINT}</div>
          )}
          <div><b>Thời gian:</b> {formatWhen(post.startsAt)}</div>
          <div><b>Địa điểm:</b> {post.venue}</div>
          <div>
            <b>Diễn viên / ca sỹ / MC / khách mời / công ty:</b>{" "}
            {post.guests.length ? post.guests.map((g) => `${g.name} (${g.role})`).join(", ") : "—"}
          </div>
        </div>
      </div>
    </article>
  );
}
