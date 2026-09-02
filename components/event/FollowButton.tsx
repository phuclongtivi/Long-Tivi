"use client";

export function FollowButton({
  following,
  onToggle,
}: {
  following: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        height: 28,
        padding: "0 10px",
        borderRadius: 999,
        border: "none",
        fontWeight: 800,
        fontSize: 12,
        background: following ? "#E8D5C4" : "#E11D48",
        color: following ? "#111" : "#fff",
      }}
    >
      {following ? "Đang follow" : "Follow"}
    </button>
  );
}

export function UsernameWithFollow({
  name,
  following,
  onToggle,
}: {
  name: string;
  following: boolean;
  onToggle: () => void;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <b>@{name.replace(/^@/, "")}</b>
      <FollowButton following={following} onToggle={onToggle} />
    </span>
  );
}
