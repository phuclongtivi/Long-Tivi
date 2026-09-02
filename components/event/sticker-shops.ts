import { TIER1_STICKERS } from "./stickers-tier1";
import { TIER2_STICKERS } from "./stickers-tier2";
import { TIER3_STICKERS } from "./stickers-tier3";
import type { ProductListing, Shop } from "./shop-types";
import { POINT_TO_VND, STICKER_PACK_QTY } from "./boss-bank";

export const STICKER_SHOPS: Shop[] = [
  {
    id: "shop-sticker-l1",
    ownerId: "boss",
    ownerRole: "boss",
    name: "Sticker Level 1",
    publishedAt: "2026-08-28T00:00:00.000Z",
    status: "active",
  },
  {
    id: "shop-sticker-l2",
    ownerId: "boss",
    ownerRole: "boss",
    name: "Sticker Level 2",
    publishedAt: "2026-08-28T00:00:00.000Z",
    status: "active",
  },
  {
    id: "shop-sticker-l3",
    ownerId: "boss",
    ownerRole: "boss",
    name: "Sticker Level 3",
    publishedAt: "2026-08-28T00:00:00.000Z",
    status: "active",
  },
];

function packPrice(pointsEach: number) {
  return STICKER_PACK_QTY * pointsEach * POINT_TO_VND;
}

export const STICKER_PRODUCTS: ProductListing[] = [
  {
    id: "prod-sticker-l1",
    shopId: "shop-sticker-l1",
    ownerId: "boss",
    name: "Gói Sticker Level 1 · 5 cái/đơn",
    priceVnd: packPrice(1),
    promoLine1: "Mở khoá cấp 1 · 1 điểm / sticker",
    promoLine2: "Đơn cố định 5 cái · thanh toán QR",
    note1: "Nhận ngẫu nhiên 5 sticker trong kho Level 1.",
    note2: "1 điểm = 1.000đ khi quy đổi.",
    coverUrl: TIER1_STICKERS[0]?.imageUrl,
    galleryUrls: TIER1_STICKERS.map((s) => s.imageUrl),
    publishedAt: "2026-08-28T00:00:00.000Z",
    pinned: true,
    packQty: STICKER_PACK_QTY,
    stickerTier: 1,
    defaultPay: "bank-qr",
  },
  {
    id: "prod-sticker-l2",
    shopId: "shop-sticker-l2",
    ownerId: "boss",
    name: "Gói Sticker Level 2 · 5 cái/đơn",
    priceVnd: packPrice(2),
    promoLine1: "Cấp phóng viên · 2 điểm / sticker",
    promoLine2: "Đơn cố định 5 cái · thanh toán QR",
    note1: "Nhận ngẫu nhiên 5 sticker trong kho Level 2.",
    note2: "1 điểm = 1.000đ khi quy đổi.",
    coverUrl: TIER2_STICKERS[0]?.imageUrl,
    galleryUrls: TIER2_STICKERS.map((s) => s.imageUrl),
    publishedAt: "2026-08-28T00:00:00.000Z",
    pinned: true,
    packQty: STICKER_PACK_QTY,
    stickerTier: 2,
    defaultPay: "bank-qr",
  },
  {
    id: "prod-sticker-l3",
    shopId: "shop-sticker-l3",
    ownerId: "boss",
    name: "Gói Sticker Level 3 · 5 cái/đơn",
    priceVnd: packPrice(5),
    promoLine1: "Cấp nghệ sỹ · 5 điểm / sticker",
    promoLine2: "Đơn cố định 5 cái · thanh toán QR",
    note1: "Nhận ngẫu nhiên 5 sticker trong kho Level 3.",
    note2: "1 điểm = 1.000đ khi quy đổi.",
    coverUrl: TIER3_STICKERS[0]?.imageUrl,
    galleryUrls: TIER3_STICKERS.map((s) => s.imageUrl),
    publishedAt: "2026-08-28T00:00:00.000Z",
    pinned: true,
    packQty: STICKER_PACK_QTY,
    stickerTier: 3,
    defaultPay: "bank-qr",
  },
];

export function shopOf(product: ProductListing) {
  return (
    STICKER_SHOPS.find((s) => s.id === product.shopId) ?? {
      id: product.shopId,
      ownerId: product.ownerId,
      ownerRole: "boss" as const,
      name: "Phúc Long superBUY™",
      publishedAt: product.publishedAt,
      status: "active" as const,
    }
  );
}

export function productsOfShop(shopId: string) {
  return STICKER_PRODUCTS.filter((p) => p.shopId === shopId);
}
