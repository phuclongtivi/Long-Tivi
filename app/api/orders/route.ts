import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  resolveReferrer,
  getMonthlyReferAdminUserId,
  calcCommissionAmount,
} from '@/lib/commission';
import { registerChatbotQuotaIfNeeded } from '@/lib/chatbotQuotaOrder';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/orders?status=
 * Danh sách đơn của user đăng nhập (theo dõi kiểu Shopee)
 *
 * POST /api/orders
 * - action: checkout_cart | buy_now | create (legacy 1 SP)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' });
    }

    const status = req.nextUrl.searchParams.get('status');
    const orders = await prisma.order.findMany({
      where: {
        buyerUserId: session.user.id,
        ...(status && status !== 'all' ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const action = body.action || 'create';

    // —— Thanh toán giỏ hàng (Shopee-style) ——
    if (action === 'checkout_cart') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
      }

      const {
        paymentMethod = 'cod',
        shippingAddress,
        shippingName,
        shippingPhone,
        referCode,
        qrPayload,
      } = body;

      if (!shippingAddress || !shippingPhone) {
        return NextResponse.json(
          { error: 'Vui lòng nhập địa chỉ giao hàng và số điện thoại' },
          { status: 400 }
        );
      }

      const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.user.id, selected: true },
      });
      if (cartItems.length === 0) {
        return NextResponse.json({ error: 'Chưa chọn sản phẩm nào trong giỏ' }, { status: 400 });
      }

      const shippingLookup = await prisma.appSetting.findUnique({
        where: { key: 'shipping_lookup_url' },
      });

      const resolved = await resolveReferrer({ referCode, qrPayload });
      let commissionTo: string | null = resolved.referrerUserId;
      let attribution = resolved.attribution;
      if (!commissionTo) {
        commissionTo = (await getMonthlyReferAdminUserId()) || 'monthly_admin_unassigned';
        attribution = 'unknown';
      }

      const shippingFee = Number(body.shippingFee) || 0;
      const createdOrders = [];

      for (const item of cartItems) {
        const amount = item.unitPrice * item.quantity;
        const commissionAmount = await calcCommissionAmount(item.productId, amount);
        let sellerId: string | null = null;
        let shopId: string | null = null;
        if (item.productId) {
          const prod = await prisma.storeProduct.findUnique({
            where: { id: item.productId },
            select: { createdByUserId: true, shopId: true },
          }).catch(() => null);
          if (prod) {
            sellerId = prod.createdByUserId || null;
            shopId = prod.shopId || null;
            if (prod.shopId) {
              const shop = await prisma.artistShop.findUnique({
                where: { id: prod.shopId },
                select: { ownerId: true },
              }).catch(() => null);
              if (shop?.ownerId) sellerId = shop.ownerId;
            }
          }
        }
        const order = await prisma.order.create({
          data: {
            buyerUserId: session.user.id,
            buyerName: shippingName || session.user.name || null,
            buyerPhone: shippingPhone,
            productId: item.productId,
            productName: item.productName,
            sellerUserId: sellerId,
            shopId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount,
            shippingFee: shippingFee / cartItems.length,
            totalAmount: amount + shippingFee / cartItems.length,
            status: paymentMethod === 'cod' ? 'processing' : 'pending_payment',
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'unpaid',
            shippingAddress,
            shippingName: shippingName || session.user.name || null,
            shippingPhone,
            shippingStatus: 'pending',
            shippingLookupUrl: shippingLookup?.value || null,
            referCode: referCode || null,
            referrerUserId: resolved.referrerUserId,
            shareLinkId: resolved.shareLinkId,
            attribution,
            commissionAmount,
            commissionTo,
            commissionStatus: 'pending',
          },
        });

        await prisma.orderStatusLog.create({
          data: {
            orderId: order.id,
            status: order.status,
            note:
              paymentMethod === 'cod'
                ? 'Đơn COD đã tiếp nhận — chờ đóng gói'
                : 'Chờ thanh toán',
            actorId: session.user.id,
          },
        });

        if (resolved.shareLinkId) {
          await prisma.shareLink.update({
            where: { id: resolved.shareLinkId },
            data: {
              purchaseCount: { increment: 1 },
              commission: { increment: commissionAmount },
            },
          });
        }

        createdOrders.push(order);
        await registerChatbotQuotaIfNeeded(order).catch(() => null);
      }

      // Xóa item đã checkout khỏi giỏ
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, selected: true },
      });

      return NextResponse.json({
        success: true,
        message: `Đã tạo ${createdOrders.length} đơn hàng`,
        orders: createdOrders.map((o) => ({
          id: o.id,
          productName: o.productName,
          totalAmount: o.totalAmount ?? o.amount,
          status: o.status,
          paymentMethod: o.paymentMethod,
        })),
      });
    }

    // —— Mua ngay 1 SP ——
    if (action === 'buy_now' || action === 'create') {
      const {
        productId,
        productName,
        amount,
        quantity = 1,
        unitPrice,
        paymentMethod = 'cod',
        shippingAddress,
        shippingName,
        shippingPhone,
        referCode,
        qrPayload,
        buyerName,
        buyerPhone,
      } = body;

      if (amount == null || Number(amount) <= 0) {
        return NextResponse.json({ error: 'Giá trị đơn không hợp lệ' }, { status: 400 });
      }

      const orderAmount = Number(amount);
      const resolved = await resolveReferrer({ referCode, qrPayload });
      const commissionAmount = await calcCommissionAmount(productId, orderAmount);

      let commissionTo: string | null = resolved.referrerUserId;
      let attribution = resolved.attribution;
      if (!commissionTo) {
        commissionTo = (await getMonthlyReferAdminUserId()) || 'monthly_admin_unassigned';
        attribution = 'unknown';
      }

      const shippingLookup = await prisma.appSetting.findUnique({
        where: { key: 'shipping_lookup_url' },
      });

      let sellerId: string | null = null;
      let shopId: string | null = null;
      if (productId) {
        const prod = await prisma.storeProduct
          .findUnique({
            where: { id: productId },
            select: { createdByUserId: true, shopId: true },
          })
          .catch(() => null);
        if (prod) {
          sellerId = prod.createdByUserId || null;
          shopId = prod.shopId || null;
          if (prod.shopId) {
            const shop = await prisma.artistShop
              .findUnique({ where: { id: prod.shopId }, select: { ownerId: true } })
              .catch(() => null);
            if (shop?.ownerId) sellerId = shop.ownerId;
          }
        }
      }

      const order = await prisma.order.create({
        data: {
          buyerUserId: session?.user?.id || null,
          buyerName: shippingName || buyerName || session?.user?.name || null,
          buyerPhone: shippingPhone || buyerPhone || null,
          productId: productId || null,
          productName: productName || null,
          sellerUserId: sellerId,
          shopId,
          quantity: Number(quantity) || 1,
          unitPrice: unitPrice != null ? Number(unitPrice) : orderAmount,
          amount: orderAmount,
          totalAmount: orderAmount,
          status: paymentMethod === 'cod' ? 'processing' : 'pending_payment',
          paymentMethod,
          paymentStatus: 'unpaid',
          shippingAddress: shippingAddress || null,
          shippingName: shippingName || null,
          shippingPhone: shippingPhone || null,
          shippingStatus: 'pending',
          shippingLookupUrl: shippingLookup?.value || null,
          referCode: referCode || null,
          referrerUserId: resolved.referrerUserId,
          shareLinkId: resolved.shareLinkId,
          attribution,
          commissionAmount,
          commissionTo,
          commissionStatus: 'pending',
        },
      });

      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: order.status,
          note: 'Đơn hàng đã tạo',
          actorId: session?.user?.id || null,
        },
      });

      if (resolved.shareLinkId) {
        await prisma.shareLink.update({
          where: { id: resolved.shareLinkId },
          data: {
            purchaseCount: { increment: 1 },
            commission: { increment: commissionAmount },
          },
        });
      }

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          attribution: order.attribution,
          commissionAmount: order.commissionAmount,
        },
        message: 'Đặt hàng thành công',
      });
    }

    return NextResponse.json({ error: 'action không hợp lệ' }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
