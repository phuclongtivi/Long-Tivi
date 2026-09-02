import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VOTES_NEEDED = 50;

/**
 * POST /api/live/vote
 * actions:
 *  - open: Nghệ sĩ mở bình chọn cho phiên live của mình
 *  - cast: User khác bỏ phiếu yes/no
 *  - admin_approve: Admin/Boss duyệt sớm khi chưa đủ 50 phiếu
 *  - status: xem trạng thái (cũng có thể GET)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action as string;
    const liveSessionId = body.liveSessionId as string;

    if (!liveSessionId && action !== 'status') {
      return NextResponse.json({ error: 'Thiếu liveSessionId' }, { status: 400 });
    }

    const me = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // —— Mở bình chọn (chỉ Nghệ sĩ, chỉ live của mình) ——
    if (action === 'open') {
      if (me.rank !== 'artist' && me.trustLevel < 2) {
        return NextResponse.json(
          { error: 'Chỉ user hạng Nghệ sĩ mới được mở bình chọn tổ chức livestream' },
          { status: 403 }
        );
      }

      const live = await prisma.liveSession.findUnique({ where: { id: liveSessionId } });
      if (!live || live.userId !== me.id) {
        return NextResponse.json({ error: 'Chỉ chủ phiên live mới mở bình chọn' }, { status: 403 });
      }

      if (live.approvalStatus === 'approved') {
        return NextResponse.json({ error: 'Phiên này đã được duyệt' }, { status: 400 });
      }

      const updated = await prisma.liveSession.update({
        where: { id: liveSessionId },
        data: {
          approvalStatus: 'pending_vote',
          approvalVotesNeeded: VOTES_NEEDED,
          approvalYesCount: 0,
          voteOpenedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã mở bình chọn. Cần ${VOTES_NEEDED} phiếu đồng ý để tự động duyệt.`,
        live: updated,
      });
    }

    // —— Bỏ phiếu ——
    if (action === 'cast') {
      const vote = (body.vote as string) === 'no' ? 'no' : 'yes';

      const live = await prisma.liveSession.findUnique({ where: { id: liveSessionId } });
      if (!live) return NextResponse.json({ error: 'Live không tồn tại' }, { status: 404 });
      if (live.approvalStatus !== 'pending_vote') {
        return NextResponse.json({ error: 'Phiên này không đang mở bình chọn' }, { status: 400 });
      }
      if (live.userId === me.id) {
        return NextResponse.json({ error: 'Không được tự bỏ phiếu cho live của mình' }, { status: 400 });
      }

      // Upsert vote
      await prisma.liveApprovalVote.upsert({
        where: {
          liveSessionId_voterId: { liveSessionId, voterId: me.id },
        },
        create: { liveSessionId, voterId: me.id, vote },
        update: { vote },
      });

      const yesCount = await prisma.liveApprovalVote.count({
        where: { liveSessionId, vote: 'yes' },
      });

      let status = live.approvalStatus;
      let approvedAt = live.approvedAt;
      let autoApproved = false;

      if (yesCount >= (live.approvalVotesNeeded || VOTES_NEEDED)) {
        status = 'approved';
        approvedAt = new Date();
        autoApproved = true;
      }

      const updated = await prisma.liveSession.update({
        where: { id: liveSessionId },
        data: {
          approvalYesCount: yesCount,
          approvalStatus: status,
          approvedAt,
        },
      });

      return NextResponse.json({
        success: true,
        yesCount,
        needed: live.approvalVotesNeeded || VOTES_NEEDED,
        autoApproved,
        message: autoApproved
          ? 'Đủ phiếu đồng ý — phiên livestream đã được APPROVED tự động.'
          : `Đã ghi nhận phiếu. Hiện có ${yesCount}/${live.approvalVotesNeeded || VOTES_NEEDED} phiếu đồng ý.`,
        live: updated,
      });
    }

    // —— Admin / Boss duyệt sớm ——
    if (action === 'admin_approve') {
      if (me.role !== 'admin' && me.role !== 'boss') {
        return NextResponse.json({ error: 'Chỉ Admin/Boss được duyệt sớm' }, { status: 403 });
      }

      const live = await prisma.liveSession.findUnique({ where: { id: liveSessionId } });
      if (!live) return NextResponse.json({ error: 'Live không tồn tại' }, { status: 404 });

      const updated = await prisma.liveSession.update({
        where: { id: liveSessionId },
        data: {
          approvalStatus: 'approved',
          approvedByAdminId: me.id,
          approvedAt: new Date(),
          // Artist được tổ chức live trên màn chính khi approved
        },
      });

      // Đồng bộ quyền tổ chức nếu cần
      await prisma.user.update({
        where: { id: live.userId },
        data: { canOrganizeLive: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Admin đã duyệt phiên livestream (không cần đủ 50 phiếu).',
        live: updated,
      });
    }

    // —— Status ——
    if (action === 'status') {
      const live = await prisma.liveSession.findUnique({
        where: { id: liveSessionId },
        include: {
          approvalVotes: { select: { vote: true, voterId: true, createdAt: true } },
        },
      });
      if (!live) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const yesCount = live.approvalVotes.filter((v) => v.vote === 'yes').length;
      const myVote = live.approvalVotes.find((v) => v.voterId === me.id)?.vote ?? null;

      return NextResponse.json({
        approvalStatus: live.approvalStatus,
        yesCount,
        needed: live.approvalVotesNeeded || VOTES_NEEDED,
        myVote,
        approvedAt: live.approvedAt,
        approvedByAdminId: live.approvedByAdminId,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const liveSessionId = req.nextUrl.searchParams.get('liveSessionId');
  if (!liveSessionId) {
    return NextResponse.json({ error: 'liveSessionId required' }, { status: 400 });
  }
  // Reuse status logic via internal call pattern
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' });
  }

  const live = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    include: { approvalVotes: true },
  });
  if (!live) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const yesCount = live.approvalVotes.filter((v) => v.vote === 'yes').length;
  return NextResponse.json({
    approvalStatus: live.approvalStatus,
    yesCount,
    needed: live.approvalVotesNeeded || VOTES_NEEDED,
    approvedAt: live.approvedAt,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}
