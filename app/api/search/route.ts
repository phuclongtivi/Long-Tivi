import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/** GET /api/search?q=... – tìm trong kho video / tiêu đề giống Google */
export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams.get('q')?.trim() || '';
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }
    const videos = await prisma.archiveVideo.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        theme: true,
        thumbnailUrl: true,
        videoUrl: true,
        hasRewardView: true,
      },
    });
    return NextResponse.json({ results: videos, q });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
