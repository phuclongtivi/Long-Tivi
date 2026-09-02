"use client";

import { memo, useState } from "react";
import type { EventPost } from "./types";
import { FollowButton } from "./FollowButton";
import { RoomCountsLabel } from "./RoomCountsLabel";
import { joinButtonLabel } from "./join-cta";
import { postExpiresAt } from "./home-feed";
import { SHARE_PLATFORMS, shareEventPlatform } from "./share-event";
import { publishArchive } from "./post-archive";
import { UserAvatarFrame } from "./UserAvatarFrame";
import { isLiveRoomOpen } from "./home-feed";
import Link from "next/link";
import { LongLiveMark } from "./LongLiveMark";
import EventChatDrops from '@/components/EventChatDrops';

function EventWallPostInner({
  post,
  following,
  onFollow,
  onOpen,
  onLike,
  isLoggedIn = false,
}: {
  post: EventPost;
  following?: boolean;
  onFollow?: () => void;
  onOpen?: (p: EventPost) => void;
  onLike?: (p: EventPost) => void;
  isLoggedIn?: boolean;
}) {
  const [likes, setLikes] = useState(post.likesCount ?? 0);
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const exp = postExpiresAt(post);

  return (
    <article
      style={{
        color: "var(--pl-text)",
        padding: 16,
        marginBottom: 14,
        contentVisibility: "auto",
        containIntrinsicSize: "auto 220px",
        contain: "content",
      }}
      className="pl-card pl-future-card"
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <UserAvatarFrame src={post.posterUrl || "/icon-512.png"} rank={post.organizerRole} size={36} alt="" />
          <div>
            <b style={{ fontSize: 15 }}>{post.organizerName}</b>
            <div style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>
              Đăng lúc {new Date(post.publishedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        {onFollow && <FollowButton following={!!following} onToggle={onFollow} />}
      </header>

      <div className="pl-poster" style={{ position: "relative", margin: "12px -16px 10px", minHeight: 88, background: "transparent", overflow: "hidden" }}>
        <LongLiveMark size={72} />
        {isLiveRoomOpen(post) && (
          <span style={{ position: "absolute", top: 10, left: 10, background: "linear-gradient(135deg,#ff2d75,#7c3aed)", color: "#fff", fontWeight: 800, fontSize: 11, padding: "5px 10px", borderRadius: 999, boxShadow: "0 8px 20px rgba(255,45,117,.28)" }}>
            LIVE
          </span>
        )}
        {post.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.posterUrl}
            alt={post.title}
            width={1200}
            height={675}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "auto", maxHeight: 220, objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ padding: "28px 16px 16px", fontSize: 20, fontWeight: 800, color: "var(--pl-text)" }}>{post.title}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}><h3 style={{ margin: 0, fontSize: 19, letterSpacing: "-0.025em" }}>{post.title}</h3><EventChatDrops eventKey={post.id} title={post.title} isLoggedIn={isLoggedIn} /></div>
      <p style={{ fontSize: 14, opacity: 0.9, whiteSpace: "pre-wrap" }}>{post.description}</p>
      <RoomCountsLabel
        counts={{ inside: post.insideCount ?? 0, watching: post.watchingCount ?? 0 }}
      />
      <div style={{ fontSize: 13, marginTop: 8, opacity: 0.85 }}>
        {post.venue} · {new Date(post.startsAt).toLocaleString("vi-VN")}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            if (!liked) setLikes((n) => n + 1);
            else setLikes((n) => Math.max(0, n - 1));
            setLiked(!liked);
            onLike?.(post);
          }}
        >
          {liked ? "♥" : "♡"} Thích {likes}
        </button>
        <button type="button" onClick={() => setShareOpen((v) => !v)}>
          Chia sẻ
        </button>
        {isLiveRoomOpen(post) && (
          <Link
            href={`/?enter=${encodeURIComponent(post.id)}`}
            className="pl-btn pl-btn-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 36,
              padding: "0 12px",
              borderRadius: 999,
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            Vào phòng nhanh
          </Link>
        )}
        <button type="button" onClick={() => onOpen?.(post)}>
          {joinButtonLabel(post)}
        </button>
      </div>

      {shareOpen && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {SHARE_PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                void publishArchive({
                  id: post.id,
                  kind: "event",
                  title: post.title,
                  description: post.description,
                  author: post.organizerName,
                  createdAt: post.publishedAt,
                  firstImage: post.posterUrl,
                });
                shareEventPlatform(p.key, {
                  id: post.id,
                  title: post.title,
                  organizer: post.organizerName,
                  posterUrl: post.posterUrl,
                });
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export const EventWallPost = memo(EventWallPostInner);
