"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPhotoReel } from "./photo-reels";
import { archiveHomeEndsAt, viewArchive, type ArchivePost } from "./post-archive";

export function PermalinkClient({ id }: { id: string }) {
  const [row, setRow] = useState<ArchivePost | null>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const local = viewArchive(id);
    if (local) {
      setRow(local);
      return;
    }
    const reel = getPhotoReel(id);
    if (reel) {
      setRow({
        id: reel.id,
        kind: "photo-reel",
        title: reel.title,
        description: reel.description,
        author: reel.author,
        createdAt: reel.createdAt,
        posterUrl: reel.images[0] || "/icon-512.png",
        videoUrl: reel.videoUrl,
      });
      return;
    }
    fetch("/api/archive/" + encodeURIComponent(id))
      .then((r) => r.json())
      .then((d) => {
        if (d && d.id) setRow(d as ArchivePost);
        else setGone(true);
      })
      .catch(() => setGone(true));
  }, [id]);

  if (gone) {
    return (
      <main style={{ padding: 20, color: "var(--pl-text)", background: "transparent" }}>
        <p>Không tìm thấy bài. Liên kết chia sẻ có thể đã bị gỡ.</p>
        <Link href="/home">Về Home</Link>
      </main>
    );
  }
  if (!row) {
    return (
      <main style={{ padding: 20, color: "var(--pl-text)" }}>Đang mở bài đã chia sẻ…</main>
    );
  }

  const homeEnd = archiveHomeEndsAt(row.createdAt);
  const offHome = Date.now() > +homeEnd;

  return (
    <main
      style={{
        padding: "16px 16px 80px",
        maxWidth: 560,
        margin: "0 auto",
        color: "var(--pl-text)",
        background: "transparent",
      }}
    >
      <Link href="/home" style={{ color: "inherit", fontSize: 13 }}>
        ← Home
      </Link>
      <article
        style={{
          marginTop: 12,
          background: "transparent",
          border: "2px solid var(--pl-frame)",
          boxShadow: "0 0 0 1px var(--pl-frame-soft)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7 }}>
            {offHome ? "ĐÃ GỠ KHỎI TƯỜNG HOME · LIÊN KẾT CÒN" : "BÀI TRÊN PHÚC LONG CENTER"}
          </div>
          <h1 style={{ fontSize: 20, margin: "6px 0" }}>{row.title}</h1>
          <div style={{ fontSize: 13 }}>@{row.author.replace(/^@/, "")}</div>
        </div>
        {row.videoUrl && !row.originalsPurged ? (
          <video src={row.videoUrl} controls playsInline style={{ width: "100%", display: "block", background: "#111" }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.posterUrl || "/icon-512.png"}
            alt={row.title}
            width={1200}
            height={675}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "auto", display: "block", maxHeight: 360, objectFit: "cover" }}
          />
        )}
        <p style={{ padding: 12, margin: 0, fontSize: 15, lineHeight: 1.45, fontFamily: "inherit" }}>
          {row.description}
        </p>
        {offHome ? (
          <p style={{ padding: "0 12px 14px", fontSize: 12, opacity: 0.7 }}>Đã gỡ khỏi tường Home</p>
        ) : null}
      </article>
    </main>
  );
}
