"use client";

import { useState } from "react";
import {
  MAX_PRODUCTS_PER_LIVE,
  canAddProductToLive,
  confirmLiveProduct,
  type LiveProductDraft,
  type ListedProduct,
} from "./livestream-product";

type Props = {
  liveSessionId: string;
  creatorId: string;
  creatorRole: "artist" | "journalist";
  existingCount: number;
  onListed: (p: ListedProduct) => void;
};

export function LiveProductForm({
  liveSessionId,
  creatorId,
  creatorRole,
  existingCount,
  onListed,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceVnd, setPriceVnd] = useState("");
  const [stock, setStock] = useState("1");
  const [promoLine1, setPromoLine1] = useState("");
  const [promoLine2, setPromoLine2] = useState("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState("");

  const left = MAX_PRODUCTS_PER_LIVE - existingCount;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!canAddProductToLive(existingCount)) {
      setErr("Phiên này đã đủ 5 sản phẩm.");
      return;
    }
    const draft: LiveProductDraft = {
      name: name.trim(),
      description: description.trim(),
      priceVnd: Number(priceVnd.replace(/\D/g, "")) || 0,
      stock: Number(stock) || 0,
      promoLine1: promoLine1.trim(),
      promoLine2: promoLine2.trim(),
      images: [],
      category: category.trim() || undefined,
    };
    const listed = confirmLiveProduct({
      draft,
      liveSessionId,
      creatorId,
      creatorRole,
      existingCount,
    });
    onListed(listed);
  }

  return (
    <form className="ev-form" onSubmit={submit}>
      <p style={{ fontSize: 13, color: "var(--pl-muted,#C5D0E8)" }}>
        Còn {left}/{MAX_PRODUCTS_PER_LIVE} sản phẩm trong phiên live này.
      </p>
      <label>
        Tên sản phẩm giới thiệu
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Mô tả
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label>
        Danh mục
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <div className="ev-row">
        <label>
          Giá (VND)
          <input inputMode="numeric" required value={priceVnd} onChange={(e) => setPriceVnd(e.target.value)} />
        </label>
        <label>
          Tồn kho
          <input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
        </label>
      </div>
      <label>
        Ưu đãi dòng 1
        <input value={promoLine1} onChange={(e) => setPromoLine1(e.target.value)} />
      </label>
      <label>
        Ưu đãi dòng 2
        <input value={promoLine2} onChange={(e) => setPromoLine2(e.target.value)} />
      </label>
      <button className="ev-publish" type="submit" disabled={left <= 0}>
        Xác nhận niêm yết
      </button>
      {err && <p style={{ color: "#b71c1c", fontSize: 13 }}>{err}</p>}
      <p style={{ fontSize: 12, color: "#666" }}>
        Xác nhận xong: hệ thống tạo mã sản phẩm và đưa lên Phúc Long superBUY™ với mác Đã thực kiểm ★1.
      </p>
    </form>
  );
}
