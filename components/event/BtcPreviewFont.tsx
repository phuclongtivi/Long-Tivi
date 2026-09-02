"use client";

import type { BtcPreviewType, CaptionEffect } from "./ai-caption";

const FONTS = [
  { id: "", label: "Mặc định (AI chọn theo chủ đề / tính cách)" },
  { id: 'Inter, system-ui, sans-serif', label: "Inter" },
  { id: 'Georgia, serif', label: "Georgia" },
  { id: '"Trebuchet MS", sans-serif', label: "Trebuchet" },
  { id: 'Consolas, "Courier New", monospace', label: "Notepad" },
];

export function BtcPreviewFont({
  value,
  onChange,
}: {
  value: BtcPreviewType;
  onChange: (v: BtcPreviewType) => void;
}) {
  return (
    <fieldset style={{ border: "1px solid var(--pl-border,#333)", borderRadius: 12, padding: 12 }}>
      <legend style={{ fontWeight: 700, fontSize: 13 }}>Font chữ chạy trên live (preview BTC)</legend>
      <label>
        Font
        <select
          value={value.fontFamily ?? ""}
          onChange={(e) => onChange({ ...value, fontFamily: e.target.value || undefined })}
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.id}>{f.label}</option>
          ))}
        </select>
      </label>
      <label>
        Hiệu ứng mặc định
        <select
          value={value.effect ?? "marquee"}
          onChange={(e) => onChange({ ...value, effect: e.target.value as CaptionEffect })}
        >
          <option value="marquee">Chạy ngang</option>
          <option value="glow">Phát sáng</option>
          <option value="pop">Nảy</option>
          <option value="fade">Mờ dần</option>
          <option value="none">Đứng yên</option>
        </select>
      </label>
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        BTC lệnh: «chạy chữ: ...» · thêm [glow] [pop] [fade] [đứng]. Chỉ BTC/trợ lý được lệnh.
      </p>
    </fieldset>
  );
}
