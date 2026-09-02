"use client";

import { useMemo } from "react";
import {
  resolveCaptionFont,
  type BtcPreviewType,
  type CaptionEffect,
  type LiveThemeKey,
  type OwnerVibe,
} from "./ai-caption";

export function AiCaptionOverlay({
  text,
  effect = "marquee",
  preview,
  theme,
  vibe,
}: {
  text: string;
  effect?: CaptionEffect;
  preview?: BtcPreviewType | null;
  theme?: LiveThemeKey;
  vibe?: OwnerVibe;
}) {
  const font = useMemo(
    () => resolveCaptionFont({ preview, theme, vibe }),
    [preview, theme, vibe]
  );
  if (!text) return null;
  const fx = preview?.effect ?? effect;

  return (
    <div
      className={`pl-caption pl-caption-${fx}`}
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 148,
        zIndex: 8,
        fontFamily: font.family,
        fontWeight: 800,
        fontSize: 18,
        color: "#fff",
        textShadow: fx === "glow" ? "0 0 12px #9cf, 0 2px 6px #000" : "0 2px 8px #000",
        pointerEvents: "none",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <span className={fx === "marquee" ? "pl-marquee" : undefined}>{text}</span>
      <style>{`
        .pl-marquee { display:inline-block; padding-left:100%; animation: plmq 12s linear infinite; }
        @keyframes plmq { from { transform:translateX(0); } to { transform:translateX(-100%); } }
        .pl-caption-fade { animation: plfd 2.4s ease-in-out infinite alternate; }
        @keyframes plfd { from { opacity:.35; } to { opacity:1; } }
        .pl-caption-pop { animation: plpop .9s ease-in-out infinite; }
        @keyframes plpop { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
      `}</style>
    </div>
  );
}
