"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { SHARE_PLATFORMS, shareEventPlatform } from "./share-event";
import { LongLiveMark } from "./LongLiveMark";
import {
  patchPhotoReel,
  type PhotoReel,
  type PhotoReelComment,
} from "./photo-reels";

export function PhotoReelWallCard({ reel, me = "Bạn" }: { reel: PhotoReel; me?: string }) {
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likesCount ?? 0);
  const [shareOpen, setShareOpen] = useState(false);
  const [cmtOpen, setCmtOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [comments, setComments] = useState<PhotoReelComment[]>(reel.comments || []);

  useEffect(() => {
    if (reel.videoUrl || reel.images.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        setI((n) => (n + 1) % reel.images.length);
      }
    }, 2400);
    return () => clearInterval(t);
  }, [reel.videoUrl, reel.images.length]);

  const btn: CSSProperties = {
    height: 32,
    padding: "0 10px",
    marginRight: 8,
    marginBottom: 6,
    border: "2px solid var(--pl-frame)",
    background: "transparent",
    color: "inherit",
    fontWeight: 800,
    fontSize: 12,
    borderRadius: 10,
  };

  return (
    <article
      className="pl-wall-card"
      style={{
        background: "transparent",
        color: "var(--pl-text)",
        border: "2px solid var(--pl-frame)",
        boxShadow: "0 0 0 1px var(--pl-frame-soft)",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
        position: "relative",
      }}
    >
      <LongLiveMark size={100} />
      <div style={{ padding: "36px 12px 12px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.75 }}>VIDEO TỪ ẢNH</div>
        <h3 style={{ margin: "4px 0 6px", fontSize: 18 }}>{reel.title}</h3>
        <div style={{ fontSize: 13 }}>@{reel.author.replace(/^@/, "")}</div>
      </div>
      {reel.videoUrl ? (
        <video
          src={reel.videoUrl}
          controls
          playsInline
          preload="metadata"
          poster={reel.images[0]}
          style={{ width: "100%", display: "block", background: "#111", maxHeight: 280 }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={reel.images[i]}
          alt={reel.title}
          width={1200}
          height={675}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "auto", maxHeight: 280, objectFit: "cover", display: "block", background: "#111" }}
        />
      )}
      <p style={{ padding: "12px 12px 0", margin: 0, fontSize: 14, lineHeight: 1.45 }}>{reel.description}</p>
      <div style={{ padding: 12 }}>
        <button
          type="button"
          style={btn}
          onClick={() => {
            const nextLiked = !liked;
            const next = nextLiked ? likes + 1 : Math.max(0, likes - 1);
            setLiked(nextLiked);
            setLikes(next);
            patchPhotoReel(reel.id, { likesCount: next });
          }}
        >
          {liked ? "♥" : "♡"} Tim {likes}
        </button>
        <button type="button" style={btn} onClick={() => setCmtOpen((v) => !v)}>
          Bình luận {comments.length}
        </button>
        <button type="button" style={btn} onClick={() => setShareOpen((v) => !v)}>
          Chia sẻ
        </button>
      </div>
      {shareOpen ? (
        <div style={{ padding: "0 12px 12px" }}>
          {SHARE_PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              style={btn}
              onClick={() => {
                if (p.key === "instagram") {
                  const href = reel.videoUrl || reel.images[0];
                  if (href && href.indexOf("blob:") === 0) {
                    const a = document.createElement("a");
                    a.href = href;
                    a.download = (reel.title || "video") + ".webm";
                    a.click();
                  } else if (href) {
                    window.open(href, "_blank", "noopener");
                  }
                  return;
                }
                shareEventPlatform(p.key, {
                  id: reel.id,
                  title: reel.title,
                  organizer: reel.author,
                });
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}
      {cmtOpen ? (
        <div style={{ padding: "0 12px 12px" }}>
          {comments.map((c) => (
            <div key={c.id} style={{ fontSize: 13, marginBottom: 6 }}>
              <b>{c.name}</b> {c.text}
            </div>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Viết bình luận…"
            style={{
              width: "70%",
              height: 36,
              background: "transparent",
              color: "inherit",
              border: "2px solid var(--pl-frame)",
              borderRadius: 8,
              padding: "0 8px",
              marginRight: 6,
            }}
          />
          <button
            type="button"
            style={btn}
            onClick={() => {
              const t = draft.trim();
              if (!t) return;
              const row: PhotoReelComment = {
                id: "c-" + Date.now(),
                name: me,
                text: t,
                at: new Date().toISOString(),
              };
              const next = [row, ...comments];
              setComments(next);
              setDraft("");
              patchPhotoReel(reel.id, { comments: next });
            }}
          >
            Gửi
          </button>
        </div>
      ) : null}
    </article>
  );
}
