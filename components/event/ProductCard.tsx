"use client";

import type { ProductListing } from "./shop-types";
import { StickerCarousel } from "./StickerCarousel";

type Props = { item: ProductListing; onOpen?: (item: ProductListing) => void };

export function ProductCard({ item, onOpen }: Props) {
  const gallery = item.galleryUrls?.length ? item.galleryUrls : item.coverUrl ? [item.coverUrl] : [];
  return (
    <article
      className="pl-shop-card pl-locker-product"
      onClick={() => onOpen?.(item)}
      role="button"
      style={{
        overflow: "hidden",
        color: "var(--pl-text)",
      }}
    >
      <div style={{ padding: "6px 10px 0", fontSize: 12 }}>
        <div style={{ color: "#E30613", fontWeight: 700 }}>{item.promoLine1 || " "}</div>
        <div style={{ color: "var(--pl-muted)" }}>{item.promoLine2 || " "}</div>
      </div>
      <StickerCarousel urls={gallery} height={110} intervalMs={1100} />
      <div className="body" style={{ padding: "10px 12px 12px" }}>
        <h3 style={{ fontSize: 14, margin: "0 0 4px" }}>{item.name}</h3>
        <div className="ev-meta">
          <b style={{ color: "#ee4d2d" }}>{new Intl.NumberFormat("vi-VN").format(item.priceVnd)}đ</b>
          {item.packQty ? <span style={{ fontSize: 11, opacity: 0.75 }}> · {item.packQty} cái/đơn</span> : null}
        </div>
      </div>
    </article>
  );
}
