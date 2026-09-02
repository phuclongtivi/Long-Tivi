import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { buildUserQrPayload, pickQrCorner } from '@/lib/qr';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLATFORMS = ['facebook', 'tiktok', 'youtube', 'instagram', 'zalo', 'shopee'];
const SP_DV = ['SanPhamMoi', 'DichVuMoi'];

/**
 * POST /api/share
 * body: { platform, archiveVideoId? } | { platform, productId? }
 * Tạo link + referCode riêng cho user → hoa hồng khi có đơn từ link
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để chia sẻ và nhận hoa hồng refer' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const platform = body.platform as string;
    const archiveVideoId = body.archiveVideoId as string | undefined;
    const productId = body.productId as string | undefined;

    if (!platform || !PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: 'Chọn nền tảng: facebook, tiktok, youtube, instagram, zalo, shopee' },
        { status: 400 }
      );
    }
    if (!archiveVideoId && !productId) {
      return NextResponse.json({ error: 'Thiếu productId hoặc archiveVideoId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 });
    }

    // QR / CCCD: khuyến khích nhưng không chặn chia sẻ sản phẩm (vẫn có refer)
    let qrPayload = user.qrCodeData;
    if (user.fullName && user.idNumber && !qrPayload) {
      qrPayload = buildUserQrPayload(user.id, user.idNumber);
      await prisma.user.update({
        where: { id: user.id },
        data: { qrCodeData: qrPayload },
      });
    }

    const referCode = `PL-${session.user.id.slice(0, 6).toUpperCase()}-${randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;
    const baseUrl = process.env.NEXTAUTH_URL || 'https://phuclong.app';

    // --- Chia sẻ sản phẩm superBUY ---
    if (productId) {
      const product = await prisma.storeProduct.findUnique({ where: { id: productId } });
      if (!product || !product.active) {
        return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
      }

      const shareUrl = `${baseUrl}/store/${product.id}?ref=${referCode}&src=${platform}`;
      const link = await prisma.shareLink.create({
        data: {
          userId: session.user.id,
          productId: product.id,
          platform,
          referCode,
          shareUrl,
        },
      });

      const text = [
        product.name,
        product.bestPrice != null
          ? `Giá: ${product.bestPrice.toLocaleString('vi-VN')} ₫`
          : '',
        product.description?.slice(0, 120) || '',
        `Mua trên Long (superBUY™): ${shareUrl}`,
        `Mã giới thiệu: ${referCode}`,
      ]
        .filter(Boolean)
        .join('\n');

      return NextResponse.json({
        success: true,
        shareUrl: link.shareUrl,
        referCode: link.referCode,
        platform,
        productId: product.id,
        productName: product.name,
        shareText: text,
        deepLinks: buildDeepLinks(platform, shareUrl, text),
        qrPayload: qrPayload || null,
        message:
          'Đã tạo link chia sẻ kèm mã refer. Khi có người mua qua link này, hoa hồng được phân cho bạn.',
      });
    }

    // --- Chia sẻ video archive (giữ logic cũ) ---
    const video = await prisma.archiveVideo.findUnique({ where: { id: archiveVideoId! } });
    if (!video) {
      return NextResponse.json({ error: 'Không tìm thấy video' }, { status: 404 });
    }

    if (!user.fullName || !user.idNumber) {
      return NextResponse.json(
        {
          error:
            'Vui lòng hoàn tất Họ tên + Số CCCD trên Dashboard để có mã QR trước khi chia sẻ video',
        },
        { status: 400 }
      );
    }

    const shareUrl = `${baseUrl}/v/${video.id}?ref=${referCode}&src=${platform}`;
    const isProductService = SP_DV.includes(video.theme || '');
    const qrCorner = isProductService ? pickQrCorner(session.user.id) : null;

    const link = await prisma.shareLink.create({
      data: {
        userId: session.user.id,
        archiveVideoId: video.id,
        platform,
        referCode,
        shareUrl,
      },
    });

    return NextResponse.json({
      success: true,
      shareUrl: link.shareUrl,
      referCode: link.referCode,
      platform,
      qrOverlay: isProductService
        ? {
            enabled: true,
            qrPayload,
            corner: qrCorner,
            sizeHint: 'medium',
            note: 'AI Admin sẽ chèn mã QR của bạn vào một góc video khi chia sẻ.',
          }
        : null,
      deepLinks: buildDeepLinks(platform, shareUrl, video.title || shareUrl),
      message: isProductService
        ? 'Đã tạo link chia sẻ + QR trên video (mã refer hoa hồng).'
        : 'Đã tạo link chia sẻ riêng (có mã refer tính hoa hồng).',
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildDeepLinks(platform: string, url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (platform) {
    case 'facebook':
      return { open: `https://www.facebook.com/sharer/sharer.php?u=${u}`, copy: url };
    case 'tiktok':
      return { open: null, copy: text, note: 'Mở TikTok và dán nội dung đã copy' };
    case 'youtube':
      return { open: null, copy: text, note: 'Dán vào mô tả / community YouTube' };
    case 'instagram':
      return { open: null, copy: text, note: 'Mở Instagram và dán vào story / bio / caption' };
    case 'zalo':
      return {
        open: `https://zalo.me/share?url=${u}&title=${t}`,
        copy: text,
      };
    case 'shopee':
      return { open: null, copy: text, note: 'Dán vào chat / gian hàng Shopee' };
    default:
      return { open: null, copy: url };
  }
}
