import { prisma } from '@/lib/prisma';
import { packageBySku } from '@/lib/chatbotPackages';

/**
 * Sau khi tạo Order chứa gói chatbot → tạo yêu cầu chờ Boss duyệt
 */
export async function registerChatbotQuotaIfNeeded(order: {
  id: string;
  buyerUserId?: string | null;
  productId?: string | null;
  productName?: string | null;
  amount: number;
}) {
  if (!order.buyerUserId || !order.productId) return null;

  const product = await prisma.storeProduct
    .findUnique({
      where: { id: order.productId },
      select: { sku: true, name: true, theme: true },
    })
    .catch(() => null);

  const sku = product?.sku || '';
  const pkg = packageBySku(sku);
  if (!pkg && product?.theme !== 'chatbot') return null;
  if (!pkg) return null;

  const existing = await prisma.chatbotQuotaRequest.findFirst({
    where: { orderId: order.id },
  });
  if (existing) return existing;

  try {
    return await prisma.chatbotQuotaRequest.create({
      data: {
        userId: order.buyerUserId,
        orderId: order.id,
        productSku: pkg.sku,
        productName: product?.name || pkg.name,
        amount: order.amount || pkg.price,
        dailyQuotaAdd: pkg.dailyQuota,
        status: 'pending',
        note: 'Chờ Boss duyệt sau mua gói chatbot',
      },
    });
  } catch (e: any) {
    // Race: 2 request cùng orderId
    const again = await prisma.chatbotQuotaRequest.findFirst({
      where: { orderId: order.id },
    });
    if (again) return again;
    throw e;
  }
}
