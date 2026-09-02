import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isBoss } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

/**
 * Boss nâng cấp / hạ cấp hạng user
 * POST { userId | email, rank: 'normal' | 'pro' | 'artist' }
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'No DATABASE_URL' }, { status: 500 });
    }
    const { prisma } = await import('@/lib/prisma');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!(await isBoss(session.user.id, session.user.email))) {
      return NextResponse.json({ error: 'Chỉ Boss được nâng cấp hạng user' }, { status: 403 });
    }

    const body = await req.json();
    const rank = (body.rank || '').toLowerCase();
    if (!['normal', 'pro', 'artist'].includes(rank)) {
      return NextResponse.json({ error: 'rank phải là normal | pro | artist' }, { status: 400 });
    }

    let user = body.userId
      ? await prisma.user.findUnique({ where: { id: body.userId } })
      : null;
    if (!user && body.email) {
      user = await prisma.user.findFirst({
        where: { email: String(body.email).toLowerCase().trim() },
      });
    }
    if (!user && body.phone) {
      user = await prisma.user.findFirst({
        where: { phone: String(body.phone).trim() },
      });
    }
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy user' }, { status: 404 });
    }

    const trustLevel = rank === 'artist' ? 2 : rank === 'pro' ? 1 : 0;
    const canOrganizeLive = rank === 'artist' ? true : user.canOrganizeLive;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { rank, trustLevel, canOrganizeLive },
      select: {
        id: true,
        name: true,
        email: true,
        fullName: true,
        rank: true,
        trustLevel: true,
        canOrganizeLive: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message:
        rank === 'artist'
          ? `Đã nâng ${updated.fullName || updated.name || updated.email} lên Nghệ sĩ.`
          : `Đã đặt hạng ${rank} cho user.`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}

/** GET ?q= — Boss tìm user. Lúc build/không session → 200 + [] (tránh fail Vercel) */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ users: [] });
    }
    if (!(await isBoss(session.user.id, session.user.email))) {
      return NextResponse.json({ users: [] });
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ users: [] });
    }

    const q = (req.nextUrl.searchParams.get('q') || '').trim();
    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const { prisma } = await import('@/lib/prisma');
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { id: q },
        ],
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        email: true,
        phone: true,
        rank: true,
        trustLevel: true,
      },
      take: 20,
    });

    return NextResponse.json({ users });
  } catch (e: any) {
    console.error('admin/rank GET', e?.message || e);
    return NextResponse.json({ users: [] });
  }
}
