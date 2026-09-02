"use client";

import { AI_MASCOT_FULL, AI_MASCOT_ROUND } from "./ai-companion";

export function AiMascot({
  kind = "round",
  size = 56,
}: {
  kind?: "round" | "full";
  size?: number;
}) {
  const src = kind === "full" ? AI_MASCOT_FULL : AI_MASCOT_ROUND;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Phúc"
      className={kind === "full" ? "pl-ai-full" : "pl-ai-round"}
      width={size}
      height={kind === "full" ? Math.round(size * 1.4) : size}
      loading="lazy"
      decoding="async"
      style={{
        width: size,
        height: kind === "full" ? "auto" : size,
        borderRadius: kind === "full" ? 18 : 999,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}
