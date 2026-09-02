/** Email Boss (chủ app) – set trong .env: BOSS_EMAIL=you@example.com */
export function getBossEmail() {
  return (process.env.BOSS_EMAIL || '').toLowerCase().trim();
}

async function db() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const mod = await import('@/lib/prisma');
    return mod.prisma;
  } catch {
    return null;
  }
}

export async function isBoss(userId: string, email?: string | null) {
  try {
    const bossEmail = getBossEmail();
    if (bossEmail && email && email.toLowerCase() === bossEmail) return true;
    const prisma = await db();
    if (!prisma) return !!(bossEmail && email && email.toLowerCase() === bossEmail);
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true } });
    if (!u) return false;
    if (u.role === 'boss') return true;
    if (bossEmail && u.email?.toLowerCase() === bossEmail) return true;
    return false;
  } catch {
    return false;
  }
}

export async function isAppAdmin(userId: string, email?: string | null) {
  try {
    if (await isBoss(userId, email)) return true;
    const prisma = await db();
    if (!prisma) return false;
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (u?.role === 'admin' || u?.role === 'boss') return true;
    const grant = await prisma.adminGrant.findFirst({
      where: { userId, active: true },
    });
    return !!grant;
  } catch {
    return false;
  }
}

export const MAX_ADMINS = 200;

export async function isArtist(userId: string) {
  try {
    const prisma = await db();
    if (!prisma) return false;
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { rank: true, trustLevel: true },
    });
    if (!u) return false;
    return (
      u.rank === 'artist' ||
      u.rank === 'nghe_sy' ||
      (u.trustLevel ?? 0) >= 2
    );
  } catch {
    return false;
  }
}

export async function isReporter(userId: string) {
  try {
    if (await isArtist(userId)) return true;
    const prisma = await db();
    if (!prisma) return false;
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { rank: true, trustLevel: true },
    });
    if (!u) return false;
    return (
      u.rank === 'reporter' ||
      u.rank === 'phong_vien' ||
      u.rank === 'pro' ||
      (u.trustLevel ?? 0) >= 1
    );
  } catch {
    return false;
  }
}

export async function canCreateStoreProduct(userId: string, email?: string | null) {
  try {
    if (await isAppAdmin(userId, email)) return true;
    return isArtist(userId);
  } catch {
    return false;
  }
}
