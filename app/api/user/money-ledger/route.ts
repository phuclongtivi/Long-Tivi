import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { userBankCheckUrl, bankAppHint } from '@/lib/bankDeepLink';

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/user/money-ledger
 * Bảng theo dõi: tiền thưởng / quà nhận / tiền đã tiêu trong app
 * AI Admin + hệ thống đồng bộ từ Gift + Order
 *
 * Tiền vào → nút Kiểm tra → deep link ngân hàng user đã kê khai
 * Tiền ra (đơn đã chọn PTTT) → nút Kiểm tra → URL giao hàng của đơn/SP
 */
export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' });
  }
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      bankAccountNumber: true,
      bankName: true,
      bankAccountName: true,
      fullName: true,
      name: true,
    },
  });

  // Đồng bộ từ quà nhận + đơn mua (AI/system)
  const [giftsIn, ordersOut, ledgerRows, wallet] = await Promise.all([
    prisma.userGiftTransfer.findMany({
      where: { toUserId: userId, status: { in: ['completed', 'pending'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }).catch(() => []),
    prisma.order.findMany({
      where: { buyerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }).catch(() => []),
    prisma.walletLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }).catch(() => []),
    prisma.giftWallet.findUnique({ where: { userId } }).catch(() => null),
  ]);

  // Commission earned
  const commissions = await prisma.order
    .findMany({
      where: { commissionTo: userId, commissionAmount: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    .catch(() => []);

  type Row = {
    id: string;
    direction: 'in' | 'out';
    category: string;
    amount: number;
    title: string;
    note?: string | null;
    status: string;
    createdAt: string;
    checkType: 'bank' | 'shipping' | null;
    checkUrl: string | null;
    checkLabel: string | null;
    paymentMethod?: string | null;
  };

  const rows: Row[] = [];

  const bankUrl = userBankCheckUrl({
    bankName: user?.bankName,
    accountNumber: user?.bankAccountNumber,
    accountName: user?.bankAccountName || user?.fullName || user?.name,
  });

  for (const g of giftsIn as any[]) {
    rows.push({
      id: `gift-${g.id}`,
      direction: 'in',
      category: g.giftType === 'cash' ? 'reward' : 'gift',
      amount: g.amount || 0,
      title: g.title || (g.giftType === 'cash' ? 'Tiền thưởng / quà tiền mặt' : 'Quà tặng nhận được'),
      note: g.note,
      status: g.status || 'recorded',
      createdAt: new Date(g.createdAt).toISOString(),
      checkType: 'bank',
      checkUrl: bankUrl,
      checkLabel: bankUrl ? 'Kiểm tra' : null,
    });
  }

  for (const c of commissions as any[]) {
    rows.push({
      id: `comm-${c.id}`,
      direction: 'in',
      category: 'commission',
      amount: c.commissionAmount || 0,
      title: `Hoa hồng refer — ${c.productName || 'đơn hàng'}`,
      note: c.attribution || null,
      status: c.commissionStatus || 'pending',
      createdAt: new Date(c.createdAt).toISOString(),
      checkType: 'bank',
      checkUrl: bankUrl,
      checkLabel: bankUrl ? 'Kiểm tra' : null,
    });
  }

  for (const o of ordersOut as any[]) {
    const hasPayment = !!(o.paymentMethod && o.paymentMethod !== '');
    const shipUrl = o.shippingLookupUrl || null;
    rows.push({
      id: `order-${o.id}`,
      direction: 'out',
      category: 'spend',
      amount: o.totalAmount ?? o.amount ?? 0,
      title: o.productName || 'Chi tiêu mua hàng trên app',
      note: [o.paymentMethod, o.shippingStatus].filter(Boolean).join(' · ') || null,
      status: o.status || 'pending_payment',
      createdAt: new Date(o.createdAt).toISOString(),
      checkType: hasPayment && shipUrl ? 'shipping' : hasPayment ? 'shipping' : null,
      checkUrl: hasPayment ? shipUrl : null,
      checkLabel: hasPayment ? 'Kiểm tra' : null,
      paymentMethod: o.paymentMethod,
    });
  }

  for (const L of ledgerRows as any[]) {
    // tránh trùng nếu đã có từ gift/order
    if (rows.some((r) => r.id === L.id || (L.orderId && r.id === `order-${L.orderId}`))) continue;
    const isIn = L.direction === 'in';
    rows.push({
      id: L.id,
      direction: isIn ? 'in' : 'out',
      category: L.category,
      amount: L.amount,
      title: L.title,
      note: L.note,
      status: L.status,
      createdAt: new Date(L.createdAt).toISOString(),
      checkType: isIn
        ? 'bank'
        : L.shippingLookupUrl || L.orderId
          ? 'shipping'
          : null,
      checkUrl: isIn ? bankUrl : L.shippingLookupUrl || null,
      checkLabel:
        isIn && bankUrl
          ? 'Kiểm tra'
          : !isIn && L.shippingLookupUrl
            ? 'Kiểm tra'
            : null,
      paymentMethod: L.paymentMethod,
    });
  }

  rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const sumIn = rows.filter((r) => r.direction === 'in').reduce((s, r) => s + r.amount, 0);
  const sumOut = rows.filter((r) => r.direction === 'out').reduce((s, r) => s + r.amount, 0);

  return NextResponse.json({
    summary: {
      totalIn: sumIn,
      totalOut: sumOut,
      giftWalletBalance: (wallet as any)?.balance ?? 0,
      bankLinked: !!(user?.bankAccountNumber && user?.bankName),
      bankName: user?.bankName || null,
      bankHint: bankAppHint(user?.bankName),
    },
    rows,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

/** POST — AI Admin / system ghi một dòng sổ (đồng bộ thủ công) */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  // User chỉ ghi được cho chính mình; AI/Admin có thể mở rộng sau
  const userId = session.user.id;
  const direction = body.direction === 'out' ? 'out' : 'in';
  const amount = Number(body.amount) || 0;
  if (!body.title || amount <= 0) {
    return NextResponse.json({ error: 'title và amount > 0 bắt buộc' }, { status: 400 });
  }

  try {
    const entry = await prisma.walletLedgerEntry.create({
      data: {
        userId,
        direction,
        category: body.category || (direction === 'in' ? 'reward' : 'spend'),
        amount,
        title: String(body.title).slice(0, 200),
        note: body.note || null,
        bankCheckable: direction === 'in',
        orderId: body.orderId || null,
        shippingLookupUrl: body.shippingLookupUrl || null,
        paymentMethod: body.paymentMethod || null,
        status: body.status || 'recorded',
        source: body.source || 'system',
      },
    });
    return NextResponse.json({ success: true, entry });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Lỗi ghi sổ' }, { status: 500 });
  }
}
