"use client";

import { useState } from "react";

export default function DeviceConnectPanel() {
  const [quality, setQuality] = useState("720p");

  return (
    <section className="pl-device-panel">
      <div className="pl-section-head">
        <div>
          <span className="pl-future-kicker">Thiết bị & hiển thị</span>
          <h3>Kết nối Tivi / AR / VR / MR</h3>
        </div>
        <span className="pl-status-pill">{quality} mặc định</span>
      </div>

      <div className="pl-device-actions">
        <article>
          <strong>Cài app longTV</strong>
          <span>Google TV/Android TV · logo long.live TV giữ mascot</span>
        </article>
        <article>
          <strong>Quét QR trên Tivi</strong>
          <span>Luồng chính: Tivi hiện QR, điện thoại remote</span>
        </article>
        <article>
          <strong>Web TV Mode</strong>
          <span>Dự phòng qua 1986.tv/connect khi TV chưa cài app</span>
        </article>
        <article>
          <strong>AR/VR/MR</strong>
          <span>Entry cạnh nút Tivi, chuẩn bị floating panel XR</span>
        </article>
      </div>

      <label className="pl-quality-switch">
        Chất lượng đầu ra
        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option>720p</option>
          <option>1080p</option>
        </select>
      </label>
      <p className="pl-muted">
        720p là mặc định để tiết kiệm chi phí vận hành. 1080p có sẵn như lựa chọn,
        chưa bật mặc định.
      </p>
    </section>
  );
}
