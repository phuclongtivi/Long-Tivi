"use client";

import BottomNav from "@/components/BottomNav";
import { StickerMallTab } from "./StickerMallTab";

export default function StorePageClient() {
  return (
    <main
      className="pl-page pl-shop pl-inventory-page pl-future-shell"
      style={{
        padding: "12px 12px 104px",
        minHeight: "100vh",
        background: "transparent",
        color: "var(--pl-text)",
      }}
    >
      <StickerMallTab />
      <BottomNav activeHref="/store" />
    </main>
  );
}
