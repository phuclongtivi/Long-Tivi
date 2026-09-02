/**
 * Giới hạn câu trả lời AI (Phúc) / user / ngày
 * - base + user.aiDailyBonus
 * - Tăng atomic qua AiDailyUsage (chống request song song vượt hạn)
 */

import { prisma } from '@/lib/prisma';

const DEFAULT_DAILY_LIMIT = 4;

function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function subjectKey(userId?: string | null, sessionKey?: string | null): string | null {
  if (userId) return `user:${userId}`;
  if (sessionKey) return `guest:${sessionKey}`;
  return null;
}

export async function getBaseDailyAiLimit(): Promise<number> {
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: 'ai_daily_reply_limit' },
    });
    const n = row?.value ? parseInt(row.value, 10) : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  } catch {
    /* ignore */
  }
  const envN = parseInt(process.env.AI_DAILY_REPLY_LIMIT || '', 10);
  if (Number.isFinite(envN) && envN > 0) return envN;
  return DEFAULT_DAILY_LIMIT;
}

export async function getDailyAiLimit(): Promise<number> {
  return getBaseDailyAiLimit();
}

export async function getEffectiveDailyLimit(userId?: string | null): Promise<number> {
  const base = await getBaseDailyAiLimit();
  if (!userId) return base;
  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiDailyBonus: true },
    });
    return base + (u?.aiDailyBonus || 0);
  } catch {
    return base;
  }
}

/**
 * Kiểm tra + giữ chỗ 1 slot quota (atomic).
 * Trả allowed=false nếu đã đủ hạn hoặc race thua.
 */
export async function checkAndConsumeAiQuota(opts: {
  userId?: string | null;
  sessionKey?: string | null;
  isBoss?: boolean;
}): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  message?: string;
  renewUrl?: string;
}> {
  const limit = await getEffectiveDailyLimit(opts.userId);
  if (opts.isBoss) {
    return { allowed: true, used: 0, limit, remaining: limit };
  }

  const key = subjectKey(opts.userId, opts.sessionKey);
  if (!key) {
    return {
      allowed: false,
      used: 0,
      limit,
      remaining: 0,
      message: 'Vui lòng đăng nhập hoặc mở lại app để dùng trợ lý Phúc.',
      renewUrl: '/store?filter=chatbot',
    };
  }

  const day = dayKey();

  try {
    await prisma.aiDailyUsage.upsert({
      where: { subjectKey_day: { subjectKey: key, day } },
      create: { subjectKey: key, day, count: 0 },
      update: {},
    });

    const updated = await prisma.$executeRaw`
      UPDATE "AiDailyUsage"
      SET "count" = "count" + 1, "updatedAt" = NOW()
      WHERE "subjectKey" = ${key} AND "day" = ${day} AND "count" < ${limit}
    `;

    const row = await prisma.aiDailyUsage.findUnique({
      where: { subjectKey_day: { subjectKey: key, day } },
    });
    const used = row?.count ?? 0;

    if (!updated || Number(updated) === 0) {
      return {
        allowed: false,
        used: Math.max(used, limit),
        limit,
        remaining: 0,
        message: `Bạn đã dùng hết ${limit} câu trả lời AI hôm nay. Bấm **Gia hạn** để mua gói tăng hạn mức, hoặc mai quay lại.`,
        renewUrl: '/store?filter=chatbot',
      };
    }

    return {
      allowed: true,
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  } catch (e) {
    console.warn('AiDailyUsage fallback', e);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    let used = 0;
    if (opts.userId) {
      used = await prisma.assistantChat.count({
        where: {
          userId: opts.userId,
          role: 'assistant',
          createdAt: { gte: since },
        },
      });
    } else if (opts.sessionKey) {
      used = await prisma.assistantChat.count({
        where: {
          sessionKey: opts.sessionKey,
          role: 'assistant',
          createdAt: { gte: since },
        },
      });
    }
    if (used >= limit) {
      return {
        allowed: false,
        used,
        limit,
        remaining: 0,
        message: `Bạn đã dùng hết ${limit} câu trả lời AI hôm nay. Bấm **Gia hạn** để mua gói tăng hạn mức, hoặc mai quay lại.`,
        renewUrl: '/store?filter=chatbot',
      };
    }
    return {
      allowed: true,
      used: used + 1,
      limit,
      remaining: Math.max(0, limit - used - 1),
    };
  }
}
