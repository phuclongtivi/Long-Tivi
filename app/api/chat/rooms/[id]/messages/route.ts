import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

/** Parse @mentions kiểu X: @username hoặc @"Tên có dấu" */
function extractMentions(text: string): string[] {
  const names: string[] = [];
  const re = /@(?:"([^"]+)"|([A-Za-z0-9_\.\u00C0-\u024F\u1E00-\u1EFF]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = (m[1] || m[2] || '').trim();
    if (n) names.push(n);
  }
  return Array.from(new Set(names));
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ messages: [], room: null });
    }
    const { prisma } = await import('@/lib/prisma');
    const roomId = ctx.params.id;
    const room = await prisma.eventChatRoom.findUnique({ where: { id: roomId } });
    if (!room || room.closed) {
      return NextResponse.json({ messages: [], room: null, error: 'Phòng đã đóng hoặc không tồn tại' });
    }
    const messages = await prisma.eventChatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    const userIds = Array.from(new Set(messages.map((x) => x.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, fullName: true, image: true, rank: true },
    });
    const umap = Object.fromEntries(users.map((u) => [u.id, u]));

    return NextResponse.json({
      room: {
        id: room.id,
        title: room.title,
        closed: room.closed,
        closesAt: room.closesAt?.toISOString?.() || null,
        creatorRank: room.creatorRank,
      },
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        user: {
          id: m.userId,
          name: umap[m.userId]?.fullName || umap[m.userId]?.name || m.userId.slice(0, 8),
          image: umap[m.userId]?.image || null,
          rank: umap[m.userId]?.rank || 'user',
        },
      })),
    });
  } catch (e: any) {
    console.error('room messages GET', e);
    return NextResponse.json({ messages: [], room: null });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
    }
    const { prisma } = await import('@/lib/prisma');
    const roomId = ctx.params.id;
    const room = await prisma.eventChatRoom.findUnique({ where: { id: roomId } });
    if (!room || room.closed) {
      return NextResponse.json({ error: 'Phòng đã đóng' }, { status: 400 });
    }
    if (room.closesAt && room.closesAt <= new Date()) {
      await prisma.eventChatRoom.update({ where: { id: roomId }, data: { closed: true } });
      return NextResponse.json({ error: 'Phòng đã hết hạn (48h sau sự kiện)' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const content = String(body.content || '').trim().slice(0, 500);
    if (!content) {
      return NextResponse.json({ error: 'Nhập tin nhắn' }, { status: 400 });
    }

    const msg = await prisma.eventChatMessage.create({
      data: { roomId, userId: session.user.id, content },
    });
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { updatedAt: new Date() },
      });
    } catch { /* ignore */ }

    // Tag @user — tìm user theo name/fullName và ghi mention
    const tags = extractMentions(content);
    if (tags.length) {
      const candidates = await prisma.user.findMany({
        where: {
          OR: tags.flatMap((n) => [
            { name: { equals: n, mode: 'insensitive' } },
            { fullName: { equals: n, mode: 'insensitive' } },
          ]),
        },
        select: { id: true },
        take: 20,
      });
      for (const u of candidates) {
        if (u.id === session.user.id) continue;
        try {
          await prisma.eventChatMention.create({
            data: {
              roomId,
              mentionedUserId: u.id,
              messageId: msg.id,
            },
          });
        } catch {
          /* unique skip */
        }
      }
    }

    return NextResponse.json({
      message: {
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        userId: session.user.id,
      },
    });
  } catch (e: any) {
    console.error('room messages POST', e);
    return NextResponse.json({ error: e?.message || 'Lỗi gửi' }, { status: 500 });
  }
}
