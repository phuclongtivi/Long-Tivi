import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAppAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

/** Admin/Boss chỉnh 3 ô nội dung + logo + ảnh SP + extra info + HOT */
export async function GET(req: NextRequest) {
  // Tránh fail lúc `next build` collect page data nếu DB chưa sẵn sàng
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ blocks: [] });
    }
    const { prisma } = await import('@/lib/prisma');
    const { searchParams } = new URL(req.url);
    const theme = searchParams.get('theme') || undefined;
    const archiveVideoId = searchParams.get('archiveVideoId') || undefined;
    const blocks = await prisma.adminDisplayBlock.findMany({
      where: {
        ...(theme ? { theme } : {}),
        ...(archiveVideoId ? { archiveVideoId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ blocks });
  } catch (e: any) {
    console.error('admin/display GET', e?.message || e);
    return NextResponse.json({ blocks: [], error: 'db_unavailable' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !(await isAppAdmin(session.user.id, session.user.email))) {
      return NextResponse.json({ error: 'Chỉ Admin/Boss được chỉnh nội dung hiển thị' }, { status: 403 });
    }
    const { prisma } = await import('@/lib/prisma');
    const body = await req.json();
    const {
      id,
      theme,
      archiveVideoId,
      box1Title, box1Content,
      box2Title, box2Content,
      box3Title, box3Content,
      extraInfo,
      companyLogoUrl,
      productImageUrl,
      expectedAt,
      showHotLogo,
      sortOrder,
    } = body;

    const data = {
      theme: theme || null,
      archiveVideoId: archiveVideoId || null,
      box1Title, box1Content, box2Title, box2Content, box3Title, box3Content,
      extraInfo,
      companyLogoUrl,
      productImageUrl,
      expectedAt: expectedAt ? new Date(expectedAt) : null,
      showHotLogo: showHotLogo !== false,
      sortOrder: sortOrder ?? 0,
      updatedById: session.user.id,
    };

    let block;
    if (id) {
      block = await prisma.adminDisplayBlock.update({ where: { id }, data });
    } else {
      block = await prisma.adminDisplayBlock.create({ data });
    }
    return NextResponse.json({ success: true, block });
  } catch (e: any) {
    console.error('admin/display POST', e?.message || e);
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}
