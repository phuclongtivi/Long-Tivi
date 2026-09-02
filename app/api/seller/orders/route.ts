import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAppAdmin, isArtist } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seller/orders — đơn hàng thuộc gian hàng Nghệ sĩ (Shopee seller)
 * Query: status=
 */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' });
  }

  const uid = session.user.id;
  const admin = await isAppAdmin(uid, session.user.email);
  const artist = await isArtist(uid);
  if (!admin && !artist) {
    return NextResponse.json({ error: 'Chỉ Nghệ sĩ / Admin xem đơn bán hàng' });
  }

  const status = req.nextUrl.searchParams.get('status');
  const where: any = admin && req.nextUrl.searchParams.get('all') === '1'
    ? {}
    : { sellerUserId: uid };
  if (status && status !== 'all') where.status = status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ orders, role: admin ? 'admin' : 'seller' });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}
