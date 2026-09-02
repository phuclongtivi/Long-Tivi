import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MIN = 5_000;
const MAX = 20_000_000;

/**
 * POST /api/live/ticket
 * Người xem tự chọn số tiền vé trong khoảng 5.000 – 20.000.000 VND
 * body: { liveSessionId, amount }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Cần đăng nhập để mua vé xem live' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const liveSessionId = String(body.liveSessionId || '');
    let amount = Math.round(Number(body.amount) || 0);

    if (!liveSessionId) {
      return NextResponse.json({ error: 'Thiếu liveSessionId' }, { status: 400 });
    }

    const live = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
    });
    if (!live) {
      return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 });
    }
    if (!(live as any).requiresTicket) {
      return NextResponse.json(
        { error: 'Sự kiện này không yêu cầu vé' },
        { status: 400 }
      );
    }

    const minP = (live as any).ticketPriceMin ?? MIN;
    const maxP = (live as any).ticketPriceMax ?? MAX;
    if (amount < minP || amount > maxP) {
      return NextResponse.json(
        {
          error: `Số tiền vé phải từ ${minP.toLocaleString('vi-VN')} đến ${maxP.toLocaleString('vi-VN')} đồng`,
        },
        { status: 400 }
      );
    }

    // Tạo đơn hàng kiểu vé (Order) — thanh toán theo flow store/Shopee
    const order = await prisma.order.create({
      data: {
        buyerUserId: session.user.id,
        buyerName: session.user.name || null,
        productName: `Vé xem live: ${live.title || liveSessionId}`,
        amount,
        unitPrice: amount,
        quantity: 1,
        totalAmount: amount,
        status: 'pending_payment',
        paymentStatus: 'unpaid',
        paymentMethod: body.paymentMethod || 'bank_transfer',
        attribution: 'ticket',
        referCode: body.referCode || null,
      },
    });

    await prisma.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: 'pending_payment',
        note: `Vé live ${liveSessionId} · ${amount} VND (tự chọn trong ${minP}-${maxP})`,
        actorId: session.user.id,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount,
      liveSessionId,
      message:
        'Đã tạo đơn vé. Thanh toán xong để được toàn quyền xem livestream này.',
      payHint: 'Theo dõi đơn trong mục đơn hàng / thanh toán như mua hàng trên store.',
    });
  } catch (e: any) {
    console.error('ticket', e);
    return NextResponse.json({ error: e?.message || 'Lỗi mua vé' }, { status: 500 });
  }
}
