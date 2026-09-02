import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAppAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/orders/[id] — chi tiết + timeline
 * PATCH — cập nhật trạng thái / thanh toán / giao hàng (Admin hoặc buyer hủy)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' });
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: 'Không tìm thấy đơn' }, { status: 404 });

    const isOwner = order.buyerUserId === session.user.id;
    const isSeller = order.sellerUserId === session.user.id;
    const admin = await isAppAdmin(session.user.id, session.user.email);
    if (!isOwner && !isSeller && !admin) {
      return NextResponse.json({ error: 'Forbidden' });
    }

    const logs = await prisma.orderStatusLog.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });

    // Boss URL tra cứu vận chuyển (cấu hình AppSetting)
    const shippingLookupSetting = await prisma.appSetting.findUnique({
      where: { key: 'shipping_lookup_url' },
    });

    return NextResponse.json({
      order,
      timeline: logs,
      shippingLookupUrl:
        order.shippingLookupUrl || shippingLookupSetting?.value || null,
      // Admin AI có thể gọi URL này + trackingCode để phản hồi khách
      trackingHint: order.trackingCode
        ? `Mã vận đơn: ${order.trackingCode}${order.carrierName ? ` · ${order.carrierName}` : ''}`
        : 'Chưa có mã vận đơn',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const admin = await isAppAdmin(session.user.id, session.user.email);
    const isOwner = order.buyerUserId === session.user.id;

    // Buyer chỉ được hủy khi chưa giao
    if (body.action === 'cancel' && isOwner) {
      if (['delivered', 'completed', 'shipping'].includes(order.status)) {
        return NextResponse.json({ error: 'Không thể hủy đơn đang giao / đã giao' }, { status: 400 });
      }
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'cancelled', shippingStatus: 'failed' },
      });
      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'cancelled',
          note: body.note || 'Người mua hủy đơn',
          actorId: session.user.id,
        },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    // Buyer xác nhận đã nhận hàng
    if (body.action === 'confirm_received' && isOwner) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'completed',
          shippingStatus: 'delivered',
          deliveredAt: new Date(),
          paymentStatus: order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus,
          paidAt: order.paymentMethod === 'cod' ? new Date() : order.paidAt,
        },
      });
      await prisma.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'completed',
          note: 'Người mua xác nhận đã nhận hàng',
          actorId: session.user.id,
        },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    if (!admin) {
      return NextResponse.json({ error: 'Chỉ Admin/Boss được cập nhật vận đơn' }, { status: 403 });
    }

    // Admin cập nhật
    const data: Record<string, unknown> = {};
    if (body.status) data.status = body.status;
    if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
    if (body.paymentMethod) data.paymentMethod = body.paymentMethod;
    if (body.shippingStatus) data.shippingStatus = body.shippingStatus;
    if (body.trackingCode !== undefined) data.trackingCode = body.trackingCode;
    if (body.carrierName !== undefined) data.carrierName = body.carrierName;
    if (body.shippingNote !== undefined) data.shippingNote = body.shippingNote;
    if (body.shippingLookupUrl !== undefined) data.shippingLookupUrl = body.shippingLookupUrl;
    if (body.paymentStatus === 'paid') data.paidAt = new Date();
    if (body.shippingStatus === 'delivered') {
      data.deliveredAt = new Date();
      data.status = 'delivered';
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data,
    });

    await prisma.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: (body.status || body.shippingStatus || order.status) as string,
        note: body.note || 'Admin cập nhật trạng thái',
        actorId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
