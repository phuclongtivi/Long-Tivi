"use client";

import Image from "next/image";

const STUDIO_APPS = [
  ["Long FlashFlow Studio", "Tạo video flash nhẹ, lớp ảnh sống, story sự kiện và màn chờ Tivi."],
  ["Long QRFlow Center", "QR cho user, AI, live topic, sản phẩm, lượt tải và follow."],
  ["Long AI Flash Console", "Điều phối chất lượng phát, recipe runtime và tối ưu hiển thị."],
  ["Long Commerce AI Desk", "Hỗ trợ người bán đối chiếu bill, sticker, kho và đơn hàng theo rule."],
  ["Long Media Worker", "Nén video, thumbnail, resize ảnh và chuẩn hóa media đầu ra."],
  ["Long AI Gateway", "Một nút kết nối AI user sang nền tảng khác theo quyền đã cấp."],
  ["Long Real Presence Lab", "Lab kiểm soát cho Real Presence Level 2 và 1986 - human."],
] as const;

const IOS_OUTPUTS = [
  "Onboarding ngôn ngữ, username, email và đăng nhập nhanh",
  "Touch-first safe area, không horizontal scroll, full-bleed mobile",
  "Face ID/biometric là ưu tiên, social login đứng trước phương thức khác",
  "2FA mặc định tắt, user/Boss tự bật bằng wizard",
  "Device Assist opt-in, không chạy nền lén, tự giảm khi máy nóng/pin yếu",
  "AI dùng từ ngữ hỗ trợ/đề xuất/cần xác nhận, không tự quyết giao dịch nhạy cảm",
] as const;

const HUMAN_TRAITS = [
  "QR DNA seed",
  "Owner history",
  "Persona memory",
  "Visual style",
  "Permission scope",
  "Revocation path",
  "Consent trace",
  "Risk log",
] as const;

export default function LongStudioApps() {
  return (
    <section className="pl-studio-apps">
      <div className="pl-section-head">
        <div>
          <span className="pl-future-kicker">Long Studio · 1986 - human</span>
          <h3>Công nghệ lõi và mốc AI tạo sinh v0.1</h3>
        </div>
        <span className="pl-status-pill">FlashFlow Living Skin</span>
      </div>

      <div className="pl-studio-hero">
        <div>
          <h4>FlashFlow Image Operating System</h4>
          <p>
            Hệ điều hành hình ảnh runtime: nhận tín hiệu từ các AI, tạo recipe nâng cấp,
            điều phối lớp ảnh, màu, ánh sáng, QR trace và chất lượng phát trong ranh giới
            store-ready.
          </p>
        </div>
        <Image
          src="/long-lab/qr-growth-ai-v01.svg"
          alt="QR-Growth Generative AI v0.1"
          width={168}
          height={168}
          priority
        />
      </div>

      <div className="pl-studio-grid">
        {STUDIO_APPS.map(([name, summary]) => (
          <article className="pl-studio-card" key={name}>
            <strong>{name}</strong>
            <span>{summary}</span>
          </article>
        ))}
      </div>

      <div className="pl-agent-columns pl-store-policy">
        <div>
          <h4>Chuẩn iOS/store-ready</h4>
          <ul>
            {IOS_OUTPUTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Đặc điểm người thật cho QR-Growth AI</h4>
          <div className="pl-human-chip-grid">
            {HUMAN_TRAITS.map((trait) => (
              <span key={trait}>{trait}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
