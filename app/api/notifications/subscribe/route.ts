import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST — đăng ký endpoint push (Web Push subscription hoặc FCM token)
 * body: { endpoint, p256dh?, auth?, platform?: 'web'|'ios'|'android' }
 *
 * DELETE — hủy đăng ký endpoint
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const endpoint = String(body.endpoint || '').trim();
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });

  const platform = ['web', 'ios', 'android'].includes(body.platform) ? body.platform : 'web';

  const sub = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId,
      endpoint,
      p256dh: body.p256dh || null,
      auth: body.auth || null,
      platform,
      userAgent: req.headers.get('user-agent') || null,
    },
    update: {
      userId,
      p256dh: body.p256dh || null,
      auth: body.auth || null,
      platform,
      userAgent: req.headers.get('user-agent') || null,
    },
  });

  // Bật notificationsEnabled khi user đăng ký
  await prisma.user.update({
    where: { id: userId },
    data: { notificationsEnabled: true },
  });

  return NextResponse.json({ ok: true, id: sub.id });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const endpoint = String(body.endpoint || '').trim();
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });

  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
  return NextResponse.json({ ok: true });
}
