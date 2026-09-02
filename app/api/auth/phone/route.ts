import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * Boss đăng nhập bằng số điện thoại
 * BOSS_PHONE trong .env (hoặc user.role = boss + user.phone)
 * Production: tích hợp SMS OTP (Twilio, ESMS, ...)
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, step, otp } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: 'Thiếu số điện thoại' }, { status: 400 });
    }
    const normalized = String(phone).replace(/\s+/g, '');
    const bossPhone = (process.env.BOSS_PHONE || '').replace(/\s+/g, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalized },
          ...(bossPhone ? [{ phone: bossPhone, role: 'boss' as const }] : []),
        ],
      },
    });

    const isBossPhone = bossPhone && normalized === bossPhone;
    if (!isBossPhone && user?.role !== 'boss') {
      return NextResponse.json(
        { error: 'Số điện thoại này không được đăng ký là tài khoản Boss' },
        { status: 403 }
      );
    }

    if (step === 'send' || !step) {
      // TODO: gửi OTP thật qua SMS
      // Dev: chấp nhận OTP cố định 000000 hoặc log ra console
      console.log(`[Boss OTP] phone=${normalized} otp=000000 (dev)`);
      return NextResponse.json({
        otpSent: true,
        message: 'Đã gửi mã OTP (môi trường dev: dùng 000000).',
      });
    }

    if (step === 'verify') {
      if (otp !== '000000' && process.env.NODE_ENV !== 'production') {
        // dev only
      }
      if (!otp) {
        return NextResponse.json({ error: 'Thiếu OTP' }, { status: 400 });
      }
      // Production: verify OTP store
      if (otp !== process.env.BOSS_DEV_OTP && otp !== '000000') {
        return NextResponse.json({ error: 'OTP không đúng' }, { status: 401 });
      }
      // Đảm bảo user boss tồn tại
      if (!user && isBossPhone) {
        await prisma.user.create({
          data: {
            phone: normalized,
            role: 'boss',
            name: 'Boss',
            rank: 'artist',
            trustLevel: 2,
          },
        });
      } else if (user && user.role !== 'boss') {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'boss', phone: normalized } });
      }
      return NextResponse.json({
        success: true,
        message: 'Xác thực Boss thành công. (Production: tạo session NextAuth credentials/phone.)',
        redirect: '/dashboard',
      });
    }

    return NextResponse.json({ error: 'step không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
