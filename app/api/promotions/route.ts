import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * GET /api/promotions?theme=SanPhamMoi|DichVuMoi
 * Chương trình thưởng & ưu đãi cho người tham gia livestream
 */
export async function GET(req: NextRequest) {
  try {
    const theme = new URL(req.url).searchParams.get('theme') || undefined;
    const list = await prisma.livePromotion.findMany({
      where: {
        active: true,
        ...(theme ? { theme } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (list.length === 0) {
      // Fallback demo content theo theme
      const isSp = theme === 'SanPhamMoi';
      return NextResponse.json({
        promotions: [
          {
            id: 'demo-1',
            theme: theme || 'SanPhamMoi',
            title: isSp ? 'Ưu đãi Sản phẩm mới' : 'Ưu đãi Dịch vụ mới',
            description: 'Dành cho người tham gia buổi livestream liên quan.',
            rewardProgram: 'Xem live đủ thời gian → nhận điểm thưởng / quà (AI Admin ghi nhận).',
            discountProgram: 'Giá tốt nhất trong khung giờ live + mã ưu đãi sau buổi.',
            active: true,
            fromDemo: true,
          },
        ],
        source: 'demo',
      });
    }

    return NextResponse.json({ promotions: list, source: 'db' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
