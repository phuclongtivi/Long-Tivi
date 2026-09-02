"use client";

import type { AppRole } from "./roles";
import {
  AUTO_RANK_HINT,
  TIER_POINT_TOTAL,
  WARNINGS_TO_DEMOTE,
  type RankGuard,
  roleFromEarnedPoints,
} from "./auto-rank";

export function RankStatusCard({
  guard,
  onWarn,
  canWarn,
}: {
  guard: RankGuard;
  canWarn?: boolean;
  onWarn?: (note: string) => void;
}) {
  const next =
    guard.earnedPoints < TIER_POINT_TOTAL[2]
      ? { label: "Phóng viên", need: TIER_POINT_TOTAL[2] }
      : guard.earnedPoints < TIER_POINT_TOTAL[3]
        ? { label: "Nghệ sỹ", need: TIER_POINT_TOTAL[3] }
        : null;
  const byPts = roleFromEarnedPoints(guard.earnedPoints);

  return (
    <section
      style={{
        background: "var(--pl-surface)",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 2px 8px rgba(80,50,30,.12)",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Hạng tài khoản</h3>
      <p style={{ margin: 0, fontSize: 13 }}>
        Hiện tại: <b>{labelRole(guard.role)}</b> · Điểm đã thu thập: <b>{guard.earnedPoints}</b>
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>
        Mốc điểm: cấp 1 = {TIER_POINT_TOTAL[1]} · cấp 2 = {TIER_POINT_TOTAL[2]} · cấp 3 = {TIER_POINT_TOTAL[3]}
      </p>
      {next ? (
        <p style={{ margin: "6px 0 0", fontSize: 12 }}>
          Còn {Math.max(0, next.need - guard.earnedPoints)} điểm nữa để lên {next.label}.
        </p>
      ) : (
        <p style={{ margin: "6px 0 0", fontSize: 12 }}>Đã đủ mốc Nghệ sỹ theo điểm.</p>
      )}
      <p style={{ margin: "8px 0 0", fontSize: 11, color: "#666", lineHeight: 1.45 }}>
        {AUTO_RANK_HINT.hold} Cảnh báo: {guard.warnings.length}/{WARNINGS_TO_DEMOTE}.
        Hạng theo điểm (chưa áp nếu đang cao hơn): {labelRole(byPts)}.
      </p>
      {canWarn && onWarn && (
        <button
          type="button"
          style={{
            marginTop: 10,
            height: 36,
            borderRadius: 10,
            border: "none",
            background: "#8B4513",
            color: "#fff",
            fontWeight: 700,
          }}
          onClick={() => onWarn("Cảnh báo vi phạm")}
        >
          Gắn cảnh báo (Admin/Boss)
        </button>
      )}
    </section>
  );
}

function labelRole(role: AppRole): string {
  return (
    {
      guest: "Khách",
      user: "User",
      journalist: "Phóng viên",
      artist: "Nghệ sỹ",
      admin: "Admin",
      boss: "Boss",
    } as Record<AppRole, string>
  )[role];
}
