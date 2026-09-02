import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET — trạng thái bật/tắt thông báo */
export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsEnabled: true },
  });

  return NextResponse.json({
    notificationsEnabled: user?.notificationsEnabled ?? true,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

/**
 * PATCH — bật/tắt thông báo
 * body: { enabled: boolean }
 * Tắt → không gửi bất kỳ thông báo livestream nào (trước 5' / sau 10').
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const enabled = Boolean(body.enabled);

  await prisma.user.update({
    where: { id: userId },
    data: { notificationsEnabled: enabled },
  });

  return NextResponse.json({ ok: true, notificationsEnabled: enabled });
}
