import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET  – xem giỏ hàng
 * POST – thêm / cập nhật số lượng (action: add | update | remove | select | clear)
 */
export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', items: [] });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  const selected = items.filter((i) => i.selected);
  const subtotal = selected.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return NextResponse.json({
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    selectedCount: selected.reduce((s, i) => s + i.quantity, 0),
    subtotal,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thêm vào giỏ hàng' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const action = body.action || 'add';
    const userId = session.user.id;

    if (action === 'clear') {
      await prisma.cartItem.deleteMany({ where: { userId } });
      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' });
    }

    if (action === 'remove') {
      if (!body.productId && !body.id) {
        return NextResponse.json({ error: 'Thiếu productId' }, { status: 400 });
      }
      await prisma.cartItem.deleteMany({
        where: {
          userId,
          ...(body.id ? { id: body.id } : { productId: body.productId }),
        },
      });
      return NextResponse.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
    }

    if (action === 'select') {
      await prisma.cartItem.updateMany({
        where: { userId, productId: body.productId },
        data: { selected: !!body.selected },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'select_all') {
      await prisma.cartItem.updateMany({
        where: { userId },
        data: { selected: !!body.selected },
      });
      return NextResponse.json({ success: true });
    }

    // add / update
    const productId = body.productId as string;
    if (!productId) {
      return NextResponse.json({ error: 'Thiếu productId' }, { status: 400 });
    }

    let productName = body.productName as string | undefined;
    let imageUrl = body.imageUrl as string | undefined;
    let unitPrice = body.unitPrice != null ? Number(body.unitPrice) : undefined;
    const qtyDelta = body.quantity != null ? Number(body.quantity) : 1;

    const product = await prisma.storeProduct.findUnique({ where: { id: productId } });
    if (product) {
      productName = product.name;
      imageUrl = product.imageUrl || imageUrl;
      unitPrice = product.bestPrice ?? product.originalPrice ?? unitPrice ?? 0;
    }
    if (unitPrice == null || unitPrice < 0) {
      return NextResponse.json({ error: 'Giá sản phẩm không hợp lệ' }, { status: 400 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (action === 'update' && existing) {
      const nextQty = Math.max(1, Number(body.quantity) || 1);
      const item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQty, unitPrice, productName, imageUrl },
      });
      return NextResponse.json({ success: true, item, message: 'Đã cập nhật số lượng' });
    }

    if (existing) {
      const item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + Math.max(1, qtyDelta),
          unitPrice,
          productName: productName || existing.productName,
          imageUrl: imageUrl || existing.imageUrl,
          selected: true,
        },
      });
      return NextResponse.json({
        success: true,
        item,
        message: 'Đã thêm vào giỏ hàng',
      });
    }

    const item = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        productName: productName || 'Sản phẩm',
        imageUrl: imageUrl || null,
        unitPrice,
        quantity: Math.max(1, qtyDelta),
        selected: true,
      },
    });

    return NextResponse.json({
      success: true,
      item,
      message: 'Đã thêm vào giỏ hàng',
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Lỗi giỏ hàng' }, { status: 500 });
  }
}
