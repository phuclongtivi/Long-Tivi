import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, liveSessionId, giftTitle, giftType, amount, note, toUserId, giftId } = body;

    const live = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
      include: { user: true },
    });
    if (!live || live.userId !== session.user.id) {
      return NextResponse.json({ error: 'Chỉ host mới được treo/tặng quà' }, { status: 403 });
    }
    if (!live.user.canOrganizeLive) {
      return NextResponse.json({ error: 'Bạn chưa được cấp quyền bảng điều khiển' }, { status: 403 });
    }

    if (action === 'hang') {
      const gift = await prisma.liveGift.create({
        data: {
          liveSessionId,
          fromUserId: session.user.id,
          toUserId: null,
          giftType: giftType || 'other',
          giftTitle: giftTitle || 'Quà tặng',
          amount: amount ?? 0,
          note: note || null,
          status: 'pending',
        },
      });
      return NextResponse.json({ success: true, gift, message: 'Đã treo quà thành công' });
    }

    if (action === 'send') {
      if (!toUserId) {
        return NextResponse.json({ error: 'Thiếu người nhận' }, { status: 400 });
      }

      const attended = await prisma.liveAttendance.findUnique({
        where: {
          userId_liveSessionId: { userId: toUserId, liveSessionId },
        },
      });
      if (!attended) {
        return NextResponse.json({ error: 'Người này chưa tham gia buổi livestream' }, { status: 400 });
      }

      let gift;
      if (giftId) {
        gift = await prisma.liveGift.update({
          where: { id: giftId },
          data: { toUserId, status: 'sent', sentAt: new Date() },
        });
      } else {
        gift = await prisma.liveGift.create({
          data: {
            liveSessionId,
            fromUserId: session.user.id,
            toUserId,
            giftType: giftType || 'other',
            giftTitle: giftTitle || 'Quà tặng',
            amount: amount ?? 0,
            note: note || null,
            status: 'sent',
            sentAt: new Date(),
          },
        });
      }

      const value = gift.amount || 0;
      await prisma.giftWallet.upsert({
        where: { userId: toUserId },
        create: { userId: toUserId, balance: value },
        update: { balance: { increment: value } },
      });

      return NextResponse.json({
        success: true,
        gift,
        message: 'Đã tặng quà. Quà đã được chuyển vào tài khoản quà tặng của người nhận.',
      });
    }

    return NextResponse.json({ error: 'action không hợp lệ (hang | send)' }, { status: 400 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const liveSessionId = searchParams.get('liveSessionId');
    if (!liveSessionId) {
      return NextResponse.json({ error: 'Thiếu liveSessionId' }, { status: 400 });
    }

    const gifts = await prisma.liveGift.findMany({
      where: { liveSessionId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ gifts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
