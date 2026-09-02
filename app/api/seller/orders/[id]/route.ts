import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAppAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/seller/orders/[id]
 * Người bán cập nhật trạng thái đơn / vận đơn (kiểu Shopee seller center)
 * action: confirm | pack | ship | deliver | update_tracking | cancel_by_seller
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return NextResponse.json({ error: 'Không tìm thấy đơn' }, { status: 404 });
  }

  const admin = await isAppAdmin(session.user.id, session.user.email);
  const isSeller = order.sellerUserId === session.user.id;
  if (!admin && !isSeller) {
    return NextResponse.json({ error: 'Không phải đơn của gian hàng bạn' }, { status: 403 });
  }

  const body = await req.json();
  const action = body.action as string;
  const data: Record<string, unknown> = {};
  let note = body.note || '';

  switch (action) {
    case 'confirm':
      data.status = 'processing';
      data.shippingStatus = 'confirmed';
      note = note || 'Người bán xác nhận đơn';
      break;
    case 'pack':
      data.status = 'processing';
      data.shippingStatus = 'packing';
      note = note || 'Đang đóng gói';
      break;
    case 'ship':
      data.status = 'shipping';
      data.shippingStatus = body.shippingStatus || 'handed_to_carrier';
      if (body.trackingCode) data.trackingCode = body.trackingCode;
      if (body.carrierName) data.carrierName = body.carrierName;
      if (body.shippingLookupUrl) data.shippingLookupUrl = body.shippingLookupUrl;
      note = note || `Đã giao đơn vị vận chuyển${body.trackingCode ? ` · ${body.trackingCode}` : ''}`;
      break;
    case 'deliver':
      data.status = 'delivered';
      data.shippingStatus = 'delivered';
      data.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        data.paymentStatus = 'paid';
        data.paidAt = new Date();
      }
      note = note || 'Đã giao thành công';
      break;
    case 'update_tracking':
      if (body.trackingCode !== undefined) data.trackingCode = body.trackingCode;
      if (body.carrierName !== undefined) data.carrierName = body.carrierName;
      if (body.shippingLookupUrl !== undefined) data.shippingLookupUrl = body.shippingLookupUrl;
      if (body.shippingStatus) data.shippingStatus = body.shippingStatus;
      note = note || 'Cập nhật mã vận đơn';
      break;
    case 'cancel_by_seller':
      if (['delivered', 'completed'].includes(order.status)) {
        return NextResponse.json({ error: 'Không hủy đơn đã giao' }, { status: 400 });
      }
      data.status = 'cancelled';
      data.shippingStatus = 'failed';
      note = note || 'Người bán hủy đơn';
      break;
    case 'mark_paid':
      data.paymentStatus = 'paid';
      data.paidAt = new Date();
      if (order.status === 'pending_payment') data.status = 'processing';
      note = note || 'Xác nhận đã nhận thanh toán';
      break;
    default:
      return NextResponse.json({ error: 'action không hợp lệ' }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data,
  });

  await prisma.orderStatusLog.create({
    data: {
      orderId: order.id,
      status: (data.status as string) || (data.shippingStatus as string) || order.status,
      note,
      actorId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, order: updated, message: note });
}
