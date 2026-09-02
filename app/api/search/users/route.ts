import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/search/users?q=...
 * Tìm user theo tên / fullName / email (giống Facebook people search).
 */
export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get('q') || '').trim();
    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        email: true,
        image: true,
        rank: true,
        idCardVerified: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.fullName || u.name || u.email?.split('@')[0] || 'User',
        username: u.email?.split('@')[0] || u.id.slice(0, 8),
        image: u.image,
        rank: u.rank,
        verified: u.idCardVerified,
      })),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ users: [], error: e.message }, { status: 500 });
  }
}
