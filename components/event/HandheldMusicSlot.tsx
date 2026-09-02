"use client";

import { useEffect, useRef, useState } from "react";

/** Khe 4 — phát nhạc từ USB / iPod / iPhone khác vào phòng live. */
export function HandheldMusicSlot({
  onReady,
}: {
  onReady?: (on: boolean) => void;
}) {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [dev, setDev] = useState("");
  const [msg, setMsg] = useState("Cắm máy rồi bấm Quét thiết bị.");
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function scan() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const all = await navigator.mediaDevices.enumerateDevices();
      const mics = all.filter((d) => d.kind === "audioinput");
      setInputs(mics);
      setMsg(mics.length ? `Tìm thấy ${mics.length} nguồn audio.` : "Chưa thấy USB/iPhone. Cắm adapter rồi Quét lại.");
    } catch {
      setMsg("Cần quyền micro để nhận USB / Lightning / Bluetooth.");
    }
  }

  async function useLine() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: dev ? { deviceId: { exact: dev } } : true,
      });
      streamRef.current = stream;
      onReady?.(true);
      setMsg("Đang lấy tiếng từ thiết bị cầm tay vào mixer phòng.");
    } catch {
      setMsg("Không mở được nguồn này.");
    }
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return (
    <div style={{ marginTop: 8, fontSize: 13 }}>
      <p style={{ margin: "0 0 8px", color: "var(--pl-muted,#C5D0E8)" }}>
        USB nhạc, iPod, iPhone khác: cắm cổng / adapter (USB-C, Lightning, jack) — máy hiện thành nguồn audio.
        USB chứa file: chọn file bên dưới (máy tính / tablet).
      </p>
      <button type="button" className="pl-btn" onClick={scan} style={{ marginRight: 8 }}>
        Quét thiết bị
      </button>
      <select value={dev} onChange={(e) => setDev(e.target.value)} style={{ minWidth: 160, marginRight: 8 }}>
        <option value="">Nguồn mặc định</option>
        {inputs.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || "Audio " + d.deviceId.slice(0, 6)}
          </option>
        ))}
      </select>
      <button type="button" className="pl-btn pl-btn-cta" onClick={useLine}>
        Phát vào phòng
      </button>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="pl-btn" onClick={() => fileRef.current?.click()}>
          File trên USB
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f || !audioRef.current) return;
            audioRef.current.src = URL.createObjectURL(f);
            void audioRef.current.play();
            onReady?.(true);
            setMsg("Đang phát file: " + f.name);
          }}
        />
      </div>
      <audio ref={audioRef} controls style={{ width: "100%", marginTop: 8 }} />
      <p style={{ fontSize: 12, margin: "6px 0 0" }}>{msg}</p>
    </div>
  );
}
