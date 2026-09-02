import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function requireBoss() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!(await isBoss(session.user.id, session.user.email))) {
    return { error: NextResponse.json({ error: 'Chỉ Boss' }, { status: 403 }) };
  }
  return { session };
}

/** GET — lưới yêu cầu mua gói chatbot (pending trước) */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;

  const status = req.nextUrl.searchParams.get('status') || 'pending';
  const rows = await prisma.chatbotQuotaRequest.findMany({
    where: status === 'all' ? {} : { status },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // kèm tên user
  const userIds = Array.from(new Set(rows.map((r) => r.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      fullName: true,
      email: true,
      aiDailyBonus: true,
    },
  });
  const umap = Object.fromEntries(users.map((u) => [u.id, u]));

  return NextResponse.json({
    items: rows.map((r) => ({
      ...r,
      user: umap[r.userId] || null,
    })),
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

/**
 * POST — Boss duyệt / từ chối
 * body: { id, action: 'approve' | 'reject', note? }
 * approve: cộng dồn dailyQuotaAdd vào user.aiDailyBonus
 */
export async function POST(req: NextRequest) {
  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;
  const session = gate.session!;

  const body = await req.json();
  const id = body.id as string;
  const action = body.action as string;
  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'id và action (approve|reject) bắt buộc' }, { status: 400 });
  }

  const row = await prisma.chatbotQuotaRequest.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  if (row.status !== 'pending') {
    return NextResponse.json({ error: `Đã ${row.status}` }, { status: 400 });
  }

  if (action === 'reject') {
    // Chỉ reject nếu còn pending (tránh double-click / 2 tab Boss)
    const rejected = await prisma.chatbotQuotaRequest.updateMany({
      where: { id, status: 'pending' },
      data: {
        status: 'rejected',
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        note: body.note || 'Boss từ chối',
      },
    });
    if (rejected.count === 0) {
      return NextResponse.json(
        { error: 'Yêu cầu đã được xử lý bởi phiên khác (xung đột đồng thời)' },
        { status: 409 }
      );
    }
    const updated = await prisma.chatbotQuotaRequest.findUnique({ where: { id } });
    return NextResponse.json({ success: true, item: updated, message: 'Đã từ chối' });
  }

  // approve — atomic: chỉ 1 Boss thắng khi status còn pending
  try {
    const result = await prisma.$transaction(async (tx) => {
      const locked = await tx.chatbotQuotaRequest.updateMany({
        where: { id, status: 'pending' },
        data: {
          status: 'approved',
          reviewedById: session.user.id,
          reviewedAt: new Date(),
          note: body.note || `Duyệt +${row.dailyQuotaAdd} câu/ngày`,
        },
      });
      if (locked.count === 0) {
        throw new Error('CONFLICT');
      }
      const user = await tx.user.update({
        where: { id: row.userId },
        data: { aiDailyBonus: { increment: row.dailyQuotaAdd } },
        select: { id: true, aiDailyBonus: true, name: true, fullName: true },
      });
      const updated = await tx.chatbotQuotaRequest.findUnique({ where: { id } });
      return { updated, user };
    });

    return NextResponse.json({
      success: true,
      item: result.updated,
      user: result.user,
      message: `Đã duyệt: +${row.dailyQuotaAdd} câu/ngày (tổng bonus ${result.user.aiDailyBonus})`,
    });
  } catch (e: any) {
    if (e?.message === 'CONFLICT') {
      return NextResponse.json(
        { error: 'Yêu cầu đã được duyệt/từ chối ở phiên khác (xung đột đồng thời)' },
        { status: 409 }
      );
    }
    throw e;
  }
}
