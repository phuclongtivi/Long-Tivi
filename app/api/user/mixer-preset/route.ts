import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ preset: null });
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.userMixerPreset.findUnique({ where: { userId: session.user.id } }).catch(() => null);
  return NextResponse.json({ preset: row ? { ...(row.config as object), updatedAt: row.updatedAt.toISOString() } : null });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 });
  const config = await req.json().catch(() => null);
  if (!config || JSON.stringify(config).length > 60_000) return NextResponse.json({ error: 'Cấu hình không hợp lệ' }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true, localOnly: true });
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.userMixerPreset.upsert({ where: { userId: session.user.id }, create: { userId: session.user.id, config }, update: { config } });
  return NextResponse.json({ ok: true, updatedAt: row.updatedAt.toISOString() });
}
