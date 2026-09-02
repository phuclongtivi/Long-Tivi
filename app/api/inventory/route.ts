import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST – thêm / cập nhật món vào kho dashboard (cash, product…)
 * GET  – xem kho của mình
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

  const items = await prisma.userInventoryItem.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ items });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { itemType = 'product', title, description, amount, quantity = 1, imageUrl } = body;

  if (!title) {
    return NextResponse.json({ error: 'Thiếu title' }, { status: 400 });
  }
  if (itemType === 'cash' && (amount == null || Number(amount) <= 0)) {
    return NextResponse.json({ error: 'Tiền mặt cần amount > 0' }, { status: 400 });
  }

  const item = await prisma.userInventoryItem.create({
    data: {
      userId: session.user.id,
      itemType,
      title,
      description: description || null,
      amount: amount != null ? Number(amount) : null,
      quantity: Number(quantity) || 1,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json({ success: true, item });
}
