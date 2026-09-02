"use client";

import { useState, type ReactNode } from "react";

export type BtcChromeMode = "full" | "compact" | "bar";

export function BtcControlChrome({
  children,
  aiOn,
  onAiToggle,
  onPlay,
  onPause,
  onStop,
  onVol,
}: {
  children: ReactNode;
  aiOn?: boolean;
  onAiToggle?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onVol?: (delta: number) => void;
}) {
  const [mode, setMode] = useState<BtcChromeMode>("full");

  const chip = (label: string, onClick?: () => void, hot?: boolean) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 32,
        padding: "0 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.28)",
        background: hot ? "rgba(34,197,94,.85)" : "rgba(255,255,255,.12)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {label}
    </button>
  );

  const tools = (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {chip("Pause", onPause)}
      {chip("Play", onPlay)}
      {chip("Stop", onStop)}
      {chip("− âm", () => onVol?.(-0.1))}
      {chip("+ âm", () => onVol?.(0.1))}
      {chip(aiOn ? "AI: Bật" : "AI: Tắt", onAiToggle, !!aiOn)}
    </div>
  );

  if (mode === "bar") {
    return (
      <div
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 96,
          zIndex: 35,
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "8px 10px",
          borderRadius: 14,
          background: "rgba(16,24,38,.62)",
          backdropFilter: "blur(10px)",
          color: "#fff",
        }}
      >
        {tools}
        <button type="button" onClick={() => setMode("full")} style={{ marginLeft: "auto", fontWeight: 800 }}>
          Bảng điều khiển
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setMode("full")} disabled={mode === "full"}>
          Full
        </button>
        <button type="button" onClick={() => setMode("compact")} disabled={mode === "compact"}>
          Thu gọn
        </button>
        <button type="button" onClick={() => setMode("bar")}>
          Ẩn
        </button>
      </div>
      {mode === "compact" ? (
        <div
          style={{
            padding: 10,
            borderRadius: 12,
            background: "var(--pl-surface,#101826)",
            border: "1px solid var(--pl-border,#243044)",
          }}
        >
          {tools}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
