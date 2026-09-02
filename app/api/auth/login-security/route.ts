import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createHash, randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


const FREE_LOGINS = 5; // 5 lần đầu không cần xác nhận thêm

function hashOtp(otp: string) {
  return createHash('sha256').update(otp).digest('hex');
}

function generateSixDigit() {
  return String(randomInt(100000, 999999));
}

/**
 * GET – trạng thái bảo mật đăng nhập của user hiện tại
 * POST – ghi nhận lần đăng nhập / kích hoạt biometric / gửi & verify OTP email
 *
 * Quy tắc:
 * - 5 lần đầu: không bắt buộc face/vân tay (mobile) hay email (desktop)
 * - Từ lần 6:
 *   - Mobile: bắt buộc kích hoạt face HOẶC fingerprint
 *   - Mọi user từ lần 6: nhận email 6 số ngẫu nhiên → nhập để hoàn tất 2 bước xác thực
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        loginCount: true,
        biometricEnabled: true,
        biometricType: true,
        email: true,
        fullName: true,
        idNumber: true,
        bankAccountNumber: true,
        bankName: true,
        twoFactorSetupComplete: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const nextLoginNumber = (user.loginCount || 0) + 1;
    const requiresExtra = nextLoginNumber > FREE_LOGINS;

    return NextResponse.json({
      loginCount: user.loginCount || 0,
      nextLoginNumber,
      freeLoginsLeft: Math.max(0, FREE_LOGINS - (user.loginCount || 0)),
      requiresExtraAuth: requiresExtra,
      biometricEnabled: user.biometricEnabled,
      biometricType: user.biometricType,
      hasEmail: !!user.email,
      messages: {
        mobileFrom6:
          'Để bảo mật thông tin bạn cần kích hoạt nhận diện khuôn mặt hoặc vân tay.',
        emailFrom6:
          'Bạn sẽ nhận email kèm 6 số ngẫu nhiên. Nhập mã đó để hoàn tất xác thực 2 bước.',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, biometricType, otp, clientType } = body;
    // clientType: 'mobile' | 'desktop'

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // --- Ghi nhận 1 lần đăng nhập thành công (gọi sau khi auth OK) ---
    if (action === 'record_login') {
      const newCount = (user.loginCount || 0) + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { loginCount: newCount },
      });
      const requiresExtra = newCount >= FREE_LOGINS; // lần 6 = sau khi count thành 5, lần tiếp theo cần extra; 
      // Thực tế: sau 5 lần thành công, lần thứ 6 cần extra TRƯỚC khi cho vào app
      return NextResponse.json({
        loginCount: newCount,
        requiresExtraAuth: newCount >= FREE_LOGINS,
        // Từ lần đăng nhập thứ 6 trở đi (loginCount sẽ là 5 sau 5 lần → lần 6 cần check trước)
        note:
          newCount < FREE_LOGINS
            ? `Còn ${FREE_LOGINS - newCount} lần đăng nhập không cần xác nhận thêm.`
            : 'Các lần sau cần sinh trắc (mobile) và/hoặc mã email 6 số.',
      });
    }

    // --- Kích hoạt face / fingerprint (mobile, từ lần 6) ---
    if (action === 'enable_biometric') {
      if (!biometricType || !['face', 'fingerprint'].includes(biometricType)) {
        return NextResponse.json({ error: 'Chọn face hoặc fingerprint' }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          biometricEnabled: true,
          biometricType,
        },
      });
      return NextResponse.json({
        success: true,
        message:
          biometricType === 'face'
            ? 'Đã kích hoạt nhận diện khuôn mặt.'
            : 'Đã kích hoạt nhận diện vân tay.',
        biometricType,
      });
    }

    // --- Gửi OTP 6 số qua email (mọi user từ lần 6) ---
    if (action === 'send_email_otp') {
      if (!user.email) {
        return NextResponse.json(
          { error: 'Tài khoản chưa có email. Vui lòng liên kết email để nhận mã xác nhận.' },
          { status: 400 }
        );
      }
      const code = generateSixDigit();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtpHash: hashOtp(code),
          emailOtpExpires: expires,
        },
      });
      // Production: gửi email thật (Resend, SendGrid, ...)
      console.log(`[Email OTP] to=${user.email} code=${code}`);
      return NextResponse.json({
        success: true,
        message: `Đã gửi mã 6 số tới email của bạn. Vui lòng kiểm tra hộp thư (dev: xem log server).`,
        // Chỉ dev:
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      });
    }

    // --- Xác nhận OTP email ---
    if (action === 'verify_email_otp') {
      if (!otp || String(otp).length !== 6) {
        return NextResponse.json({ error: 'Mã phải gồm 6 số' }, { status: 400 });
      }
      if (!user.emailOtpHash || !user.emailOtpExpires) {
        return NextResponse.json({ error: 'Chưa gửi mã hoặc mã đã hết hạn' }, { status: 400 });
      }
      if (new Date() > user.emailOtpExpires) {
        return NextResponse.json({ error: 'Mã đã hết hạn. Hãy gửi lại.' }, { status: 400 });
      }
      if (hashOtp(String(otp)) !== user.emailOtpHash) {
        return NextResponse.json({ error: 'Mã xác nhận không đúng' }, { status: 401 });
      }
      const newCount = Math.max(user.loginCount || 0, FREE_LOGINS) + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtpHash: null,
          emailOtpExpires: null,
          loginCount: newCount,
          // Đánh dấu đã hoàn tất 2FA — các lần sau không bắt OTP lại
          twoFactorSetupComplete: true,
        },
      });
      return NextResponse.json({
        success: true,
        message:
          'Xác thực 2 bước thành công. App sẽ không yêu cầu thêm phương thức xác thực khi bạn đã hoàn tất cập nhật.',
        loginCount: newCount,
        twoFactorSetupComplete: true,
      });
    }

    // --- Kiểm tra trước khi cho vào app (lần 6+) ---
    // User mới (≤5 lần): không bắt buộc CCCD/STK/email/biometric
    // Từ lần 6: cần email (không có → guestOnly); CCCD + 2FA theo lộ trình cũ
    // Biometric thiết bị / OTP máy mới chỉ “đầy đủ” khi đã có CCCD + STK
    if (action === 'check_gate') {
      const count = user.loginCount || 0;
      const upcoming = count + 1;
      const idDone = !!(user.idNumber && user.fullName);
      const bankDone = !!(user.bankAccountNumber && user.bankName);
      const profileFull = idDone && bankDone; // đủ CCCD + STK ngân hàng
      const twoFaDone = !!user.twoFactorSetupComplete;
      const hasEmail = !!user.email;

      if (upcoming <= FREE_LOGINS) {
        return NextResponse.json({
          allowed: true,
          requireBiometricSetup: false,
          requireEmailOtp: false,
          requireIdCard: false,
          requireEmail: false,
          guestOnly: false,
          profileFull,
          upcomingLogin: upcoming,
          message: `User mới — còn ${FREE_LOGINS - count} lần đăng nhập chưa bắt buộc bổ sung thông tin.`,
        });
      }

      // Lần 6+: bắt buộc có email — không có thì chỉ xem như Khách
      if (!hasEmail) {
        return NextResponse.json({
          allowed: false,
          guestOnly: true,
          requireEmail: true,
          requireIdCard: !idDone,
          requireBiometricSetup: false,
          requireEmailOtp: false,
          profileFull,
          upcomingLogin: upcoming,
          message:
            'Từ lần đăng nhập thứ 6, bạn cần có email trên tài khoản. Chưa có email thì chỉ xem app dưới dạng Khách — hãy liên kết email (Google/Facebook) hoặc cập nhật trong Dashboard.',
        });
      }

      // Đã hoàn tất 2FA (+ biometric mobile nếu cần)
      if (twoFaDone) {
        const isMobile = clientType === 'mobile';
        if (!isMobile || user.biometricEnabled) {
          return NextResponse.json({
            allowed: true,
            requireBiometricSetup: false,
            requireEmailOtp: false,
            requireIdCard: !idDone,
            requireEmail: false,
            guestOnly: false,
            profileFull,
            upcomingLogin: upcoming,
            setupComplete: true,
            message: 'Đã hoàn tất xác thực — không yêu cầu thêm.',
          });
        }
      }

      const isMobile = clientType === 'mobile';
      return NextResponse.json({
        allowed: false,
        guestOnly: false,
        upcomingLogin: upcoming,
        requireEmail: false,
        requireBiometricSetup: isMobile && !user.biometricEnabled,
        requireEmailOtp: !twoFaDone,
        requireIdCard: !idDone,
        profileFull,
        messageMobile:
          'Để bảo mật thông tin bạn cần kích hoạt nhận diện khuôn mặt hoặc vân tay.',
        messageEmail:
          'Bạn sẽ nhận email kèm 6 số ngẫu nhiên. Nhập mã để hoàn tất xác thực 2 bước.',
        messageIdCard:
          'Vui lòng bổ sung số căn cước và họ tên đầy đủ (có thể nhập tay).',
        biometricEnabled: user.biometricEnabled,
        biometricType: user.biometricType,
        twoFactorSetupComplete: twoFaDone,
        idCardComplete: idDone,
        bankComplete: bankDone,
      });
    }

    return NextResponse.json({ error: 'action không hợp lệ' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
