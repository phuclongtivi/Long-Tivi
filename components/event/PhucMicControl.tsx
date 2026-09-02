"use client";

import type { AiCompanion } from "./ai-companion";

/** Thanh volume dọc + loa — góc trái dưới, không dùng icon micro. */
export function PhucMicControl({
  companion,
  onVolume,
}: {
  companion: AiCompanion;
  onVolume: (v: number) => void;
}) {
  const v = Math.max(0, Math.min(1, companion.volume));
  const pct = Math.round(v * 100);
  return (
    <div
      className="pl-vol-dock"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        pointerEvents: "auto",
        padding: "6px 4px",
        borderRadius: 16,
        background: "rgba(7,11,18,.45)",
      }}
      title={`Âm ${companion.name}`}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path
          d="M3 10v4h3l4 4V6L6 10H3z"
          fill="#F4F7FB"
        />
        {pct > 5 && (
          <path d="M14 9c1.2 1 1.2 5 0 6" fill="none" stroke="#F4F7FB" strokeWidth="1.6" strokeLinecap="round" />
        )}
        {pct > 40 && (
          <path d="M16.5 7c2 2.2 2 7.8 0 10" fill="none" stroke="#F4F7FB" strokeWidth="1.6" strokeLinecap="round" />
        )}
        {pct > 75 && (
          <path d="M19 5c3 3.2 3 10.8 0 14" fill="none" stroke="#F4F7FB" strokeWidth="1.6" strokeLinecap="round" />
        )}
        {pct === 0 && <line x1="4" y1="20" x2="20" y2="4" stroke="#E11D48" strokeWidth="1.8" />}
      </svg>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        aria-label={`Âm lượng ${companion.name}`}
        onChange={(e) => onVolume(Number(e.target.value) / 100)}
        style={{
          writingMode: "vertical-lr",
          direction: "rtl",
          width: 22,
          height: 88,
          accentColor: "#E11D48",
          cursor: "pointer",
        }}
      />
      <span style={{ fontSize: 10, color: "#F4F7FB", textShadow: "0 1px 2px #000" }}>{pct}%</span>
    </div>
  );
}
