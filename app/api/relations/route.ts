import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/relations – danh sách quan hệ họ hàng / bạn bè của user hiện tại
 * POST /api/relations – thêm quan hệ (user trên app hoặc từ FB/TikTok)
 * GET /api/relations?q=...&platform=facebook – tìm user / gợi ý
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const platform = searchParams.get('platform'); // facebook | tiktok | app

    // Tìm kiếm user trên app hoặc gợi ý theo tên
    if (q) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
          NOT: { id: session.user.id },
        },
        take: 20,
        select: {
          id: true,
          name: true,
          fullName: true,
          image: true,
          email: true,
        },
      });
      return NextResponse.json({
        results: users,
        note: platform
          ? `Gợi ý user trên app. Bạn cũng có thể lưu liên hệ ${platform} nếu họ chưa có tài khoản Phúc Long.`
          : undefined,
      });
    }

    const relations = await prisma.userRelation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ relations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      relatedUserId,
      relationType, // family | friend
      relationLabel,
      externalName,
      externalPlatform, // facebook | tiktok
      externalProfileUrl,
      externalUserId,
    } = body;

    if (!relationType || !['family', 'friend'].includes(relationType)) {
      return NextResponse.json({ error: 'relationType phải là family hoặc friend' }, { status: 400 });
    }

    if (!relatedUserId && !externalName) {
      return NextResponse.json(
        { error: 'Cần chọn user trên app hoặc nhập thông tin từ Facebook/TikTok' },
        { status: 400 }
      );
    }

    const rel = await prisma.userRelation.create({
      data: {
        userId: session.user.id,
        relatedUserId: relatedUserId || null,
        relationType,
        relationLabel: relationLabel || null,
        externalName: externalName || null,
        externalPlatform: externalPlatform || null,
        externalProfileUrl: externalProfileUrl || null,
        externalUserId: externalUserId || null,
      },
    });

    return NextResponse.json({
      success: true,
      relation: rel,
      message: 'Đã thêm quan hệ họ hàng / bạn bè',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
