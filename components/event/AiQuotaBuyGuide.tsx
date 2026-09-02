"use client";

import { StickerBuyReturn } from "./StickerBuyReturn";

/** Hết hạn mức AI → hướng dẫn mua sticker + điểm, không còn gói chatbot. */
export function AiQuotaBuyGuide({
  aiName = "Phúc",
  onBack,
}: {
  aiName?: string;
  onBack: () => void;
}) {
  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Hết hạn mức {aiName}</h3>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>
        Bạn đã dùng hết giới hạn trợ lý. Mua <b>sticker + điểm</b> trên superBUY™ để dùng tiếp.
        Không còn gói dịch vụ chatbot theo ngày.
      </p>
      <p style={{ fontSize: 12, color: "#666" }}>
        Bảng trừ điểm / số lượt sẽ cập nhật khi có quy tắc chi tiêu.
      </p>
      <StickerBuyReturn username="user" returnToCreate={onBack} />
    </div>
  );
}
