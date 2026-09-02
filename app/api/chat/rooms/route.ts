import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizeRank } from '@/lib/rank';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      return NextResponse.json({ rooms: [], myLives: [], canCreate: false });
    }
    const { prisma } = await import('@/lib/prisma');
    const session = await getServerSession(authOptions);
    const me = session?.user?.id;
    const q = (req.nextUrl.searchParams.get('q') || '').trim();
    const eventKey = (req.nextUrl.searchParams.get('eventKey') || '').trim();

    const now = new Date();
    try {
      await prisma.eventChatRoom.updateMany({
        where: {
          closed: false,
          OR: [
            { closesAt: { lte: now } },
            { eventEndedAt: { not: null, lte: new Date(now.getTime() - 48 * 3600 * 1000) } },
          ],
        },
        data: { closed: true },
      });
    } catch {
      /* schema chưa push */
    }

    let mentionedRoomIds: string[] = [];
    if (me) {
      try {
        const mentions = await prisma.eventChatMention.findMany({
          where: { mentionedUserId: me },
          orderBy: { createdAt: 'desc' },
          take: 80,
          select: { roomId: true },
        });
        mentionedRoomIds = Array.from(new Set(mentions.map((m) => m.roomId)));
      } catch {
        mentionedRoomIds = [];
      }
    }

    const rooms = await prisma.eventChatRoom.findMany({
      where: {
        closed: false,
        ...(eventKey ? { eventKey } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 100,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
    });

    const creatorIds = Array.from(new Set(rooms.map((r) => r.creatorId)));
    const creators = creatorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: creatorIds } },
          select: { id: true, name: true, fullName: true, rank: true, image: true },
        })
      : [];
    const cmap = Object.fromEntries(creators.map((c) => [c.id, c]));

    let filtered = rooms;
    if (q) {
      const ql = q.toLowerCase();
      filtered = rooms.filter((r) => {
        const c = cmap[r.creatorId];
        const hay = `${r.title} ${c?.name || ''} ${c?.fullName || ''}`.toLowerCase();
        return hay.includes(ql);
      });
    }

    const rows = filtered.map((r) => {
      const rank = normalizeRank(r.creatorRank || cmap[r.creatorId]?.rank);
      return {
        ...r,
        mentioned: me ? mentionedRoomIds.includes(r.id) : false,
        sortRank: rank === 'artist' ? 0 : rank === 'reporter' ? 1 : 2,
      };
    });

    rows.sort((a, b) => {
      if (a.mentioned !== b.mentioned) return a.mentioned ? -1 : 1;
      if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    let myLives: { id: string; title: string; endedAt: string | null }[] = [];
    if (me) {
      try {
        const lives = await prisma.liveSession.findMany({
          where: { userId: me },
          orderBy: { startedAt: 'desc' },
          take: 30,
          select: { id: true, title: true, endedAt: true },
        });
        myLives = lives.map((l) => ({
          id: l.id,
          title: l.title || `Live ${l.id.slice(0, 6)}`,
          endedAt: l.endedAt?.toISOString() || null,
        }));
      } catch {
        myLives = [];
      }
    }

    const rankSession = normalizeRank((session?.user as any)?.rank);
    return NextResponse.json({
      rooms: rows.map((r) => {
        const c = cmap[r.creatorId];
        return {
          id: r.id,
          title: r.title,
          liveSessionId: r.liveSessionId,
          eventKey: r.eventKey,
          accessMode: r.accessMode,
          creatorId: r.creatorId,
          creatorName: c?.fullName || c?.name || 'User',
          creatorRank: normalizeRank(r.creatorRank || c?.rank),
          creatorImage: c?.image || null,
          lastMessage: r.messages[0]?.content || null,
          lastMessageAt: r.messages[0]?.createdAt?.toISOString?.() || null,
          closesAt: r.closesAt?.toISOString?.() || null,
          eventEndedAt: r.eventEndedAt?.toISOString?.() || null,
          mentioned: !!r.mentioned,
          createdAt: r.createdAt.toISOString(),
        };
      }),
      myLives,
      canCreate: !!me && (['artist', 'reporter'].includes(rankSession) || ['boss', 'admin'].includes(String((session?.user as any)?.role || ''))),
    });
  } catch (e: any) {
    console.error('chat rooms GET', e?.message || e);
    return NextResponse.json({ rooms: [], myLives: [], canCreate: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
    }
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, rank: true, role: true },
    });
    const rank = normalizeRank(user?.rank);
    const isBoss = user?.role === 'boss' || user?.role === 'admin';
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || '').trim().slice(0, 120);
    if (!title) {
      return NextResponse.json({ error: 'Nhập tiêu đề phòng chat' }, { status: 400 });
    }
    const liveSessionId = String(body.liveSessionId || '').trim();
    const eventKey = String(body.eventKey || '').trim().slice(0, 160);
    const accessMode = body.accessMode === 'private' ? 'private' : 'public';
    if (!liveSessionId && !eventKey) {
      return NextResponse.json(
        { error: 'Room phải thuộc một thông báo hoặc phiên livestream' },
        { status: 400 }
      );
    }
    let eventEndedAt: Date | null = null;
    if (liveSessionId) {
      const live = await prisma.liveSession.findUnique({ where: { id: liveSessionId }, select: { id: true, userId: true, endedAt: true } });
      if (!live) return NextResponse.json({ error: 'Không tìm thấy phiên livestream' }, { status: 400 });
      if (live.userId !== session.user.id && !isBoss) return NextResponse.json({ error: 'Chỉ gắn livestream do bạn tổ chức' }, { status: 403 });
      eventEndedAt = live.endedAt || null;
    }
    if (eventKey) {
      const count = await prisma.eventChatRoom.count({ where: { eventKey, creatorId: session.user.id, closed: false } });
      if (count >= 3 && !isBoss) return NextResponse.json({ error: 'Bạn đã có tối đa 3 room trong thông báo này' }, { status: 429 });
    }
    const closesAt = eventEndedAt
      ? new Date(eventEndedAt.getTime() + 48 * 3600 * 1000)
      : new Date(Date.now() + 7 * 24 * 3600 * 1000);

    const room = await prisma.eventChatRoom.create({
      data: {
        title,
        liveSessionId: liveSessionId || null,
        eventKey: eventKey || null,
        accessMode,
        creatorId: session.user.id,
        creatorRank: isBoss && rank === 'user' ? 'artist' : rank,
        eventEndedAt,
        closesAt,
        closed: false,
      },
    });

    return NextResponse.json({
      room: {
        id: room.id,
        title: room.title,
        liveSessionId: room.liveSessionId,
        eventKey: room.eventKey,
        accessMode: room.accessMode,
        creatorRank: room.creatorRank,
        closesAt: room.closesAt?.toISOString?.() || null,
      },
    });
  } catch (e: any) {
    console.error('chat rooms POST', e);
    return NextResponse.json({ error: e?.message || 'Lỗi tạo phòng' }, { status: 500 });
  }
}
