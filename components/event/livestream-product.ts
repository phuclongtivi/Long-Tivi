export const MAX_PRODUCTS_PER_LIVE = 5;

export type LiveProductDraft = {
  name: string;
  description: string;
  priceVnd: number;
  stock: number;
  skuHint?: string;
  promoLine1: string;
  promoLine2: string;
  images: string[];
  weightGram?: number;
  category?: string;
};

export type ListedProduct = LiveProductDraft & {
  productCode: string;
  verified: true;
  verifiedLabel: "Đã thực kiểm";
  /** Logo huy hiệu PREMIUM QUALITY (thay sao vàng số 1) */
  premiumBadge: true; // PREMIUM QUALITY
  listedOn: "Phúc Long superBUY™";
  liveSessionId: string;
  creatorId: string;
  creatorRole: "artist" | "journalist";
  lockedKeys: (keyof LiveProductDraft)[];
};

export function canAddProductToLive(existingCount: number): boolean {
  return existingCount < MAX_PRODUCTS_PER_LIVE;
}

export function generateProductCode(liveSessionId: string, index: number): string {
  const n = String(index + 1).padStart(2, "0");
  const short = liveSessionId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `PLSB-${short}-${n}`;
}

function filledKeys(draft: Partial<LiveProductDraft>): (keyof LiveProductDraft)[] {
  const keys: (keyof LiveProductDraft)[] = [];
  (Object.keys(draft) as (keyof LiveProductDraft)[]).forEach((k) => {
    const v = draft[k];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v) && v.length === 0) return;
    keys.push(k);
  });
  return keys;
}

export function confirmLiveProduct(opts: {
  draft: LiveProductDraft;
  liveSessionId: string;
  creatorId: string;
  creatorRole: "artist" | "journalist";
  existingCount: number;
}): ListedProduct {
  if (!canAddProductToLive(opts.existingCount)) {
    throw new Error("Mỗi phiên livestream tối đa 5 sản phẩm.");
  }
  return {
    ...opts.draft,
    productCode: generateProductCode(opts.liveSessionId, opts.existingCount),
    verified: true,
    verifiedLabel: "Đã thực kiểm",
    premiumBadge: true,
    listedOn: "Phúc Long superBUY™",
    liveSessionId: opts.liveSessionId,
    creatorId: opts.creatorId,
    creatorRole: opts.creatorRole,
    lockedKeys: filledKeys(opts.draft),
  };
}

/**
 * Chỉ được BỔ SUNG field còn trống.
 * Field đã có giá trị (lockedKeys) không được đổi.
 * productCode / verified / liveSessionId luôn khóa.
 */
export function supplementProduct(
  current: ListedProduct,
  extra: Partial<LiveProductDraft>
): ListedProduct {
  const next: ListedProduct = { ...current };
  const newlyLocked: (keyof LiveProductDraft)[] = [...current.lockedKeys];

  (Object.keys(extra) as (keyof LiveProductDraft)[]).forEach((k) => {
    if (current.lockedKeys.includes(k)) return; // không sửa dữ liệu cũ
    const incoming = extra[k];
    if (incoming === undefined || incoming === null) return;
    if (typeof incoming === "string" && incoming.trim() === "") return;
    if (Array.isArray(incoming) && incoming.length === 0) return;
    // @ts-expect-error merge append-only
    next[k] = incoming;
    if (!newlyLocked.includes(k)) newlyLocked.push(k);
  });

  next.lockedKeys = newlyLocked;
  return next;
}
