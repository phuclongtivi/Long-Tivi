"use client";

import { capAlertLevel, capAlertText, capFillPct } from "./audience-cap-alert";

export function LiveAudienceCapAlert({
  inside,
  cap,
  onRaiseCap,
}: {
  inside: number;
  cap: number;
  onRaiseCap?: () => void;
}) {
  const level = capAlertLevel(inside, cap);
  if (!level) return null;
  const sticky = level >= 95;
  const pct = Math.round(capFillPct(inside, cap));

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 80,
        maxWidth: 280,
        padding: "10px 12px",
        borderRadius: 12,
        background: sticky ? "#9F1239" : "#B45309",
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        fontSize: 13,
        lineHeight: 1.35,
        fontWeight: 700,
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 4 }}>
        {sticky ? "CỐ ĐỊNH · ≥ 95%" : `Mốc ${level}%`}
      </div>
      {capAlertText(level, inside, cap)}
      <button
        type="button"
        onClick={onRaiseCap}
        style={{
          marginTop: 8,
          width: "100%",
          height: 32,
          border: "none",
          borderRadius: 8,
          background: "#fff",
          color: "#9F1239",
          fontWeight: 800,
        }}
      >
        Tăng giới hạn ({pct}%)
      </button>
    </div>
  );
}
