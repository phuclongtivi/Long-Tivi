import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isBoss } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

function ym(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Boss chỉ định admin nhận hoa hồng refer khi không xác định được người giới thiệu */
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ list: [], currentMonth: ym() });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isBoss(session.user.id, session.user.email))) {
      return NextResponse.json({ error: 'Chỉ Boss' });
    }
    const { prisma } = await import('@/lib/prisma');
    const list = await prisma.monthlyReferAdmin.findMany({
      orderBy: { yearMonth: 'desc' },
      take: 24,
    });
    return NextResponse.json({ list, currentMonth: ym() });
  } catch (e: any) {
    console.error('monthly-refer GET', e?.message || e);
    return NextResponse.json({ list: [], currentMonth: ym(), error: 'db_unavailable' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isBoss(session.user.id, session.user.email))) {
      return NextResponse.json({ error: 'Chỉ Boss được chỉ định admin nhận refer tháng' }, { status: 403 });
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'No DATABASE_URL' }, { status: 500 });
    }
    const { prisma } = await import('@/lib/prisma');
    const { adminUserId, adminEmail, yearMonth, note } = await req.json();
    let targetId = adminUserId;
    if (!targetId && adminEmail) {
      const u = await prisma.user.findFirst({ where: { email: String(adminEmail).toLowerCase() } });
      if (!u) return NextResponse.json({ error: 'Không tìm thấy admin' }, { status: 404 });
      targetId = u.id;
    }
    if (!targetId) {
      return NextResponse.json({ error: 'Thiếu adminUserId hoặc adminEmail' }, { status: 400 });
    }

    const month = yearMonth || ym();
    const row = await prisma.monthlyReferAdmin.upsert({
      where: { yearMonth: month },
      create: {
        yearMonth: month,
        adminUserId: targetId,
        assignedById: session.user.id,
        note: note || null,
      },
      update: {
        adminUserId: targetId,
        assignedById: session.user.id,
        note: note || null,
      },
    });

    return NextResponse.json({
      success: true,
      row,
      message: `Đã chỉ định admin nhận hoa hồng refer không xác định được nguồn cho tháng ${month}`,
    });
  } catch (e: any) {
    console.error('monthly-refer POST', e?.message || e);
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}
