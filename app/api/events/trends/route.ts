import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/events/trends?topic=music|news_sport
 * Feed bài xu hướng VN do AI Admin thu thập (lưu trong AppSetting hoặc fallback mẫu)
 * Boss/AI cron có thể cập nhật key: trend_music | trend_news_sport
 */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const topic = req.nextUrl.searchParams.get('topic') || 'music';
  const key =
    topic === 'news_sport' || topic === 'news' || topic === 'sport'
      ? 'trend_news_sport'
      : 'trend_music';

  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    if (row?.value) {
      try {
        const parsed = JSON.parse(row.value);
        const items = Array.isArray(parsed) ? parsed : parsed.items || [];
        return NextResponse.json({
          topic: key === 'trend_news_sport' ? 'news_sport' : 'music',
          source: 'ai_admin',
          scope: 'Việt Nam',
          items,
          updatedAt: row.updatedAt,
        });
      } catch {
        /* fall through */
      }
    }
  } catch {
    /* db may be empty */
  }

  // Fallback demo — AI Admin sẽ ghi đè khi chạy thu thập
  const demoMusic = [
    {
      id: 'm1',
      title: 'Top live âm nhạc đang hot trên MXH Việt Nam',
      platform: 'TikTok / Facebook',
      viewsLabel: 'Đang nhiều người xem',
      excerpt: 'AI Admin tổng hợp các buổi live ca nhạc được quan tâm trong nước.',
      url: null,
    },
  ];
  const demoNews = [
    {
      id: 'n1',
      title: 'Thời sự & thể thao — tin đang được xem nhiều',
      platform: 'Facebook / YouTube',
      viewsLabel: 'Xu hướng VN',
      excerpt: 'AI Admin thu thập bài viết / live thời sự và thể thao phạm vi Việt Nam.',
      url: null,
    },
  ];

  return NextResponse.json({
    topic: key === 'trend_news_sport' ? 'news_sport' : 'music',
    source: 'demo',
    scope: 'Việt Nam',
    items: key === 'trend_news_sport' ? demoNews : demoMusic,
    updatedAt: null,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}
