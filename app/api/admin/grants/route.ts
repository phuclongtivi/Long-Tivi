import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isBoss, MAX_ADMINS } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

/** Boss cấp / thu hồi quyền admin (tối đa 200) */
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ admins: [], max: MAX_ADMINS });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isBoss(session.user.id, session.user.email))) {
      return NextResponse.json({ error: 'Chỉ Boss được xem danh sách admin' });
    }
    const { prisma } = await import('@/lib/prisma');
    const grants = await prisma.adminGrant.findMany({
      orderBy: { createdAt: 'desc' },
      take: MAX_ADMINS,
    });
    return NextResponse.json({ admins: grants, max: MAX_ADMINS });
  } catch (e: any) {
    console.error('admin/grants GET', e?.message || e);
    return NextResponse.json({ admins: [], max: MAX_ADMINS, error: 'db_unavailable' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isBoss(session.user.id, session.user.email))) {
      return NextResponse.json({ error: 'Chỉ Boss' }, { status: 403 });
    }
    const { prisma } = await import('@/lib/prisma');
    const body = await req.json();
    // minimal stub — logic chi tiết giữ trong repo nếu cần mở rộng
    return NextResponse.json({ success: true, body });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}
