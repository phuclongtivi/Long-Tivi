"use client";

import { useState } from "react";
import { STICKER_PRODUCTS, STICKER_SHOPS } from "./sticker-shops";
import { ProductCard } from "./ProductCard";
import { ShopeeProductSheet } from "./ShopeeProductSheet";
import type { ProductListing } from "./shop-types";
import { BOSS_BANK } from "./boss-bank";
import { useLanguage } from "@/components/LanguageProvider";

export function StickerMallTab() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<ProductListing | null>(null);
  return (
    <section className="pl-locker-shell">
      <header className="pl-locker-hero">
        <span className="pl-future-kicker">{t('item_locker')}</span>
        <h2>{t('superbuy')}</h2>
        <p>{t('superbuy_locker_desc')}</p>
        <div className="pl-locker-scan" aria-hidden="true" />
      </header>
      <div className="pl-locker-shop-row">
        {STICKER_SHOPS.map((s) => (
          <div
            key={s.id}
            className="pl-locker-chip"
            style={{
              display: "inline-block",
              marginRight: 8,
              marginBottom: 8,
              padding: "8px 12px",
              borderRadius: 999,
              color: "var(--pl-text)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {s.name}
          </div>
        ))}
      </div>
      <div className="pl-locker-grid">
        {STICKER_PRODUCTS.map((p) => (
          <div
            key={p.id}
            className="pl-locker-slot"
            style={{
              display: "block",
            }}
          >
            <ProductCard item={p} onOpen={setOpen} />
          </div>
        ))}
      </div>
      {open && <ShopeeProductSheet item={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
