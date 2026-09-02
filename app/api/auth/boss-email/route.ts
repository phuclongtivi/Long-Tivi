import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Boss đăng nhập bằng email + mã xác minh 6 số
 * - BOSS_EMAIL trong .env (ưu tiên)
 * - hoặc user.role = 'boss' với email khớp
 */

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
}

function generateSixDigit() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeEmail(email: string) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isBossEmail(email: string, userRole?: string | null) {
  const bossEmail = normalizeEmail(process.env.BOSS_EMAIL || '');
  if (bossEmail && email === bossEmail) return true;
  if (userRole === 'boss') return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { email, step, otp } = await req.json();
    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes('@')) {
      return NextResponse.json({ error: 'Nhập email Boss hợp lệ' }, { status: 400 });
    }

    const bossEnv = normalizeEmail(process.env.BOSS_EMAIL || '');
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalized },
          ...(bossEnv ? [{ email: bossEnv, role: 'boss' as const }] : []),
        ],
      },
    });

    const allowed =
      (bossEnv && normalized === bossEnv) || user?.role === 'boss';
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            'Email này không phải tài khoản Boss. Cấu hình BOSS_EMAIL trong .env hoặc gán role boss.',
        },
        { status: 403 }
      );
    }

    // --- Gửi mã 6 số ---
    if (step === 'send' || !step) {
      // Đảm bảo có user boss
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: normalized,
            role: 'boss',
            name: 'Boss',
            fullName: 'Boss',
            rank: 'artist',
            trustLevel: 2,
            twoFactorSetupComplete: true,
          },
        });
      } else if (user.role !== 'boss') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'boss', email: normalized },
        });
      }

      const code = generateSixDigit();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtpHash: hashOtp(code),
          emailOtpExpires: expires,
        },
      });

      // Production: gửi email thật (Resend / SendGrid)
      console.log(`[Boss Email OTP] to=${normalized} code=${code}`);

      return NextResponse.json({
        otpSent: true,
        message: `Đã gửi mã 6 số tới ${normalized}. Kiểm tra hộp thư (dev: xem log server).`,
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      });
    }

    // --- Xác minh mã ---
    if (step === 'verify') {
      if (!otp || String(otp).length !== 6) {
        return NextResponse.json({ error: 'Mã phải gồm 6 số' }, { status: 400 });
      }
      if (!user) {
        return NextResponse.json({ error: 'Không tìm thấy Boss' }, { status: 404 });
      }
      if (!user.emailOtpHash || !user.emailOtpExpires) {
        return NextResponse.json({ error: 'Chưa gửi mã hoặc mã hết hạn' }, { status: 400 });
      }
      if (new Date() > user.emailOtpExpires) {
        return NextResponse.json({ error: 'Mã đã hết hạn. Hãy gửi lại.' }, { status: 400 });
      }
      if (hashOtp(String(otp)) !== user.emailOtpHash) {
        return NextResponse.json({ error: 'Mã xác minh không đúng' }, { status: 401 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtpHash: null,
          emailOtpExpires: null,
          role: 'boss',
          email: normalized,
          twoFactorSetupComplete: true,
        },
      });

      // One-time login code cho NextAuth credentials
      const loginCode = crypto.randomBytes(24).toString('hex');
      const loginCodeHash = crypto.createHash('sha256').update(loginCode).digest('hex');
      const exp = new Date(Date.now() + 2 * 60 * 1000);
      await prisma.appSetting.upsert({
        where: { key: `boss_login_${loginCodeHash}` },
        create: {
          key: `boss_login_${loginCodeHash}`,
          value: JSON.stringify({ userId: user.id, exp: exp.toISOString() }),
        },
        update: {
          value: JSON.stringify({ userId: user.id, exp: exp.toISOString() }),
        },
      });

      return NextResponse.json({
        success: true,
        loginCode,
        message: 'Xác minh Boss thành công',
        redirect: '/dashboard',
      });
    }

    return NextResponse.json({ error: 'step không hợp lệ' }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Lỗi' }, { status: 500 });
  }
}
