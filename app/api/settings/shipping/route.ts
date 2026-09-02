import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAppAdmin, isBoss } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Boss cung cấp URL web tra cứu giao hàng.
 * Admin AI dùng URL này (+ mã vận đơn) để phản hồi khách trong mục theo dõi đơn.
 *
 * GET  – lấy URL hiện tại
 * POST – Boss/Admin cập nhật { url }
 */
export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const row = await prisma.appSetting.findUnique({
    where: { key: 'shipping_lookup_url' },
  });
  return NextResponse.json({
    url: row?.value || null,
    updatedAt: row?.updatedAt || null,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const boss = await isBoss(session.user.id, session.user.email);
  const admin = await isAppAdmin(session.user.id, session.user.email);
  if (!boss && !admin) {
    return NextResponse.json({ error: 'Chỉ Boss/Admin được cấu hình URL tra cứu' }, { status: 403 });
  }

  const body = await req.json();
  const url = (body.url || '').trim();
  if (!url) {
    return NextResponse.json({ error: 'Thiếu url' }, { status: 400 });
  }

  const row = await prisma.appSetting.upsert({
    where: { key: 'shipping_lookup_url' },
    create: {
      key: 'shipping_lookup_url',
      value: url,
      updatedBy: session.user.id,
    },
    update: {
      value: url,
      updatedBy: session.user.id,
    },
  });

  return NextResponse.json({
    success: true,
    url: row.value,
    message:
      'Đã lưu URL tra cứu giao hàng. Admin AI sẽ dùng URL này để phản hồi tình trạng vận đơn cho khách.',
  });
}
