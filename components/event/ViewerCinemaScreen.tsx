"use client";

import { useEffect, useRef, useState } from "react";
import type { EventPost } from "./types";
import { RoomCountsLabel } from "./RoomCountsLabel";
import { AiIdlePresence } from "./AiIdlePresence";
import { DEFAULT_COMPANION } from "./ai-companion";
import { seatGrid, type SeatUser } from "./seat-rank";
import { LiveKitStage } from "./LiveKitStage";
import { LiveRoomChat } from "./LiveRoomChat";

export type { SeatUser };

export function ViewerCinemaScreen({
  post,
  seats,
  videoSrc,
  onExit,
  keepTabBar = true,
}: {
  post: EventPost;
  seats: SeatUser[];
  videoSrc?: string;
  onExit?: () => void;
  keepTabBar?: boolean;
}) {
  const [landscape, setLandscape] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onOri = () => {
      setLandscape(window.innerWidth > window.innerHeight);
      setFullscreen(Boolean(document.fullscreenElement));
    };
    onOri();
    window.addEventListener("resize", onOri);
    window.addEventListener("orientationchange", onOri);
    document.addEventListener("fullscreenchange", onOri);
    document.documentElement.classList.add("pl-reel-fs");
    return () => {
      window.removeEventListener("resize", onOri);
      window.removeEventListener("orientationchange", onOri);
      document.removeEventListener("fullscreenchange", onOri);
      document.documentElement.classList.remove("pl-reel-fs");
    };
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      setFullscreen(false);
      return;
    }
    await shellRef.current?.requestFullscreen?.().catch(() => undefined);
    setFullscreen(Boolean(document.fullscreenElement));
  }

  const { rows, hidden, cols } = seatGrid(seats, landscape);
  const shop = post.shopQuickUrl || "/store";
  const keySize = landscape ? 44 : 48;

  return (
    <div
      ref={shellRef}
      className="pl-cinema"
      style={{
        position: "fixed",
        inset: keepTabBar ? "0 0 88px 0" : 0,
        zIndex: 30,
        background: "#070B12",
        color: "#F4F7FB",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <section style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {videoSrc ? (
          <video src={videoSrc} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <LiveKitStage room={`pl-${post.id}`} identity="viewer" role="viewer" />
        )}
        {fullscreen ? <AiIdlePresence companion={DEFAULT_COMPANION} corner="right" /> : null}
        <button
          type="button"
          onClick={onExit}
          style={{ position: "absolute", top: 12, left: 12, zIndex: 4, height: 32, padding: "0 10px", borderRadius: 999, border: "none", fontWeight: 800 }}
        >
          Đóng
        </button>
        <a
          href={shop}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 4,
            height: 36,
            padding: "0 12px",
            borderRadius: 999,
            background: "rgba(20,20,20,.55)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            backdropFilter: "blur(8px)",
            textDecoration: "none",
          }}
        >
          Mua nhanh
        </a>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          style={{
            position: "absolute",
            top: 56,
            right: 12,
            zIndex: 4,
            height: 34,
            padding: "0 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.42)",
            background: "rgba(255,255,255,.82)",
            color: "#10172a",
            fontWeight: 900,
            fontSize: 12,
            backdropFilter: "blur(10px)",
          }}
        >
          {fullscreen ? "Thoát fullscreen" : "Toàn màn hình"}
        </button>
        {fullscreen ? <LiveRoomChat roomId={post.id} layout="fullscreen-bar" /> : null}
        <div style={{ position: "absolute", left: 12, bottom: 12, zIndex: 4 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{post.title}</div>
          <RoomCountsLabel
            counts={{ inside: post.insideCount ?? seats.length, watching: post.watchingCount ?? 0 }}
          />
        </div>
      </section>

      <aside
        style={{
          height: keySize * 3 + 28,
          padding: "6px 8px 10px",
          background: "rgba(8,10,16,.72)",
          backdropFilter: "blur(10px)",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${keySize}px)`,
              gap: 6,
              justifyContent: "start",
              marginBottom: 6,
            }}
          >
            {row.map((u) => (
              <img
                key={u.id}
                src={u.avatarUrl || "/icon-512.png"}
                alt={u.name}
                title={`${u.name} · ${u.role ?? "audience"}`}
                width={keySize}
                height={keySize}
                style={{
                  width: keySize,
                  height: keySize,
                  borderRadius: 10,
                  objectFit: "cover",
                  background: "#222",
                }}
              />
            ))}
          </div>
        ))}
        {hidden > 0 && (
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>
            +{hidden} đã vào phòng
          </div>
        )}
      </aside>
    </div>
  );
}
