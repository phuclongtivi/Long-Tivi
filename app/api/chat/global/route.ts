import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_LEN = 280; // kiểu Twitter cổ

export async function GET() {
  try {
    const includeUser = {
      user: {
        select: {
          id: true,
          name: true,
          fullName: true,
          image: true,
          rank: true,
          role: true,
        },
      },
    } as const;

    const [recentRows, latestArtistRows] = await Promise.all([
      prisma.globalChatMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: includeUser,
      }),
      prisma.globalChatMessage.findMany({
        where: {
          user: {
            rank: { in: ['artist', 'nghe_sy'] },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: includeUser,
      }),
    ]);

    // Hai tin Nghệ sĩ phải luôn có mặt, kể cả khi đã nằm ngoài 40 tin gần nhất.
    const rows = Array.from(
      new Map([...recentRows, ...latestArtistRows].map((row) => [row.id, row])).values()
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return NextResponse.json({
      messages: rows.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        user: {
          id: m.user.id,
          name: m.user.fullName || m.user.name,
          image: m.user.image,
          rank: m.user.rank,
          role: m.user.role,
        },
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { messages: [], error: 'Không thể tải phòng chat lúc này' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Cần đăng nhập để trò chuyện' }, { status: 401 });
    }
    const body = await req.json();
    const content = String(body.content || '').trim();
    if (!content) {
      return NextResponse.json({ error: 'Nội dung trống' }, { status: 400 });
    }
    if (content.length > MAX_LEN) {
      return NextResponse.json({ error: `Tối đa ${MAX_LEN} ký tự` }, { status: 400 });
    }

    const msg = await prisma.globalChatMessage.create({
      data: {
        userId: session.user.id,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            fullName: true,
            image: true,
            rank: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: {
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        user: {
          id: msg.user.id,
          name: msg.user.fullName || msg.user.name,
          image: msg.user.image,
          rank: msg.user.rank,
          role: msg.user.role,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
