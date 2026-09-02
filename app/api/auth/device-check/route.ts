import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function maskEmail(email?: string | null) {
  if (!email || !email.includes('@')) return '';
  const [u, d] = email.split('@');
  if (u.length <= 2) return `*@${d}`;
  return `${u.slice(0, 2)}***@${d}`;
}

/**
 * Thiết bị mới so với lần đăng nhập gần nhất → bắt buộc OTP email (mọi tài khoản đã đăng nhập).
 * Thiết bị đã có trong TrustedDevice → trusted.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const deviceId = String(body.deviceId || '').slice(0, 80);
  if (!deviceId) {
    return NextResponse.json({ error: 'Thiếu deviceId' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      biometricEnabled: true,
      loginCount: true,
    },
  });

  if (body.action === 'trust_after_email') {
    const placeholderHash = hashToken(`email_otp_${session.user.id}_${deviceId}`);
    await prisma.trustedDevice.upsert({
      where: {
        userId_deviceId: { userId: session.user.id, deviceId },
      },
      create: {
        userId: session.user.id,
        deviceId,
        deviceTokenHash: placeholderHash,
        biometricType: 'email_otp',
        userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
      },
      update: {
        lastUsedAt: new Date(),
        biometricType: 'email_otp',
      },
    });
    return NextResponse.json({ success: true, trusted: true });
  }

  const trusted = await prisma.trustedDevice.findUnique({
    where: {
      userId_deviceId: { userId: session.user.id, deviceId },
    },
  });

  if (trusted) {
    await prisma.trustedDevice.update({
      where: { id: trusted.id },
      data: { lastUsedAt: new Date() },
    });
    return NextResponse.json({
      trusted: true,
      biometricType: trusted.biometricType,
      emailHint: maskEmail(user?.email),
    });
  }

  // Mọi tài khoản trên thiết bị mới → bắt buộc OTP email
  return NextResponse.json({
    trusted: false,
    emailHint: maskEmail(user?.email),
    message:
      'Thiết bị mới so với lần đăng nhập gần nhất — bắt buộc xác minh mã 6 số qua email.',
  });
}
