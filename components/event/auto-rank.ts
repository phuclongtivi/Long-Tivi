import type { AppRole } from "./roles";
import { TIER1_GRANT_COUNT, TIER1_POINT } from "./stickers-tier1";
import { TIER2_GRANT_COUNT, TIER2_POINT } from "./stickers-tier2";
import { TIER3_GRANT_COUNT, TIER3_POINT } from "./stickers-tier3";

/** Tổng điểm gói mở khoá từng cấp — mốc tự nâng hạng */
export const TIER_POINT_TOTAL = {
  1: TIER1_GRANT_COUNT * TIER1_POINT, // 5
  2: TIER2_GRANT_COUNT * TIER2_POINT, // 20
  3: TIER3_GRANT_COUNT * TIER3_POINT, // 100
} as const;

export const WARNINGS_TO_DEMOTE = 2;

const LADDER: AppRole[] = ["user", "journalist", "artist"];

export type RankWarning = {
  at: string;
  byUserId: string;
  byRole: Extract<AppRole, "admin" | "boss">;
  note?: string;
};

export type RankGuard = {
  userId: string;
  role: AppRole;
  /** Điểm đã thu thập (earned — không trừ khi tiêu) */
  earnedPoints: number;
  warnings: RankWarning[];
  lastPromoteAt?: string;
  lastDemoteAt?: string;
};

export function roleFromEarnedPoints(earned: number): Extract<AppRole, "user" | "journalist" | "artist"> {
  if (earned >= TIER_POINT_TOTAL[3]) return "artist";
  if (earned >= TIER_POINT_TOTAL[2]) return "journalist";
  return "user";
}

function ladderIndex(role: AppRole): number {
  const i = LADDER.indexOf(role);
  return i < 0 ? 0 : i;
}

function isProtected(role: AppRole): boolean {
  return role === "admin" || role === "boss";
}

/**
 * Tự nâng hạng khi đủ tổng điểm gói mở khoá cấp 2 / cấp 3.
 * Không hạ hạng trừ khi đủ 2 cảnh báo Admin/Boss.
 */
export function evaluateAutoRank(guard: RankGuard): {
  role: AppRole;
  promoted: boolean;
  demoted: boolean;
  reason: string;
} {
  if (isProtected(guard.role)) {
    return { role: guard.role, promoted: false, demoted: false, reason: "Admin/Boss không tự đổi hạng." };
  }

  const byPoints = roleFromEarnedPoints(guard.earnedPoints);
  const current = LADDER.includes(guard.role) ? guard.role : "user";
  const warnCount = guard.warnings.length;

  if (warnCount >= WARNINGS_TO_DEMOTE) {
    const down = LADDER[Math.max(0, ladderIndex(current) - 1)];
    return {
      role: down,
      promoted: false,
      demoted: down !== current,
      reason: `Đủ ${WARNINGS_TO_DEMOTE} cảnh báo Admin/Boss — hạ 1 bậc.`,
    };
  }

  if (ladderIndex(byPoints) > ladderIndex(current)) {
    return {
      role: byPoints,
      promoted: true,
      demoted: false,
      reason: `Đủ ${guard.earnedPoints} điểm (≥ mốc ${byPoints === "artist" ? TIER_POINT_TOTAL[3] : TIER_POINT_TOTAL[2]}) — tự nâng hạng.`,
    };
  }

  return {
    role: current,
    promoted: false,
    demoted: false,
    reason: "Giữ hạng. Chưa đủ điểm lên bậc sau; chưa đủ 2 cảnh báo để hạ.",
  };
}

export function applyAutoRank(guard: RankGuard): RankGuard {
  const r = evaluateAutoRank(guard);
  if (r.promoted) {
    return {
      ...guard,
      role: r.role,
      lastPromoteAt: new Date().toISOString(),
    };
  }
  if (r.demoted) {
    return {
      ...guard,
      role: r.role,
      warnings: [],
      lastDemoteAt: new Date().toISOString(),
    };
  }
  return { ...guard, role: r.role };
}

/** Gọi sau mỗi lần cộng điểm nhận sticker / mở khoá. */
export function onPointsCollected(guard: RankGuard, earnedPoints: number): RankGuard {
  return applyAutoRank({ ...guard, earnedPoints });
}

export function addRankWarning(
  guard: RankGuard,
  by: { userId: string; role: Extract<AppRole, "admin" | "boss">; note?: string }
): RankGuard {
  if (by.role !== "admin" && by.role !== "boss") {
    throw new Error("Chỉ Admin hoặc Boss được gắn cảnh báo.");
  }
  if (isProtected(guard.role)) {
    throw new Error("Không gắn cảnh báo hạ hạng cho Admin/Boss.");
  }
  const next: RankGuard = {
    ...guard,
    warnings: [
      ...guard.warnings,
      {
        at: new Date().toISOString(),
        byUserId: by.userId,
        byRole: by.role,
        note: by.note,
      },
    ],
  };
  return applyAutoRank(next);
}

export const AUTO_RANK_HINT = {
  tier1: `Cấp 1 (mở kho): ${TIER_POINT_TOTAL[1]} điểm — user + CCCD.`,
  tier2: `Đủ ${TIER_POINT_TOTAL[2]} điểm (gói cấp 2) → tự lên Phóng viên.`,
  tier3: `Đủ ${TIER_POINT_TOTAL[3]} điểm (gói cấp 3) → tự lên Nghệ sỹ.`,
  hold: "Đã lên hạng thì không xuống, trừ khi Admin/Boss gắn đủ 2 cảnh báo.",
} as const;
