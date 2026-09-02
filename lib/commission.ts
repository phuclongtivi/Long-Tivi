import { prisma } from '@/lib/prisma';


/**
 * Xác định người refer từ:
 * - referCode trên link chia sẻ (?ref=...)
 * - hoặc payload QR user (chứa userId / ref)
 * Nếu không xác định → hoa hồng về admin Boss chỉ định theo tháng
 */
export async function resolveReferrer(opts: {
  referCode?: string | null;
  qrPayload?: string | null;
}): Promise<{
  referrerUserId: string | null;
  shareLinkId: string | null;
  attribution: 'link' | 'qr' | 'unknown';
}> {
  const { referCode, qrPayload } = opts;

  if (referCode) {
    const link = await prisma.shareLink.findFirst({
      where: { referCode },
    });
    if (link) {
      return {
        referrerUserId: link.userId,
        shareLinkId: link.id,
        attribution: 'link',
      };
    }
  }

  if (qrPayload) {
    // QR dạng https://.../u/{userId}?qr=1 hoặc chứa=CODE
    const userIdMatch = qrPayload.match(/\/u\/([a-zA-Z0-9_-]+)/);
    if (userIdMatch) {
      const u = await prisma.user.findUnique({ where: { id: userIdMatch[1] } });
      if (u) {
        return { referrerUserId: u.id, shareLinkId: null, attribution: 'qr' };
      }
    }
    const refMatch = qrPayload.match(/[?&]ref=([A-Za-z0-9_-]+)/);
    if (refMatch) {
      const link = await prisma.shareLink.findFirst({ where: { referCode: refMatch[1] } });
      if (link) {
        return {
          referrerUserId: link.userId,
          shareLinkId: link.id,
          attribution: 'qr',
        };
      }
    }
  }

  return { referrerUserId: null, shareLinkId: null, attribution: 'unknown' };
}

export function yearMonthNow(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function getMonthlyReferAdminUserId(when = new Date()): Promise<string | null> {
  const ym = yearMonthNow(when);
  const row = await prisma.monthlyReferAdmin.findUnique({ where: { yearMonth: ym } });
  return row?.adminUserId || null;
}

export async function calcCommissionAmount(
  productId: string | null | undefined,
  orderAmount: number
): Promise<number> {
  if (!productId) {
    return Math.round(orderAmount * 0.05 * 100) / 100; // mặc định 5%
  }
  const product = await prisma.storeProduct.findUnique({ where: { id: productId } });
  if (!product) {
    return Math.round(orderAmount * 0.05 * 100) / 100;
  }
  if (product.referCommissionFixed != null && product.referCommissionFixed > 0) {
    return product.referCommissionFixed;
  }
  const rate = product.referCommissionRate ?? 0.05;
  return Math.round(orderAmount * rate * 100) / 100;
}
