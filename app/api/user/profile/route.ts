import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildUserQrPayload } from '@/lib/qr';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      idNumber,
      dateOfBirth,
      address,
      bankAccountNumber,
      bankName,
      bankAccountName,
      ethWalletAddress,
      ethWalletLabel,
      socialFacebook,
      socialTiktok,
      socialInstagram,
      socialYoutube,
      socialZalo,
      shippingAddress,
      shippingLat,
      shippingLng,
      shippingPlaceId,
    } = body;

    let normalizedEth = ethWalletAddress;
    if (ethWalletAddress !== undefined && ethWalletAddress !== null && String(ethWalletAddress).trim()) {
      const addr = String(ethWalletAddress).trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        return NextResponse.json(
          { error: 'Địa chỉ ví Ethereum không hợp lệ (cần dạng 0x + 40 ký tự hex)' },
          { status: 400 }
        );
      }
      normalizedEth = addr;
    } else if (ethWalletAddress !== undefined) {
      normalizedEth = ethWalletAddress; // empty clear
    }

    const existing = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 });
    }

    const nextFullName = fullName !== undefined ? fullName : existing.fullName;
    const nextIdNumber = idNumber !== undefined ? idNumber : existing.idNumber;

    let qrCodeData = existing.qrCodeData;
    if (nextFullName && nextIdNumber) {
      qrCodeData = buildUserQrPayload(session.user.id, nextIdNumber);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: nextFullName ?? undefined,
        idNumber: nextIdNumber ?? undefined,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
        address: address !== undefined ? address : undefined,
        bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber : undefined,
        bankName: bankName !== undefined ? bankName : undefined,
        bankAccountName: bankAccountName !== undefined ? bankAccountName : undefined,
        ethWalletAddress: ethWalletAddress !== undefined ? (normalizedEth as any) : undefined,
        ethWalletLabel: ethWalletLabel !== undefined ? ethWalletLabel : undefined,
        socialFacebook: socialFacebook !== undefined ? socialFacebook : undefined,
        socialTiktok: socialTiktok !== undefined ? socialTiktok : undefined,
        socialInstagram: socialInstagram !== undefined ? socialInstagram : undefined,
        socialYoutube: socialYoutube !== undefined ? socialYoutube : undefined,
        socialZalo: socialZalo !== undefined ? socialZalo : undefined,
        shippingAddress: shippingAddress !== undefined ? shippingAddress : undefined,
        shippingLat: shippingLat !== undefined ? shippingLat : undefined,
        shippingLng: shippingLng !== undefined ? shippingLng : undefined,
        shippingPlaceId: shippingPlaceId !== undefined ? shippingPlaceId : undefined,
        qrCodeData: qrCodeData ?? undefined,
        idCardVerified: !!(nextFullName && nextIdNumber),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        idNumber: user.idNumber,
        qrCodeData: user.qrCodeData,
        socialFacebook: user.socialFacebook,
        socialTiktok: user.socialTiktok,
        socialInstagram: user.socialInstagram,
        socialYoutube: user.socialYoutube,
        socialZalo: user.socialZalo,
      shippingAddress,
      shippingLat,
      shippingLng,
      shippingPlaceId,
        profileComplete: !!(user.fullName && user.idNumber),
      },
      message:
        user.fullName && user.idNumber
          ? 'Đã lưu. Mã QR cá nhân đã được tạo để tặng quà và tính hoa hồng.'
          : 'Đã lưu. Vui lòng nhập Họ tên và Số CCCD để hoàn tất khởi tạo và nhận mã QR.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        idNumber: true,
        qrCodeData: true,
        qrCodeImageUrl: true,
        socialFacebook: true,
        socialTiktok: true,
        socialInstagram: true,
        socialYoutube: true,
        socialZalo: true,
        bankAccountNumber: true,
        bankName: true,
        bankAccountName: true,
        ethWalletAddress: true,
        ethWalletLabel: true,
      },
    });
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
