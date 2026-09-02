"use client";

import { UserAvatarFrame } from "./event/UserAvatarFrame";

const FRAME: Record<string, { label: string; border: string; glow: string }> = {
  guest: { label: "Khách", border: "#6B7A99", glow: "rgba(107,122,153,.35)" },
  user: { label: "Hội viên", border: "#C5D0E8", glow: "rgba(197,208,232,.35)" },
  journalist: { label: "Phóng viên", border: "#7AD0FF", glow: "rgba(122,208,255,.45)" },
  artist: { label: "Nghệ sỹ", border: "#FFD166", glow: "rgba(255,209,102,.45)" },
  admin: { label: "Admin", border: "#E11D48", glow: "rgba(225,29,72,.4)" },
  boss: { label: "Boss", border: "#FFD166", glow: "rgba(255,209,102,.55)" },
};

export default function UserChip({
  name,
  rank = "user",
  src,
}: {
  name?: string | null;
  rank?: string;
  src?: string | null;
}) {
  const f = FRAME[rank] || FRAME.user;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        maxWidth: 180,
        padding: "4px 8px",
        borderRadius: 10,
        border: `1.5px solid ${f.border}`,
        boxShadow: `0 0 0 1px ${f.glow}, 0 0 10px ${f.glow}`,
        background: "rgba(16,24,38,.55)",
        fontSize: 12,
        fontWeight: 800,
      }}
      title={f.label}
    >
      <UserAvatarFrame src={src} rank={rank} size={28} alt="" />
      <span
        className="pl-rank"
        style={{
          fontSize: 10,
          letterSpacing: 0.3,
          padding: "1px 6px",
          borderRadius: 6,
          border: `1px solid ${f.border}`,
          color: f.border,
        }}
      >
        {f.label}
      </span>
      <span
        className="pl-username"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: f.border,
        }}
      >
        {name || "Bạn"}
      </span>
    </span>
  );
}
