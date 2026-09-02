"use client";

import { useMemo, useState } from "react";

const AGENT_SKILLS = [
  ["Live", "Tiêu đề, kịch bản, mixer, tạo phòng"],
  ["Chat", "Tóm tắt room, gợi ý trả lời, tạo room"],
  ["superBUY", "Gợi ý sản phẩm, giỏ hàng, sticker/ticker"],
  ["Thông báo", "Soạn thông báo, preview, lịch nhắc"],
  ["TV/AR", "Đưa nội dung ra Tivi, chuẩn bị panel XR"],
] as const;

const PERMISSION_LEVELS = [
  "Cấp 1: chỉ gợi ý",
  "Cấp 2: chuẩn bị nội dung, user xác nhận",
  "Cấp 3: thao tác trong app có giới hạn",
  "Cấp 4: ngoài app, cần cấp quyền riêng",
] as const;

export default function PersonalAgentPanel() {
  const [name, setName] = useState("Long AI");
  const [tone, setTone] = useState("Tinh tế, nhanh, hỗ trợ bán/live");
  const [proactive, setProactive] = useState("Vừa phải");
  const [level, setLevel] = useState(PERMISSION_LEVELS[1]);
  const [memory, setMemory] = useState([
    "Mixer gần nhất",
    "Sự kiện đang chuẩn bị",
    "Gian hàng và vật phẩm hay dùng",
  ]);

  const actionLog = useMemo(
    () => [
      "Chuẩn bị nháp thông báo live khi user yêu cầu",
      "Gợi ý dùng 720p mặc định cho TV Display Mode",
      "Chờ xác nhận trước khi gửi thông báo/sửa gian hàng",
    ],
    []
  );

  return (
    <section className="pl-agent-card">
      <div className="pl-section-head">
        <div>
          <span className="pl-future-kicker">Personal Agent · level 2</span>
          <h3>AI của tôi</h3>
        </div>
        <span className="pl-status-pill">Trong app 1986</span>
      </div>

      <div className="pl-agent-grid">
        <label>
          Tên AI
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Tính cách
          <input value={tone} onChange={(e) => setTone(e.target.value)} />
        </label>
        <label>
          Mức chủ động
          <select value={proactive} onChange={(e) => setProactive(e.target.value)}>
            <option>Nhẹ</option>
            <option>Vừa phải</option>
            <option>Chủ động cao</option>
          </select>
        </label>
        <label>
          Quyền hiện tại
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {PERMISSION_LEVELS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="pl-agent-skill-row">
        {AGENT_SKILLS.map(([title, desc]) => (
          <article key={title} className="pl-mini-tile">
            <strong>{title}</strong>
            <span>{desc}</span>
          </article>
        ))}
      </div>

      <div className="pl-agent-columns">
        <div>
          <h4>Bộ nhớ được phép dùng</h4>
          {memory.map((item) => (
            <button
              key={item}
              type="button"
              className="pl-memory-chip"
              onClick={() => setMemory((list) => list.filter((m) => m !== item))}
            >
              {item} ×
            </button>
          ))}
        </div>
        <div>
          <h4>Action log</h4>
          <ul>
            {actionLog.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
