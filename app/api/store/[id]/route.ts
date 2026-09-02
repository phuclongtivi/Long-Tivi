import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const product = await prisma.storeProduct.findUnique({ where: { id } });
    if (product) {
      return NextResponse.json({ product, source: 'store' });
    }
    const video = await prisma.archiveVideo.findUnique({ where: { id } });
    if (video) {
      return NextResponse.json({
        product: {
          id: video.id,
          name: video.title,
          type: video.theme === 'DichVuMoi' ? 'service' : 'product',
          description: video.description,
          imageUrl: video.thumbnailUrl,
          bestPrice: null,
          originalPrice: null,
          latestInfo: video.rewardNote || 'Thông tin do AI Admin cập nhật sau livestream.',
          theme: video.theme,
          sourceLiveId: video.sourceLiveId,
          sourceLiveDate: video.sourceLiveDate,
          fromArchive: true,
          videoUrl: video.videoUrl,
        },
        source: 'archive',
      });
    }
    return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
