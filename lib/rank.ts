import { prisma } from '@/lib/prisma';

/**
 * Hạng: user | reporter | artist
 * GIỮ HẠNG (nội bộ — không ghi trong hướng dẫn app):
 * - Đã nâng hạng thì không tự xuống hạng
 * - Chỉ lên cao hơn theo điều kiện
 * - Chỉ Admin/Boss được hạ hạng
 */

export type AppRank = 'user' | 'reporter' | 'artist';

export const RANK_LABEL: Record<AppRank, string> = {
  user: 'User',
  reporter: 'Phóng viên',
  artist: 'Nghệ sĩ',
};

export const RANK_TRUST: Record<AppRank, number> = {
  user: 0,
  reporter: 1,
  artist: 2,
};

const RANK_ORDER: AppRank[] = ['user', 'reporter', 'artist'];

export function normalizeRank(rank?: string | null): AppRank {
  if (rank === 'artist' || rank === 'nghe_sy') return 'artist';
  if (rank === 'reporter' || rank === 'phong_vien' || rank === 'pro') return 'reporter';
  return 'user';
}

export function rankIndex(rank?: string | null): number {
  return RANK_ORDER.indexOf(normalizeRank(rank));
}

export function canAutoPromote(current?: string | null, next?: string | null): boolean {
  return rankIndex(next) > rankIndex(current);
}

export function permissionsForRank(rank?: string | null) {
  const r = normalizeRank(rank);
  return {
    rank: r,
    label: RANK_LABEL[r],
    canViewEvents: true,
    canUseAppFull: true,
    // Mọi user đã đăng nhập (không phải guest) đều được tạo phiên livestream
    canLivestream: true,
    // User / Phóng viên: live chủ yếu trong tab LIVE (events); Nghệ sĩ: lên màn hình chính
    liveOnlyInEventsTab: r !== 'artist',
    canOrganizeEvent: r === 'artist',
    canShowLiveOnHome: r === 'artist',
    canInviteGuests: r === 'artist',
    canUseOrganizerPanel: r === 'artist' || r === 'reporter',
    canCreateStoreProduct: r === 'artist',
    canCreateArtistShop: r === 'artist',
  };
}

export async function tryPromoteToReporter(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { upgraded: false };
  const r = normalizeRank(user.rank);
  if (r === 'reporter' || r === 'artist') return { upgraded: false, rank: r };

  const hasId = !!(user.idNumber && user.fullName) || user.idCardVerified;
  const hasBank = !!(user.bankAccountNumber && user.bankName);
  const hasFb = !!user.socialFacebook || user.profileFromOAuth;

  if (hasId && hasBank && hasFb && canAutoPromote(r, 'reporter')) {
    await prisma.user.update({
      where: { id: userId },
      data: { rank: 'reporter', trustLevel: 1 },
    });
    return { upgraded: true, newRank: 'reporter' as AppRank };
  }
  return { upgraded: false, rank: r };
}

export async function tryPromoteToArtistByMonthlyViews(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { upgraded: false };
  if (normalizeRank(user.rank) === 'artist') {
    return { upgraded: false, rank: 'artist' as AppRank };
  }

  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const lives = await prisma.liveSession.findMany({
    where: { userId, startedAt: { gte: start } },
    select: { viewerCount: true },
  });
  const totalViews = lives.reduce((s, l) => s + (l.viewerCount || 0), 0);

  if (totalViews >= 10_000 && canAutoPromote(user.rank, 'artist')) {
    await prisma.user.update({
      where: { id: userId },
      data: { rank: 'artist', trustLevel: 2, canOrganizeLive: true },
    });
    return { upgraded: true, newRank: 'artist' as AppRank, totalViews };
  }
  return { upgraded: false, totalViews };
}

export async function recordAttendance(userId: string, liveSessionId: string) {
  await prisma.liveAttendance.upsert({
    where: { userId_liveSessionId: { userId, liveSessionId } },
    create: { userId, liveSessionId },
    update: {},
  });
  await prisma.user.update({
    where: { id: userId },
    data: { attendedLives: { increment: 1 } },
  });
  await tryPromoteToReporter(userId);
  return { upgraded: false };
}

export async function finishLiveSession(liveSessionId: string, viewerCount: number) {
  const live = await prisma.liveSession.update({
    where: { id: liveSessionId },
    data: { endedAt: new Date(), viewerCount },
  });
  const isHighView = viewerCount >= 1000;
  await prisma.user.update({
    where: { id: live.userId },
    data: {
      organizedLives: { increment: 1 },
      highViewLives: isHighView ? { increment: 1 } : undefined,
    },
  });
  return tryPromoteToArtistByMonthlyViews(live.userId);
}

/** Chỉ Admin/Boss — có thể nâng hoặc hạ */
export async function adminSetRank(userId: string, newRank: AppRank) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      rank: newRank,
      trustLevel: RANK_TRUST[newRank],
      canOrganizeLive: newRank === 'artist',
    },
  });
  return { success: true, rank: newRank };
}
