import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/live?zone=live|upcoming|archive
 * Danh sách sự kiện cho tab Sự kiện (khu vực trên)
 */
export async function GET(req: NextRequest) {
  try {
    const zone = req.nextUrl.searchParams.get('zone') || 'live';
    const topic = req.nextUrl.searchParams.get('topic');
    const now = new Date();

    let where: any = {};

    if (zone === 'live') {
      where = {
        startedAt: { lte: now },
        OR: [{ endedAt: null }, { endedAt: { gt: now } }],
      };
    } else if (zone === 'upcoming') {
      where = {
        OR: [
          { scheduledStartAt: { gt: now } },
          { AND: [{ startedAt: { gt: now } }] },
        ],
        endedAt: null,
      };
    } else if (zone === 'archive') {
      where = { endedAt: { not: null, lte: now } };
    }

    // status active_or_upcoming (login share)
    const status = req.nextUrl.searchParams.get('status');
    if (status === 'active_or_upcoming') {
      where = {
        endedAt: null,
      };
    }

    // Public chỉ thấy live đã Boss duyệt; Boss xem được cả pending
    const session = await getServerSession(authOptions);
    const boss =
      session?.user?.id &&
      (await isBoss(session.user.id, session.user.email).catch(() => false));
    if (!boss) {
      where = {
        ...where,
        approvalStatus: 'approved',
      };
    }

    const lives = await prisma.liveSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        viewerCount: true,
        startedAt: true,
        endedAt: true,
        scheduledStartAt: true,
        isPublic: true,
        requiresTicket: true,
        ticketPriceMin: true,
        ticketPriceMax: true,
        ticketHint: true,
        approvalStatus: true,
        userId: true,
      },
    });

    return NextResponse.json({
      lives: lives.map((l) => ({
        id: l.id,
        title: l.title,
        viewerCount: l.viewerCount,
        isPublic: l.isPublic,
        startedAt: l.startedAt?.toISOString?.() || l.startedAt,
        endedAt: l.endedAt?.toISOString?.() || l.endedAt,
        scheduledStartAt: l.scheduledStartAt?.toISOString?.() || null,
        topic: topic || null,
        requiresTicket: (l as any).requiresTicket || false,
        ticketPriceMin: (l as any).ticketPriceMin,
        ticketPriceMax: (l as any).ticketPriceMax,
        approvalStatus: (l as any).approvalStatus,
      })),
    });
  } catch (e: any) {
    console.error('GET /api/live', e);
    return NextResponse.json({ lives: [], error: e?.message }, { status: 200 });
  }
}
