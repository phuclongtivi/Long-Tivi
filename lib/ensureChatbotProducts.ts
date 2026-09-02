/**
 * Đảm bảo 3 gói chatbot tồn tại trong StoreProduct (pin + active)
 */

import { prisma } from '@/lib/prisma';
import { CHATBOT_PACKAGES } from '@/lib/chatbotPackages';

export async function ensureChatbotProducts() {
  for (let i = 0; i < CHATBOT_PACKAGES.length; i++) {
    const pkg = CHATBOT_PACKAGES[i];
    const existing = await prisma.storeProduct.findFirst({
      where: { sku: pkg.sku },
    });
    if (existing) {
      await prisma.storeProduct.update({
        where: { id: existing.id },
        data: {
          name: pkg.name,
          bestPrice: pkg.price,
          originalPrice: pkg.price,
          description: pkg.description,
          latestInfo: `${pkg.dailyQuota} câu/ngày · chờ Boss duyệt sau khi mua`,
          type: 'service',
          theme: 'chatbot',
          active: true,
          pinnedByAdmin: true,
          pinOrder: i + 1,
          brand: 'Phúc Long Center',
        },
      });
    } else {
      await prisma.storeProduct.create({
        data: {
          name: pkg.name,
          type: 'service',
          description: pkg.description,
          bestPrice: pkg.price,
          originalPrice: pkg.price,
          latestInfo: `${pkg.dailyQuota} câu/ngày · chờ Boss duyệt sau khi mua`,
          theme: 'chatbot',
          sku: pkg.sku,
          brand: 'Phúc Long Center',
          active: true,
          pinnedByAdmin: true,
          pinOrder: i + 1,
          stock: 99999,
          updatedBy: 'system',
        },
      });
    }
  }
}
