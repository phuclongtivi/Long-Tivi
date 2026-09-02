"use client";

const OPS = [
  ["LIVE", "Phòng live, report, AI moderation"],
  ["Home/Event", "Duyệt, ghim, phân phối thông báo"],
  ["superBUY", "Gian hàng, kho hàng, ticker, quà"],
  ["AI User", "Policy, skill, quyền, action log"],
  ["longTV", "QR pairing, TV Display Mode, 720p"],
  ["AR/VR/MR", "Entry point, roadmap XR panel"],
] as const;

const BOSS_POLICIES = [
  "AI user mức 2: chuẩn bị nội dung và chờ xác nhận",
  "720p mặc định, 1080p là tuỳ chọn",
  "QR code là luồng kết nối Tivi chính",
  "Không đọc bộ nhớ riêng tư user nếu thiếu quyền/log",
];

const THEME_UNLOCKS = [
  ["Mặc định", "Long Aqua Glass", "Đang bật cho tất cả user"],
  ["Rực Rỡ", "Long Red Glass X", "Khoá, Boss tick để user được thay áo"],
  ["Hồng Aura", "Long Pink Aura", "Khoá, Boss tick để mở cho event/fan room"],
] as const;

export default function BossCommandCenter() {
  return (
    <section className="pl-boss-console">
      <div className="pl-section-head">
        <div>
          <span className="pl-future-kicker">Boss access · Security optional</span>
          <h3>Boss Menu điều hành</h3>
        </div>
        <span className="pl-status-pill">2FA off by default</span>
      </div>

      <div className="pl-boss-login-note">
        Boss đăng nhập bằng luồng riêng. Google Authenticator/TOTP mặc định tắt;
        chỉ yêu cầu từ lần đăng nhập sau khi Boss bật và hoàn tất wizard bảo mật.
      </div>

      <div className="pl-agent-skill-row">
        {OPS.map(([title, desc]) => (
          <article key={title} className="pl-mini-tile">
            <strong>{title}</strong>
            <span>{desc}</span>
          </article>
        ))}
      </div>

      <div className="pl-agent-columns">
        <div>
          <h4>Boss AI</h4>
          <p>
            Boss AI điều phối policy chung, chỉ đạo AI user theo chiến dịch/sự kiện
            khi Boss xác nhận, có log và lịch sử phiên bản.
          </p>
        </div>
        <div>
          <h4>Policy đang chốt</h4>
          <ul>
            {BOSS_POLICIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pl-agent-columns pl-theme-manager">
        <div>
          <h4>Giao diện · Mở thêm chủ đề</h4>
          <p>
            User luôn có theme mặc định. Boss tick thêm chủ đề nào thì user mới
            thấy chủ đề đó trong phần thay áo.
          </p>
        </div>
        <div className="pl-theme-unlock-list">
          {THEME_UNLOCKS.map(([label, token, note], index) => (
            <label key={token} className="pl-theme-unlock-row">
              <input type="checkbox" checked={index === 0} readOnly />
              <span>
                <strong>{label}</strong>
                <small>{token} · {note}</small>
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
