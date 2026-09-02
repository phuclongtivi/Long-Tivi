"use client";

import { useEffect, useState } from "react";
import { loadSlots, type AvProcessor } from "./av-processors";

const LIVE_FLAG = "pl.btc-live-open";

export function setBtcLiveOpen(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(LIVE_FLAG, "1");
  else localStorage.removeItem(LIVE_FLAG);
}

export function AvMiniPreviewStrip({
  liveOn,
  onOpenSlot,
}: {
  liveOn?: boolean;
  onOpenSlot?: (slot: 1 | 2 | 3 | 4) => void;
}) {
  const [slots, setSlots] = useState<AvProcessor[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setSlots(loadSlots());
    const t = window.setInterval(() => setSlots(loadSlots()), 2000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (liveOn === false) {
      setOpen(false);
      setBtcLiveOpen(false);
    } else {
      setOpen(true);
      setBtcLiveOpen(true);
    }
  }, [liveOn]);

  if (!open && liveOn === false) return null;

  const label = (s: AvProcessor) =>
    s.slot === 1 ? "Hình" : s.slot === 2 ? "Tiếng" : s.slot === 3 ? "Đèn" : "USB";

  return (
    <div
      style={{
        position: "fixed",
        left: 8,
        right: 8,
        bottom: 78,
        zIndex: 34,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 6,
        pointerEvents: "auto",
      }}
    >
      {slots.map((s) => (
        <button
          key={s.slot}
          type="button"
          onClick={() => onOpenSlot?.(s.slot)}
          style={{
            height: 56,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.28)",
            background: "rgba(16,24,38,.38)",
            backdropFilter: "blur(8px)",
            color: "#F4F7FB",
            padding: 6,
            textAlign: "left",
            overflow: "hidden",
          }}
        >
          <span style={{ display: "block", fontSize: 10, opacity: 0.75 }}>
            {s.slot} · {label(s)}
          </span>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden" }}>
            {s.name || "Trống"}
          </span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>
            {s.status === "connected" ? "Preview" : s.status === "empty" ? "—" : "Chờ"}
          </span>
        </button>
      ))}
    </div>
  );
}
