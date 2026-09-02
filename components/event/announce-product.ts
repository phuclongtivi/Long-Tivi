import type { ProductListing } from "./shop-types";
import { generateProductCode } from "./livestream-product";

export const PRODUCT_IMG_MIN = 3;
export const PRODUCT_IMG_MAX = 5;
export const PRODUCT_IMG_MAX_BYTES = 3 * 1024 * 1024;
export const MAX_PRODUCTS_PER_ANNOUNCE = 2;
export const MAX_PRODUCTS_PER_MONTH = 6;

export type EventProductIntro = {
  id: string;
  name: string;
  yearMade: string;
  priceVnd: number;
  brand: string;
  description: string;
  discount1?: string;
  discount2?: string;
  discount3?: string;
  note1?: string;
  note2?: string;
  warrantyUrls: string[];
  imageUrls: string[];
};

export function productIntroErrors(p: Partial<EventProductIntro> | null | undefined): string[] {
  if (!p) return ["Chưa điền sản phẩm."];
  const e: string[] = [];
  if (!p.name?.trim()) e.push("Tên sản phẩm");
  if (!p.yearMade?.trim()) e.push("Năm sản xuất");
  if (!p.priceVnd || p.priceVnd <= 0) e.push("Giá bán");
  if (!p.brand?.trim()) e.push("Hãng sản xuất");
  if (!p.description?.trim()) e.push("Mô tả sản phẩm");
  const imgs = p.imageUrls || [];
  if (imgs.length < PRODUCT_IMG_MIN) e.push(`Ảnh sản phẩm (tối thiểu ${PRODUCT_IMG_MIN})`);
  if (imgs.length > PRODUCT_IMG_MAX) e.push(`Ảnh sản phẩm (tối đa ${PRODUCT_IMG_MAX})`);
  return e;
}

export function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function canAddAnnounceProduct(opts: {
  alreadyOnForm: number;
  listedThisMonth: number;
}): { ok: boolean; reason?: string } {
  if (opts.alreadyOnForm >= MAX_PRODUCTS_PER_ANNOUNCE) {
    return { ok: false, reason: `Mỗi thông báo tối đa ${MAX_PRODUCTS_PER_ANNOUNCE} sản phẩm.` };
  }
  if (opts.listedThisMonth >= MAX_PRODUCTS_PER_MONTH) {
    return { ok: false, reason: `Mỗi user tối đa ${MAX_PRODUCTS_PER_MONTH} sản phẩm / tháng.` };
  }
  return { ok: true };
}

export function listingFromIntro(
  intro: EventProductIntro,
  opts: { ownerId: string; shopId: string; liveId: string; index?: number }
): ProductListing {
  return {
    id: intro.id || generateProductCode(opts.liveId, opts.index ?? 0),
    shopId: opts.shopId,
    ownerId: opts.ownerId,
    name: intro.name.trim(),
    priceVnd: intro.priceVnd,
    promoLine1: intro.discount1 || intro.brand,
    promoLine2: intro.discount2 || ("Năm SX " + intro.yearMade),
    promoLine3: intro.discount3,
    note1: intro.note1,
    note2: intro.note2,
    coverUrl: intro.imageUrls[0],
    publishedAt: new Date().toISOString(),
    liveRelated: true,
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > PRODUCT_IMG_MAX_BYTES) {
      reject(new Error("Mỗi ảnh không quá 3MB."));
      return;
    }
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Không đọc được ảnh."));
    r.readAsDataURL(file);
  });
}
