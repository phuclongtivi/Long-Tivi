"use client";

import { UserAvatarFrame } from "./UserAvatarFrame";

export function MenuTabAvatar({
  src,
  rank,
  size = 28,
}: {
  src?: string;
  rank?: string;
  size?: number;
}) {
  return <UserAvatarFrame src={src} rank={rank} size={size} alt="" />;
}
