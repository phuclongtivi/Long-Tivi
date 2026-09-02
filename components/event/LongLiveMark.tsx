"use client";

export function LongLiveMark({ size = 72 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/long-live-logo.jpg"
      alt="long.live"
      className="pl-longlive-mark"
      width={size}
      height={Math.round(size * 0.28)}
      loading="lazy"
      decoding="async"
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        left: "auto",
        zIndex: 6,
        width: size,
        height: "auto",
        maxWidth: "28%",
        borderRadius: 8,
        pointerEvents: "none",
        objectFit: "contain",
      }}
    />
  );
}
