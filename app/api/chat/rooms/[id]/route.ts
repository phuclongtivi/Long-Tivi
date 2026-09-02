import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { normalizeRank } from '@/lib/rank';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

function onlineLabel(d?: Date | null) {
  if (!d) return 'Ngoại tuyến';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 2) return 'Đang hoạt động';
  if (mins < 60) return `${mins} phút trước`;
  if (mins < 24 * 60) return `${Math.floor(mins / 60)} giờ trước`;
  return `${Math.floor(mins / 1440)} ngày trước`;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ room: null, members: [] });
    }
    const { prisma } = await import('@/lib/prisma');
    const roomId = ctx.params.id;
    const room = await prisma.eventChatRoom.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ room: null, members: [] });

    const msgs = await prisma.eventChatMessage.findMany({
      where: { roomId },
      select: { userId: true },
    });
    const ids = Array.from(new Set([room.creatorId, ...msgs.map((m) => m.userId)]));
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        fullName: true,
        image: true,
        rank: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      room: {
        id: room.id,
        title: room.title,
        closed: room.closed,
        creatorId: room.creatorId,
        creatorRank: room.creatorRank,
        liveSessionId: room.liveSessionId,
        eventEndedAt: room.eventEndedAt?.toISOString() || null,
        closesAt: room.closesAt?.toISOString() || null,
      },
      members: users.map((u) => ({
        id: u.id,
        name: u.fullName || u.name || u.id.slice(0, 8),
        image: u.image,
        rank: normalizeRank(u.rank),
        lastOnline: onlineLabel(u.updatedAt),
        lastOnlineAt: u.updatedAt?.toISOString() || null,
        isCreator: u.id === room.creatorId,
      })),
    });
  } catch (e: any) {
    console.error('room GET', e);
    return NextResponse.json({ room: null, members: [] });
  }
}

/** PATCH { action: 'end_event' } — đóng sau 48h kể từ bây giờ */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
    }
    const { prisma } = await import('@/lib/prisma');
    const room = await prisma.eventChatRoom.findUnique({ where: { id: ctx.params.id } });
    if (!room) return NextResponse.json({ error: 'Không có phòng' }, { status: 404 });

    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });
    const isBoss = me?.role === 'boss' || me?.role === 'admin';
    if (room.creatorId !== session.user.id && !isBoss) {
      return NextResponse.json({ error: 'Chỉ người tạo phòng / admin được kết thúc sự kiện' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    if (body.action !== 'end_event') {
      return NextResponse.json({ error: 'action không hợp lệ' }, { status: 400 });
    }

    const now = new Date();
    const closesAt = new Date(now.getTime() + 48 * 3600 * 1000);
    const updated = await prisma.eventChatRoom.update({
      where: { id: room.id },
      data: { eventEndedAt: now, closesAt, closed: false },
    });

    if (room.liveSessionId) {
      try {
        await prisma.liveSession.update({
          where: { id: room.liveSessionId },
          data: { endedAt: now },
        });
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({
      ok: true,
      eventEndedAt: updated.eventEndedAt?.toISOString(),
      closesAt: updated.closesAt?.toISOString(),
      message: 'Sự kiện đã kết thúc. Phòng chat tự đóng sau 48 giờ.',
    });
  } catch (e: any) {
    console.error('room PATCH', e);
    return NextResponse.json({ error: e?.message || 'Lỗi' }, { status: 500 });
  }
}
