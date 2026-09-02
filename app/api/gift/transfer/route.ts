import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildBankTransferPayload } from '@/lib/bankTransfer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/gift/transfer
 * Tặng quà từ kho dashboard (sản phẩm / tiền mặt).
 *
 * body:
 *  - toUserId: người nhận
 *  - inventoryItemId?: tặng từ kho có sẵn
 *  - giftType: cash | product | voucher | other
 *  - title?, amount?, note?
 *  - liveSessionId?: nếu tặng trong phiên live
 *
 * Với giftType=cash:
 *  - Lấy STK + ngân hàng của người nhận trên app
 *  - Trả deepLink / payload để mở app ngân hàng, tự điền thông tin chuyển khoản
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      toUserId,
      inventoryItemId,
      giftType = 'product',
      title,
      amount,
      note,
      liveSessionId,
    } = body;

    if (!toUserId) {
      return NextResponse.json({ error: 'Thiếu người nhận (toUserId)' }, { status: 400 });
    }
    if (toUserId === session.user.id) {
      return NextResponse.json({ error: 'Không thể tự tặng cho mình' }, { status: 400 });
    }

    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.user.findUnique({ where: { id: toUserId } }),
    ]);

    if (!fromUser || !toUser) {
      return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 });
    }

    let finalType = giftType as string;
    let finalTitle = title as string | undefined;
    let finalAmount = amount != null ? Number(amount) : undefined;
    let usedInventoryId: string | null = null;

    // Tặng từ kho
    if (inventoryItemId) {
      const item = await prisma.userInventoryItem.findFirst({
        where: { id: inventoryItemId, userId: fromUser.id },
      });
      if (!item) {
        return NextResponse.json({ error: 'Không tìm thấy món trong kho của bạn' }, { status: 404 });
      }
      if (item.quantity < 1) {
        return NextResponse.json({ error: 'Hết số lượng trong kho' }, { status: 400 });
      }

      finalType = item.itemType;
      finalTitle = item.title;
      finalAmount = item.amount ?? finalAmount;
      usedInventoryId = item.id;

      // Giảm số lượng kho
      await prisma.userInventoryItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity - 1 },
      });
    }

    if (finalType === 'cash') {
      if (!finalAmount || finalAmount <= 0) {
        return NextResponse.json({ error: 'Số tiền tặng không hợp lệ' }, { status: 400 });
      }
      if (!toUser.bankAccountNumber || !toUser.bankName) {
        return NextResponse.json(
          {
            error:
              'Người nhận chưa khai báo số tài khoản / ngân hàng trên dashboard — không thể chuyển tiền mặt tự động.',
          },
          { status: 400 }
        );
      }
    }

    let bankDeepLink: string | null = null;
    let bankPayload: string | null = null;

    if (finalType === 'cash' && toUser.bankAccountNumber && toUser.bankName) {
      const payload = buildBankTransferPayload({
        recipientBankName: toUser.bankName,
        recipientAccountNumber: toUser.bankAccountNumber,
        recipientAccountName: toUser.bankAccountName || toUser.fullName || toUser.name || 'Nguoi nhan',
        amount: finalAmount!,
        transferContent: note || `Tang qua tu ${fromUser.fullName || fromUser.name || 'Phuc Long'}`,
      });
      bankDeepLink = payload.deepLink || null;
      bankPayload = JSON.stringify(payload);
    }

    const transfer = await prisma.userGiftTransfer.create({
      data: {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        inventoryItemId: usedInventoryId,
        giftType: finalType,
        title: finalTitle || (finalType === 'cash' ? 'Tiền mặt' : 'Quà tặng'),
        amount: finalAmount,
        note: note || null,
        status: finalType === 'cash' ? 'pending' : 'completed',
        bankDeepLink,
        bankPayload,
        liveSessionId: liveSessionId || null,
        completedAt: finalType === 'cash' ? null : new Date(),
      },
    });

    // Ghi thêm vào LiveGift nếu trong phiên live
    if (liveSessionId) {
      await prisma.liveGift.create({
        data: {
          liveSessionId,
          fromUserId: fromUser.id,
          toUserId: toUser.id,
          giftType: finalType,
          giftTitle: transfer.title,
          amount: finalAmount,
          note: note || null,
          status: 'sent',
          sentAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      transfer,
      bank: bankPayload ? JSON.parse(bankPayload) : null,
      message:
        finalType === 'cash'
          ? 'Đã tạo lệnh tặng tiền mặt. Mở deepLink / app ngân hàng để hoàn tất chuyển khoản (thông tin STK người nhận đã được điền sẵn).'
          : 'Đã tặng quà thành công.',
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

/** GET: danh sách kho quà của user đang đăng nhập */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' });
  }

  const items = await prisma.userInventoryItem.findMany({
    where: { userId: session.user.id, quantity: { gt: 0 } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ items });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}
