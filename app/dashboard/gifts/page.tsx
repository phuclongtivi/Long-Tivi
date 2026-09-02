"use client";

import Link from "next/link";
import GiftInventoryPanel from "@/components/GiftInventoryPanel";

export default function DashboardGiftsPage() {
  return (
    <div
      className="min-h-screen p-4 max-w-md mx-auto"
      style={{ background: "transparent", color: "var(--pl-text)", fontFamily: "var(--font-x)" }}
    >
      <div>
        <Link href="/dashboard" className="text-sm font-medium" style={{ color: "inherit" }}>
          ← Dashboard
        </Link>
        <span className="text-xs" style={{ opacity: 0.55, marginLeft: 8 }}>
          Kho quà
        </span>
      </div>

      <h1 className="text-lg font-bold" style={{ marginTop: 8 }}>
        Kho quà & Tặng quà
      </h1>
      <p className="text-xs leading-relaxed" style={{ opacity: 0.7 }}>
        Quản lý sản phẩm / tiền mặt trong kho. Khi tặng tiền mặt, app mở ngân hàng với STK người
        nhận đã lưu trên Phúc Long Center.
      </p>

      <div
        style={{
          marginTop: 12,
          background: "transparent",
          border: "2px solid var(--pl-frame)",
          boxShadow: "0 0 0 1px rgba(29,41,81,.2)",
          borderRadius: 14,
          padding: 4,
        }}
      >
        <GiftInventoryPanel />
      </div>
    </div>
  );
}
