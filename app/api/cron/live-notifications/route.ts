import { NextRequest, NextResponse } from 'next/server';
import { processLiveNotificationJobs } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Cron endpoint — gọi mỗi 1 phút (Vercel Cron / server cron / GitHub Actions).
 *
 * Bảo vệ bằng header:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Logic:
 *  - before_5m: scheduledStartAt trong khoảng 4–6 phút tới
 *  - after_10m: startedAt trong khoảng 9–11 phút trước
 *  - Chỉ user có notificationsEnabled = true
 */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  return run(req);

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

export async function POST(req: NextRequest) {
  return run(req);
}

async function run(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const results = await processLiveNotificationJobs(new Date());
    return NextResponse.json({ ok: true, at: new Date().toISOString(), ...results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'cron failed' }, { status: 500 });
  }
}
