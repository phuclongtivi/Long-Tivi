"use client";

import { optimizeAssetUrl } from "./media";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** Ảnh mặc định: WebP, nét trên Retina, không dùng CDN trả phí. */
export function OptimizedImg({ src, alt, width = 96, height = 96, className, style }: Props) {
  const url = optimizeAssetUrl(src);
  return (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      style={{
        objectFit: "contain",
        imageRendering: "auto",
        ...style,
      }}
    />
  );
}
