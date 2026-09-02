"use client";

import { useEffect, useState } from "react";

/** Ảnh đại diện luân phiên — tốc độ vừa (~1.1s/ảnh). */
export function StickerCarousel({
  urls,
  intervalMs = 1100,
  height = 160,
}: {
  urls: string[];
  intervalMs?: number;
  height?: number;
}) {
  const list = urls.filter(Boolean);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), intervalMs);
    return () => clearInterval(t);
  }, [list.length, intervalMs]);
  if (!list.length) {
    return (
      <div style={{ height, background: "#f4f4f4", display: "grid", placeItems: "center", color: "#999" }}>
        ẢNH
      </div>
    );
  }
  return (
    <div style={{ position: "relative", height, overflow: "hidden", background: "#fff" }}>
      <img
        src={list[i]}
        alt=""
        width={720}
        height={height}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {list.map((_, n) => (
          <span
            key={n}
            style={{
              width: n === i ? 12 : 6,
              height: 6,
              borderRadius: 99,
              background: n === i ? "#ee4d2d" : "rgba(0,0,0,.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
