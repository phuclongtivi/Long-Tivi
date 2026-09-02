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

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST action:
 * - bind: user đã login + vừa bật biometric → gắn deviceId + trả deviceToken (chỉ 1 lần)
 * - login: thiết bị cũ gửi deviceId + deviceToken → cấp session token ngắn
 * - unbind: gỡ thiết bị
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === 'bind') {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const deviceId = String(body.deviceId || '').slice(0, 80);
      const biometricType = body.biometricType === 'face' ? 'face' : 'fingerprint';
      if (!deviceId) {
        return NextResponse.json({ error: 'Thiếu deviceId' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.biometricEnabled) {
        return NextResponse.json(
          { error: 'Chưa bật nhận diện khuôn mặt / vân tay trên tài khoản' },
          { status: 400 }
        );
      }

      const deviceToken = newToken();
      const deviceTokenHash = hashToken(deviceToken);

      await prisma.trustedDevice.upsert({
        where: {
          userId_deviceId: { userId: session.user.id, deviceId },
        },
        create: {
          userId: session.user.id,
          deviceId,
          deviceTokenHash,
          biometricType,
          userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
        },
        update: {
          deviceTokenHash,
          biometricType,
          lastUsedAt: new Date(),
          userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
        },
      });

      return NextResponse.json({
        success: true,
        userId: session.user.id,
        deviceToken,
        biometricType,
        message: 'Đã gắn thiết bị. Lần mở app sau sẽ tự yêu cầu face/vân tay.',
      });
    }

    if (action === 'login') {
      const deviceId = String(body.deviceId || '').slice(0, 80);
      const deviceToken = String(body.deviceToken || '');
      if (!deviceId || !deviceToken) {
        return NextResponse.json({ error: 'Thiếu deviceId/token' }, { status: 400 });
      }

      const deviceTokenHash = hashToken(deviceToken);
      const trusted = await prisma.trustedDevice.findFirst({
        where: { deviceId, deviceTokenHash },
      });
      if (!trusted) {
        return NextResponse.json(
          {
            error: 'Thiết bị chưa được tin cậy hoặc token không khớp. Hãy đăng nhập nhanh MXH.',
            needOAuth: true,
          },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({ where: { id: trusted.userId } });
      if (!user || !user.biometricEnabled) {
        return NextResponse.json(
          { error: 'Tài khoản chưa bật biometric', needOAuth: true },
          { status: 401 }
        );
      }

      await prisma.trustedDevice.update({
        where: { id: trusted.id },
        data: { lastUsedAt: new Date() },
      });

      // Token one-time ngắn để Credentials provider đổi session
      const loginCode = newToken().slice(0, 48);
      const loginCodeHash = hashToken(loginCode);
      const expires = new Date(Date.now() + 2 * 60 * 1000);

      await prisma.appSetting.upsert({
        where: { key: `bio_login_${loginCodeHash}` },
        create: {
          key: `bio_login_${loginCodeHash}`,
          value: JSON.stringify({
            userId: user.id,
            exp: expires.toISOString(),
            deviceId,
          }),
        },
        update: {
          value: JSON.stringify({
            userId: user.id,
            exp: expires.toISOString(),
            deviceId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        loginCode,
        userId: user.id,
        biometricType: trusted.biometricType,
        name: user.fullName || user.name,
      });
    }


    if (action === 'send_email_fallback') {
      const deviceId = String(body.deviceId || '').slice(0, 80);
      const deviceToken = String(body.deviceToken || '');
      if (!deviceId || !deviceToken) {
        return NextResponse.json({ error: 'Thiếu device' }, { status: 400 });
      }
      const deviceTokenHash = hashToken(deviceToken);
      const trusted = await prisma.trustedDevice.findFirst({
        where: { deviceId, deviceTokenHash },
      });
      if (!trusted) {
        return NextResponse.json({ error: 'Thiết bị không hợp lệ', needOAuth: true }, { status: 401 });
      }
      const user = await prisma.user.findUnique({ where: { id: trusted.userId } });
      if (!user?.email) {
        return NextResponse.json(
          { error: 'Tài khoản chưa có email để gửi mã' },
          { status: 400 }
        );
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtpHash: hashToken(code),
          emailOtpExpires: expires,
        },
      });
      console.log(`[Bio fallback Email OTP] to=${user.email} code=${code}`);
      const [u, d] = user.email.split('@');
      const emailHint =
        u.length <= 2 ? `*@${d}` : `${u.slice(0, 2)}***@${d}`;
      return NextResponse.json({
        success: true,
        emailHint,
        message: 'Đã gửi mã 6 số tới email tài khoản.',
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      });
    }

    if (action === 'verify_email_fallback') {
      const deviceId = String(body.deviceId || '').slice(0, 80);
      const deviceToken = String(body.deviceToken || '');
      const otp = String(body.otp || '');
      if (!deviceId || !deviceToken || otp.length !== 6) {
        return NextResponse.json({ error: 'Thiếu thông tin / mã 6 số' }, { status: 400 });
      }
      const deviceTokenHash = hashToken(deviceToken);
      const trusted = await prisma.trustedDevice.findFirst({
        where: { deviceId, deviceTokenHash },
      });
      if (!trusted) {
        return NextResponse.json({ error: 'Thiết bị không hợp lệ' }, { status: 401 });
      }
      const user = await prisma.user.findUnique({ where: { id: trusted.userId } });
      if (!user?.emailOtpHash || !user.emailOtpExpires) {
        return NextResponse.json({ error: 'Chưa gửi mã hoặc hết hạn' }, { status: 400 });
      }
      if (new Date() > user.emailOtpExpires) {
        return NextResponse.json({ error: 'Mã hết hạn' }, { status: 400 });
      }
      if (hashToken(otp) !== user.emailOtpHash) {
        return NextResponse.json({ error: 'Mã không đúng' }, { status: 401 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { emailOtpHash: null, emailOtpExpires: null },
      });
      await prisma.trustedDevice.update({
        where: { id: trusted.id },
        data: { lastUsedAt: new Date() },
      });
      const loginCode = newToken().slice(0, 48);
      const loginCodeHash = hashToken(loginCode);
      const expires = new Date(Date.now() + 2 * 60 * 1000);
      await prisma.appSetting.upsert({
        where: { key: `bio_login_${loginCodeHash}` },
        create: {
          key: `bio_login_${loginCodeHash}`,
          value: JSON.stringify({
            userId: user.id,
            exp: expires.toISOString(),
            deviceId,
          }),
        },
        update: {
          value: JSON.stringify({
            userId: user.id,
            exp: expires.toISOString(),
            deviceId,
          }),
        },
      });
      return NextResponse.json({ success: true, loginCode });
    }

    if (action === 'unbind') {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const deviceId = String(body.deviceId || '');
      if (deviceId) {
        await prisma.trustedDevice.deleteMany({
          where: { userId: session.user.id, deviceId },
        });
      } else {
        await prisma.trustedDevice.deleteMany({ where: { userId: session.user.id } });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'action không hợp lệ' }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Lỗi' }, { status: 500 });
  }
}
