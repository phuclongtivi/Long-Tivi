import { TIER1_STICKERS } from "./stickers-tier1";
import { TIER2_STICKERS } from "./stickers-tier2";
import { TIER3_STICKERS } from "./stickers-tier3";
import { STICKER_PRODUCTS } from "./sticker-shops";

export type WalletGoods = {
  id: string;
  name: string;
  priceVnd: number;
  inCart: boolean;
  coverUrl?: string;
};

export type WalletLoot = {
  id: string;
  name: string;
  kind: "sticker" | "promo";
  imageUrl?: string;
  note?: string;
  expiresAt?: string;
};

const CART_KEY = "pl-cart-lines";

export function loadCartGoods(): WalletGoods[] {
  let cart: { productId?: string; name?: string; priceVnd?: number; qty?: number }[] = [];
  if (typeof localStorage !== "undefined") {
    try {
      cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      cart = [];
    }
  }
  const fromCart: WalletGoods[] = cart.slice(0, 8).map((l, i) => ({
    id: l.productId || "cart-" + i,
    name: l.name || "Mặt hàng giỏ",
    priceVnd: l.priceVnd || 0,
    inCart: true,
  }));
  const extra = STICKER_PRODUCTS.slice(0, 8).map((p) => ({
    id: p.id,
    name: p.name,
    priceVnd: p.priceVnd,
    inCart: false,
    coverUrl: p.coverUrl,
  }));
  const seen = new Set(fromCart.map((x) => x.id));
  return [...fromCart, ...extra.filter((x) => !seen.has(x.id))].slice(0, 8);
}

export function loadWalletLoot(): WalletLoot[] {
  const stickers = [...TIER1_STICKERS.slice(0, 4), ...TIER2_STICKERS.slice(0, 3), ...TIER3_STICKERS.slice(0, 3)].map(
    (s) => ({
      id: s.id,
      name: s.name,
      kind: "sticker" as const,
      imageUrl: s.imageUrl,
      note: `${s.points} điểm`,
    })
  );
  const promos: WalletLoot[] = [
    {
      id: "promo-live-1",
      name: "Mã BTC −10%",
      kind: "promo",
      note: "Ưu đãi phiên live còn hiệu lực",
      expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    },
    {
      id: "promo-live-2",
      name: "Vé trừ điểm sticker",
      kind: "promo",
      note: "BTC bật trừ điểm vào vé",
      expiresAt: new Date(Date.now() + 3 * 86400_000).toISOString(),
    },
  ];
  return [...stickers, ...promos];
}
