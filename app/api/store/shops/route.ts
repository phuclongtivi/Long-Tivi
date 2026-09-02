import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isArtist, isAppAdmin } from '@/lib/admin';
import { permissionsForRank } from '@/lib/rank';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET — danh sách gian hàng Nghệ sĩ (active) */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const shopId = req.nextUrl.searchParams.get('shopId');
  const ownerId = req.nextUrl.searchParams.get('ownerId');

  try {
    if (shopId || ownerId) {
      const shop = await prisma.artistShop.findFirst({
        where: shopId ? { id: shopId } : { ownerId: ownerId! },
        include: {
          products: {
            where: { active: true },
            orderBy: { updatedAt: 'desc' },
          },
        },
      });
      if (!shop) {
        return NextResponse.json({ error: 'Không tìm thấy gian hàng' }, { status: 404 });
      }
      return NextResponse.json({ shop });
    }

    const shops = await prisma.artistShop.findMany({
      where: { active: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        _count: { select: { products: true } },
      },
    });
    return NextResponse.json({ shops });
  } catch (e: any) {
    return NextResponse.json({ shops: [], error: e?.message }, { status: 200 });
  }

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

/** POST — Nghệ sĩ tạo / cập nhật gian hàng (tên = tên nghệ sĩ) */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uid = session.user.id;
  const artist = await isArtist(uid);
  const admin = await isAppAdmin(uid, session.user.email);
  if (!artist && !admin) {
    return NextResponse.json(
      { error: 'Chỉ Nghệ sĩ (hoặc Admin) được tạo gian hàng' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { name: true, fullName: true },
  });
  const defaultName =
    body.name || user?.fullName || user?.name || 'Gian hàng Nghệ sĩ';

  const shop = await prisma.artistShop.upsert({
    where: { ownerId: uid },
    create: {
      ownerId: uid,
      name: String(defaultName).slice(0, 120),
      description: body.description || null,
      avatarUrl: body.avatarUrl || null,
      coverUrl: body.coverUrl || null,
      slug: body.slug || null,
      active: true,
    },
    update: {
      name: body.name ? String(body.name).slice(0, 120) : undefined,
      description: body.description !== undefined ? body.description : undefined,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : undefined,
      coverUrl: body.coverUrl !== undefined ? body.coverUrl : undefined,
      active: body.active !== undefined ? Boolean(body.active) : undefined,
    },
  });

  return NextResponse.json({ success: true, shop });
}
