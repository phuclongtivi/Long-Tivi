"use client";

import { useRef, useState } from "react";
import { PhucChatbotAvatar } from "./PhucChatbotAvatar";
import {
  TAP_VISION_HINT,
  askPhucVision,
  captureTapCrop,
  tapFromPointer,
  type TapPoint,
  type VisionHit,
} from "./live-tap-vision";

type ProductHint = { name: string; productCode: string };

type Props = {
  liveSessionId?: string;
  listedProducts?: ProductHint[];
  /** Node video thật — nếu có thì cắt frame. Không có thì vẫn hiện pin + chat. */
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  children?: React.ReactNode;
};

export function LiveTapChatOverlay({
  liveSessionId,
  listedProducts,
  videoRef,
  children,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tap, setTap] = useState<TapPoint | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hit, setHit] = useState<VisionHit | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function onPointer(e: React.PointerEvent) {
    const stage = stageRef.current;
    if (!stage) return;
    const t = tapFromPointer(stage, e.clientX, e.clientY);
    setTap(t);
    setOpen(true);
    setBusy(true);
    setHit(null);
    try {
      const video = videoRef?.current;
      const dataUrl = video ? await captureTapCrop(video, t) : null;
      const result = await askPhucVision({
        imageDataUrl: dataUrl ?? "",
        tap: t,
        liveSessionId,
        listedProducts,
      });
      setHit(result);
      setLog((xs) => [result.reply, ...xs].slice(0, 8));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={stageRef}
        onPointerUp={onPointer}
        style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "crosshair" }}
      >
        {children ?? (
          <div
            style={{
              aspectRatio: "9 / 16",
              background: "#1a1a1a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            Livestream — chạm vào đồ trong khung
          </div>
        )}
        {tap && (
          <div
            style={{
              position: "absolute",
              left: `${tap.xPct * 100}%`,
              top: `${tap.yPct * 100}%`,
              width: 22,
              height: 22,
              marginLeft: -11,
              marginTop: -11,
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 0 3px #E11D48",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <p style={{ fontSize: 11, color: "var(--pl-muted,#C5D0E8)", margin: "6px 0 0" }}>{TAP_VISION_HINT}</p>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 8,
            bottom: 56,
            width: "min(320px, 92%)",
            background: "transparent",
            border: "2px solid var(--pl-frame)",
            boxShadow: "0 0 0 1px var(--pl-frame-soft)",
            borderRadius: 14,
            padding: 12,
            color: "var(--pl-text)",
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <PhucChatbotAvatar size={40} />
            <div style={{ fontWeight: 800, fontSize: 13 }}>Phúc · nhận đồ trong live</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", border: "none", background: "transparent", fontSize: 18 }}
            >
              ×
            </button>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.45, margin: "8px 0 0" }}>
            {busy ? "Phúc đang xem ô bạn vừa chạm…" : hit?.reply ?? "Chạm một món trong khung hình."}
          </p>
          {hit?.productCode && (
            <a
              href={`/shop?code=${encodeURIComponent(hit.productCode)}`}
              style={{ display: "inline-block", marginTop: 8, fontSize: 13, fontWeight: 700, color: "#8B4513" }}
            >
              Xem trên superBUY →
            </a>
          )}
          {log.length > 1 && (
            <ul style={{ fontSize: 11, color: "#666", paddingLeft: 16, margin: "8px 0 0" }}>
              {log.slice(1).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
