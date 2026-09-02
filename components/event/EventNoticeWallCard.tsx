"use client";

import type { EventPost } from "./types";
import { formatWhen, noticeColors, type EventNoticeFields } from "./event-notice";
import { joinButtonLabel, resolveJoinAccess } from "./join-cta";
import { LongLiveMark } from "./LongLiveMark";

type Post = EventPost & EventNoticeFields;

export function EventNoticeWallCard({
  post,
  onAction,
}: {
  post: Post;
  onAction?: () => void;
}) {
  const img = post.organizerNoticeImageUrl;
  const access = resolveJoinAccess(post);
  const price =
    post.ticketMode === "fixed" && post.ticketPriceVnd
      ? new Intl.NumberFormat("vi-VN").format(post.ticketPriceVnd) + "đ"
      : post.ticketMode === "flexible"
        ? "Từ 1.000đ — khách chọn"
        : access === "invite"
          ? "Vé mời nghệ sỹ"
          : access === "open"
            ? "Vào tự do"
            : "Có vé";

  return (
    <article
      className="pl-wall-card pl-future-card"
      style={{
        position: "relative",
        color: "var(--pl-text)",
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div style={{ padding: "12px" }}>
        <div className="pl-future-kicker">THÔNG BÁO TỔ CHỨC</div>
        <h3 style={{ margin: "4px 0 6px", fontSize: 18 }}>{post.title}</h3>
        <div style={{ fontSize: 13, lineHeight: 1.4 }}>
          <div>Người khởi tạo: @{post.organizerName.replace(/^@/, "")}</div>
          <div>Bắt đầu: {formatWhen(post.startsAt)}</div>
          {post.endsAt ? <div>Kết thúc: {formatWhen(post.endsAt)}</div> : null}
          <div>Địa điểm: {post.venue}</div>
          <div>Hình thức: {post.kind === "live" ? "Livestream" : post.kind === "gift" ? "Xem nhận quà" : "Sự kiện có vé"}</div>
        </div>
      </div>

      {img ? (
        <div style={{ position: "relative" }}>
          <LongLiveMark size={72} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt=""
            style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block", background: "transparent" }}
          />
        </div>
      ) : post.organizerNotice || post.description ? (
        <p
          style={{
            padding: 12,
            fontSize: 14,
            lineHeight: 1.45,
            fontFamily: "inherit",
            color: noticeColors(post.organizerNoticeInk).color,
            background: noticeColors(post.organizerNoticeInk).background,
          }}
        >
          {post.organizerNotice || post.description}
        </p>
      ) : null}

      <div style={{ padding: 12, fontSize: 13, lineHeight: 1.45 }}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>Khuyến mãi · ưu đãi · hình thức</div>
        <div>Tham gia: {price}</div>
        {post.gift ? <div>Quà tặng: {post.gift}</div> : null}
        {post.acceptStickerPay || post.acceptPointsDiscount ? (
          <div>
            Ưu đãi điểm/sticker
            {post.pointsDiscountVnd
              ? " · trừ đến " + new Intl.NumberFormat("vi-VN").format(post.pointsDiscountVnd) + "đ"
              : ""}
          </div>
        ) : null}
        {post.liveRoomMode === "interactive" ? <div>Hình thức: phòng tương tác</div> : <div>Hình thức: phát một chiều</div>}
        {post.shopQuickUrl ? <div>Mua nhanh: superBUY</div> : null}
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: 8,
            height: 36,
            padding: "0 14px",
            border: "none",
            borderRadius: 999,
            background: "#E11D48",
            color: "#fff",
            fontWeight: 800,
          }}
        >
          {joinButtonLabel(post)}
        </button>
      </div>
    </article>
  );
}
