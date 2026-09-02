import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss } from '@/lib/admin';
import { sendAppEmail } from '@/lib/mail';

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

export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;

  const status = req.nextUrl.searchParams.get('status') || 'pending_boss';
  const where =
    status === 'all'
      ? {}
      : status === 'pending'
        ? { approvalStatus: 'pending_boss' }
        : { approvalStatus: status };

  const rows = await prisma.liveSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          fullName: true,
          email: true,
          rank: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      title: r.title,
      approvalStatus: r.approvalStatus,
      scheduledStartAt: r.scheduledStartAt,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
      isPublic: r.isPublic,
      viewerCount: r.viewerCount,
      organizer: r.user,
      approvedAt: r.approvedAt,
    })),
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

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

  const live = await prisma.liveSession.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, fullName: true } },
    },
  });
  if (!live) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  const updated = await prisma.liveSession.updateMany({
    where: {
      id,
      approvalStatus: { in: ['pending_boss', 'pending_vote', 'none', 'rejected'] },
    },
    data:
      action === 'approve'
        ? {
            approvalStatus: 'approved',
            approvedByAdminId: session.user.id,
            approvedAt: new Date(),
          }
        : {
            approvalStatus: 'rejected',
            approvedByAdminId: session.user.id,
            approvedAt: new Date(),
          },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: 'Không cập nhật được (có thể đã xử lý)' }, { status: 409 });
  }

  if (live.user?.email) {
    await sendAppEmail({
      to: live.user.email,
      subject:
        action === 'approve'
          ? `[Long] Live đã được Boss duyệt: ${live.title}`
          : `[Long] Live bị từ chối: ${live.title}`,
      text:
        action === 'approve'
          ? `Livestream "${live.title}" đã được Boss duyệt và sẽ hiển thị trên app.`
          : `Livestream "${live.title}" chưa được duyệt. ${body.note || ''}`.trim(),
    }).catch(() => null);
  }

  const row = await prisma.liveSession.findUnique({ where: { id } });
  return NextResponse.json({
    success: true,
    item: row,
    message: action === 'approve' ? 'Đã duyệt — live hiện trên app' : 'Đã từ chối',
  });
}
