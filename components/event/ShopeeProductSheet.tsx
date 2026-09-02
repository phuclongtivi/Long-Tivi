"use client";

import { useState, type CSSProperties } from "react";
import type { ProductListing } from "./shop-types";
import { shopOf } from "./sticker-shops";
import { BOSS_BANK, STICKER_PACK_QTY } from "./boss-bank";
import { StickerCarousel } from "./StickerCarousel";

type Props = {
  item: ProductListing;
  onClose: () => void;
  onBuy?: (item: ProductListing) => void;
};

/** Trang chi tiết mặt hàng kiểu Shopee — dùng cho sticker và mọi SKU superBUY. */
export function ShopeeProductSheet({ item, onClose, onBuy }: Props) {
  const shop = shopOf(item);
  const gallery = item.galleryUrls?.length ? item.galleryUrls : item.coverUrl ? [item.coverUrl] : [];
  const [pick, setPick] = useState(0);
  const pack = item.packQty ?? (item.stickerTier ? STICKER_PACK_QTY : 1);
  const price = new Intl.NumberFormat("vi-VN").format(item.priceVnd);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#f5f5f5",
        zIndex: 40,
        overflow: "auto",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "rgba(255,255,255,.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button type="button" onClick={onClose} style={iconBtn}>
          ←
        </button>
        <div style={{ fontWeight: 800, fontSize: 14, flex: 1 }}>Chi tiết sản phẩm</div>
        <button type="button" style={iconBtn}>
          ↗
        </button>
      </header>

      <div style={{ background: "#fff" }}>
        {gallery.length > 1 ? (
          <>
            <StickerCarousel urls={gallery} height={280} intervalMs={1100} />
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                padding: "8px 10px 12px",
              }}
            >
              {gallery.map((u, i) => (
                <button
                  key={u + i}
                  type="button"
                  onClick={() => setPick(i)}
                  style={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    border: i === pick ? "2px solid #ee4d2d" : "1px solid #eee",
                    borderRadius: 8,
                    padding: 2,
                    background: "#fff",
                  }}
                >
                  <img src={u} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <StickerCarousel urls={gallery} height={280} />
        )}
      </div>

      <section style={{ background: "#fff", padding: "12px 14px", marginTop: 8 }}>
        <div style={{ color: "#ee4d2d", fontWeight: 900, fontSize: 22 }}>₫{price}</div>
        <h1 style={{ margin: "6px 0 8px", fontSize: 16, lineHeight: 1.35 }}>{item.name}</h1>
        <div style={{ fontSize: 12, color: "#888" }}>Đã bán 1,2k+ · superBUY™</div>
        {item.promoLine1 && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#ee4d2d", fontWeight: 700 }}>{item.promoLine1}</div>
        )}
        {item.promoLine2 && <div style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>{item.promoLine2}</div>}
      </section>

      <section style={{ background: "#fff", padding: "12px 14px", marginTop: 8, display: "grid", gap: 8 }}>
        <Row k="Gian hàng" v={shop?.name ?? "Phúc Long superBUY™"} />
        <Row k="Số lượng / đơn" v={`${pack} cái (cố định)`} />
        <Row k="Thanh toán mặc định" v="Chuyển khoản QR ngân hàng" />
        <Row k="Vận chuyển" v="Digital — cộng thẳng vào kho sticker" />
      </section>

      {item.stickerTier && (
        <section style={{ background: "#fff", padding: "12px 14px", marginTop: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Xem từng sticker trong gói</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {gallery.map((u, i) => (
              <div key={u + i} style={{ background: "#fafafa", borderRadius: 10, padding: 6, border: "1px solid #eee" }}>
                <img src={u} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "contain" }} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ background: "#fff", padding: "12px 14px", marginTop: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Mô tả sản phẩm</div>
        <p style={{ fontSize: 13, color: "#444", margin: 0, lineHeight: 1.5 }}>
          {item.note1 || "Sản phẩm niêm yết trên Phúc Long superBUY™."}
          {item.note2 ? ` ${item.note2}` : ""}
        </p>
      </section>

      <section style={{ background: "#fff", padding: "12px 14px", marginTop: 8, marginBottom: 88 }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Thanh toán QR Boss</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src={BOSS_BANK.qrImageUrl}
            alt="QR chuyển khoản"
            style={{ width: 120, height: 120, objectFit: "contain", background: "#fff", border: "1px solid #eee" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            <div>
              <b>{BOSS_BANK.accountName}</b>
            </div>
            <div>{BOSS_BANK.bankName}</div>
            <div>STK: {BOSS_BANK.accountNumber}</div>
            <div style={{ color: "#888" }}>{BOSS_BANK.noteHint}</div>
          </div>
        </div>
      </section>

      <footer
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          display: "grid",
          gridTemplateColumns: "56px 56px 1fr 1.2fr",
          background: "#fff",
          borderTop: "1px solid #eee",
          height: 56,
        }}
      >
        <FootIcon label="Chat" />
        <FootIcon label="Giỏ" />
        <button type="button" style={{ ...buyBtn, background: "#ffb562", color: "#7a2e00" }}>
          Thêm giỏ
        </button>
        <button type="button" onClick={() => onBuy?.(item)} style={{ ...buyBtn, background: "#ee4d2d", color: "#fff" }}>
          Mua ngay · ₫{price}
        </button>
      </footer>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 12 }}>
      <span style={{ color: "#888" }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function FootIcon({ label }: { label: string }) {
  return (
    <div style={{ display: "grid", placeItems: "center", fontSize: 11, color: "var(--pl-muted,#C5D0E8)" }}>{label}</div>
  );
}

const iconBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 18,
  border: "none",
  background: "#f2f2f2",
  fontWeight: 800,
};
const buyBtn: CSSProperties = {
  border: "none",
  fontWeight: 800,
  fontSize: 13,
};
