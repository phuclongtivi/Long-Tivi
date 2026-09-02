"use client";

import { PHUC_AVATAR_WEBP, PHUC_LOGO_WEBP } from "./media";

export const PHUC_LOGO = PHUC_LOGO_WEBP;
export const PHUC_AVATAR = PHUC_AVATAR_WEBP;

type Props = { size?: number; className?: string; src?: string; name?: string };

export function PhucChatbotAvatar({ size = 56, className, src, name = "AI Phúc" }: Props) {
  return (
    <img
      src={src || PHUC_AVATAR}
      alt={name}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size, objectFit: "contain", background: "transparent" }}
    />
  );
}
