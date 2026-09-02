import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAppAdmin, isBoss, isArtist, canCreateStoreProduct } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' });
    }
    const boss = await isBoss(session.user.id, session.user.email);
    const admin = await isAppAdmin(session.user.id, session.user.email);
    const artist = await isArtist(session.user.id);
    const canAdd = await canCreateStoreProduct(session.user.id, session.user.email);

    let rank = 'normal';
    let trustLevel = 0;
    let canOrganizeLive = false;
    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { rank: true, trustLevel: true, canOrganizeLive: true },
        });
        rank = user?.rank || 'normal';
        trustLevel = user?.trustLevel ?? 0;
        canOrganizeLive = user?.canOrganizeLive ?? false;
      } catch {
        /* ignore during build */
      }
    }

    return NextResponse.json({
      isBoss: boss,
      isAdmin: admin,
      isArtist: artist,
      canCreateStoreProduct: canAdd,
      rank,
      trustLevel,
      canOrganizeLive,
      email: session.user.email,
    });
  } catch (e: any) {
    console.error('admin/me GET', e?.message || e);
    return NextResponse.json({
      isBoss: false,
      isAdmin: false,
      isArtist: false,
      canCreateStoreProduct: false,
      rank: 'normal',
      trustLevel: 0,
      canOrganizeLive: false,
    });
  }
}
