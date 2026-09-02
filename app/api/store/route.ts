import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAppAdmin, canCreateStoreProduct } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { detectLegalEntityProduct, originWarningFields } from '@/lib/productOrigin';
import { ensureChatbotProducts } from '@/lib/ensureChatbotProducts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const filter = searchParams.get('filter')?.trim();
    const q = searchParams.get('q')?.trim();
    const shopId = searchParams.get('shopId');

    // Bảo đảm 3 gói chatbot luôn có trong kho
    try {
      await ensureChatbotProducts();
    } catch {
      /* schema chưa push */
    }

    const items = await prisma.storeProduct.findMany({
      where: {
        active: true,
        ...(shopId ? { shopId } : {}),
        ...(type === 'product' || type === 'service' ? { type } : {}),
        ...(filter === 'chatbot'
          ? {
              OR: [
                { theme: 'chatbot' },
                { sku: { startsWith: 'chatbot_' } },
                { name: { contains: 'Chatbot', mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { latestInfo: { contains: q, mode: 'insensitive' } },
                { brand: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [
        { pinnedByAdmin: 'desc' },
        { pinOrder: 'asc' },
        { updatedAt: 'desc' },
      ],
    });

    if (items.length === 0 && !q && !shopId) {
      const videos = await prisma.archiveVideo.findMany({
        where: { theme: { in: ['SanPhamMoi', 'DichVuMoi'] } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      return NextResponse.json({
        products: videos.map((v) => ({
          id: v.id,
          name: v.title,
          type: v.theme === 'DichVuMoi' ? 'service' : 'product',
          description: v.description,
          imageUrl: v.thumbnailUrl,
          bestPrice: null,
          originalPrice: null,
          latestInfo: v.rewardNote || 'Thông tin do AI Admin cập nhật sau livestream.',
          theme: v.theme,
          fromArchive: true,
        })),
        source: 'archive_fallback',
      });
    }

    return NextResponse.json({ products: items, source: 'store' });
  } catch (e: any) {
    return NextResponse.json({ items: [], products: [], error: "db_unavailable" });
  }
}

/** Admin hoặc Nghệ sĩ thêm sản phẩm — đủ trường kiểu Amazon + rà soát xuất xứ */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.id ||
      !(await canCreateStoreProduct(session.user.id, session.user.email))
    ) {
      return NextResponse.json(
        { error: 'Chỉ Admin/Boss hoặc user hạng Nghệ sĩ được thêm sản phẩm' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const name = (body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Tên sản phẩm / dịch vụ bắt buộc' }, { status: 400 });
    }

    // Đảm bảo có gian hàng Nghệ sĩ
    let shopId = body.shopId || null;
    if (!shopId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, fullName: true },
      });
      const shop = await prisma.artistShop.upsert({
        where: { ownerId: session.user.id },
        create: {
          ownerId: session.user.id,
          name: user?.fullName || user?.name || 'Gian hàng Nghệ sĩ',
          active: true,
        },
        update: {},
      });
      shopId = shop.id;
    }

    const isLegal = detectLegalEntityProduct({
      manufacturerName: body.manufacturerName,
      brand: body.brand,
      description: body.description,
      name,
    });
    const hasCert = !!(body.originCertUrl && body.qualityDeclUrl);
    const origin = originWarningFields(isLegal, hasCert);

    const product = await prisma.storeProduct.create({
      data: {
        name,
        type: body.type === 'service' ? 'service' : 'product',
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        imageUrls: body.imageUrls
          ? typeof body.imageUrls === 'string'
            ? body.imageUrls
            : JSON.stringify(body.imageUrls)
          : null,
        bestPrice:
          body.bestPrice != null && body.bestPrice !== ''
            ? Number(body.bestPrice)
            : null,
        originalPrice:
          body.originalPrice != null && body.originalPrice !== ''
            ? Number(body.originalPrice)
            : null,
        latestInfo: body.latestInfo || null,
        theme: body.theme || (body.type === 'service' ? 'DichVuMoi' : 'SanPhamMoi'),
        brand: body.brand || null,
        sku: body.sku || null,
        category: body.category || null,
        bulletPoints: body.bulletPoints
          ? typeof body.bulletPoints === 'string'
            ? body.bulletPoints
            : JSON.stringify(body.bulletPoints)
          : null,
        specifications: body.specifications
          ? typeof body.specifications === 'string'
            ? body.specifications
            : JSON.stringify(body.specifications)
          : null,
        stock: body.stock != null ? Number(body.stock) : 0,
        condition: body.condition || 'new',
        manufacturerName: body.manufacturerName || null,
        originCertUrl: body.originCertUrl || null,
        qualityDeclUrl: body.qualityDeclUrl || null,
        ...origin,
        shopId,
        updatedBy: session.user.email || session.user.id,
        createdByUserId: session.user.id,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      message: origin.originWarning
        ? 'Đã thêm SP. Cảnh báo: sản phẩm pháp nhân — bổ sung Chứng nhận xuất xứ & công bố chất lượng trong 3 ngày làm việc.'
        : 'Đã thêm vào gian hàng',
      originWarning: origin.originWarning,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** PATCH — bổ sung chứng nhận xuất xứ / cập nhật SP */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

    const existing = await prisma.storeProduct.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy SP' }, { status: 404 });
    }
    const admin = await isAppAdmin(session.user.id, session.user.email);
    if (!admin && existing.createdByUserId !== session.user.id) {
      return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    }

    const originCertUrl =
      body.originCertUrl !== undefined ? body.originCertUrl : existing.originCertUrl;
    const qualityDeclUrl =
      body.qualityDeclUrl !== undefined ? body.qualityDeclUrl : existing.qualityDeclUrl;
    const hasCert = !!(originCertUrl && qualityDeclUrl);
    const isLegal = existing.isLegalEntityProduct || detectLegalEntityProduct(body);
    const origin = originWarningFields(!!isLegal, hasCert);

    const product = await prisma.storeProduct.update({
      where: { id },
      data: {
        originCertUrl: originCertUrl || null,
        qualityDeclUrl: qualityDeclUrl || null,
        manufacturerName:
          body.manufacturerName !== undefined
            ? body.manufacturerName
            : existing.manufacturerName,
        ...origin,
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        bestPrice: body.bestPrice !== undefined ? Number(body.bestPrice) : undefined,
        brand: body.brand !== undefined ? body.brand : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        pinnedByAdmin: body.pinnedByAdmin !== undefined ? Boolean(body.pinnedByAdmin) : undefined,
        pinOrder: body.pinOrder !== undefined ? Number(body.pinOrder) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      originWarning: product.originWarning,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
