import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/chat?liveSessionId=xxx
 * Lấy tin nhắn chat của 1 buổi livestream
 * Chỉ user đã tham gia (có LiveAttendance) mới xem/gửi được
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const liveSessionId = searchParams.get('liveSessionId');

    if (!liveSessionId) {
      // 200 khi thiếu param — tránh fail collect page data lúc next build
      return NextResponse.json({ messages: [] });
    }

    // Nếu đã đăng nhập: kiểm tra đã tham gia chưa
    if (session?.user?.id) {
      const attended = await prisma.liveAttendance.findUnique({
        where: {
          userId_liveSessionId: {
            userId: session.user.id,
            liveSessionId,
          },
        },
      });
      // Host của buổi live cũng được phép
      const live = await prisma.liveSession.findUnique({
        where: { id: liveSessionId },
      });
      const isHost = live?.userId === session.user.id;
      if (!attended && !isHost) {
        return NextResponse.json({ error: 'Bạn chưa tham gia buổi livestream này' });
      }
    }

    const messages = await prisma.liveChatMessage.findMany({
      where: { liveSessionId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    // Lấy tên user (đơn giản)
    const userIds = Array.from(new Set(messages.map((m) => m.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, fullName: true },
    });
    const userMap = Object.fromEntries(
      users.map((u) => [u.id, u.fullName || u.name || u.id.slice(0, 8)])
    );

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        userId: m.userId,
        userName: userMap[m.userId],
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('chat GET', error?.message || error);
    return NextResponse.json({ messages: [], error: 'db_unavailable' });
  }
}

/**
 * POST /api/chat
 * Gửi tin nhắn – chỉ user đã tham gia buổi live mới gửi được
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { liveSessionId, content } = await req.json();
    if (!liveSessionId || !content?.trim()) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
    }

    // Kiểm tra đã tham gia hoặc là host
    const attended = await prisma.liveAttendance.findUnique({
      where: {
        userId_liveSessionId: {
          userId: session.user.id,
          liveSessionId,
        },
      },
    });
    const live = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
    });
    const isHost = live?.userId === session.user.id;

    if (!attended && !isHost) {
      return NextResponse.json(
        { error: 'Bạn chưa tham gia buổi livestream này nên không thể chat' },
        { status: 403 }
      );
    }

    const msg = await prisma.liveChatMessage.create({
      data: {
        liveSessionId,
        userId: session.user.id,
        content: content.trim().slice(0, 1000),
      },
    });

    return NextResponse.json({
      message: {
        id: msg.id,
        userId: msg.userId,
        userName: session.user.name || session.user.email,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
