"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { loadCartGoods, loadWalletLoot } from "./gift-wallet";

function GiftWalletScreenInner() {
  const goods = useMemo(() => loadCartGoods(), []);
  const loot = useMemo(() => loadWalletLoot(), []);

  return (
    <div style={{ padding: "12px 12px 108px", color: "var(--pl-text)", minHeight: "70dvh" }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Ví Quà</h2>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--pl-muted)" }}>
        Trên: giỏ superBUY (tối đa 8) · Dưới: sticker + mã ưu đãi BTC còn hạn
      </p>

      <section
        style={{
          border: "1px solid var(--pl-border)",
          borderRadius: 14,
          padding: 10,
          background: "var(--pl-surface)",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <strong style={{ fontSize: 14 }}>Giỏ / chưa mua</strong>
          <Link href="/store" style={{ fontSize: 12, color: "#7AD0FF" }}>superBUY™</Link>
        </div>
        <div className="pl-grid-2">
          {goods.map((g) => (
            <div key={g.id} style={{ border: "1px solid var(--pl-border)", borderRadius: 10, padding: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{g.name}</div>
              <div style={{ fontSize: 12, color: "var(--pl-muted)" }}>
                {g.priceVnd.toLocaleString("vi-VN")}đ {g.inCart ? "· trong giỏ" : "· chưa mua"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          border: "1px solid var(--pl-border)",
          borderRadius: 14,
          padding: 10,
          background: "var(--pl-surface)",
        }}
      >
        <strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>Kho sticker & mã BTC</strong>
        <div className="pl-grid-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
          {loot.map((x) => (
            <div key={x.id} style={{ textAlign: "center" }}>
              {x.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.imageUrl} alt={x.name} width={48} height={48} style={{ width: 48, height: 48, objectFit: "contain" }} />
              ) : (
                <div style={{ height: 48, display: "grid", placeItems: "center", fontSize: 20 }}>{x.kind === "promo" ? "%" : "🎁"}</div>
              )}
              <div style={{ fontSize: 10, lineHeight: 1.25 }}>{x.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export const GiftWalletScreen = memo(GiftWalletScreenInner);
