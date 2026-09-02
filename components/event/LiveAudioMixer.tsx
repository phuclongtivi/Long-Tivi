"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LIVE_SOURCES,
  detectProvider,
  embedUrl,
  gainOf,
  patchSource,
  type LiveAudioSource,
  type LiveAudioSourceId,
} from "./live-audio-sources";

import { AudienceStageDesk } from "./AudienceStageDesk";

type Props = {
  sources?: LiveAudioSource[];
  onChange?: (list: LiveAudioSource[]) => void;
  assistantMayPlay?: boolean;
  onAssistantMayPlay?: (on: boolean) => void;
  onMixReady?: () => void;
  roomId?: string;
};

export function LiveAudioMixer({
  sources = DEFAULT_LIVE_SOURCES,
  onChange,
  assistantMayPlay = true,
  onAssistantMayPlay,
  onMixReady,
  roomId = "desk",
}: Props) {
  const [list, setList] = useState(sources);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [embed, setEmbed] = useState<string | null>(null);

  useEffect(() => setList(sources), [sources]);

  useEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((all) => setMics(all.filter((d) => d.kind === "audioinput")))
      .catch(() => undefined);
  }, []);

  function set(id: LiveAudioSourceId, patch: Partial<LiveAudioSource>) {
    const next = patchSource(list, id, patch);
    setList(next);
    onChange?.(next);
  }

  return (
    <section
      className="pl-mixer-panel"
      style={{
        color: "var(--pl-text)",
        padding: 12,
      }}
    >
      <div className="pl-future-kicker" style={{ marginBottom: 8 }}>Bàn Mixer</div>
      <h3 style={{ margin: "0 0 10px", fontSize: 18, letterSpacing: "-0.025em" }}>Nguồn âm livestream</h3>
      {list.map((s) => (
        <div key={s.id} className="pl-mixer-row">
          <label style={{ display: "flex", alignItems: "center", minWidth: 168, fontSize: 12, marginRight: 8 }}>
            <input
              type="checkbox"
              checked={s.enabled}
              onChange={(e) => set(s.id, { enabled: e.target.checked })}
            />
            {s.label}
          </label>
          <button
            type="button"
            className="pl-mixer-chip"
            onClick={() => set(s.id, { muted: !s.muted })}
            style={{
              width: 44,
              height: 28,
              border: "none",
              borderRadius: 8,
              background: s.muted || !s.enabled ? "rgba(100,112,138,.72)" : "linear-gradient(135deg,#22d3ee,#2563eb)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              marginRight: 8,
            }}
          >
            {s.muted || !s.enabled ? "Mute" : "On"}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(gainOf(s) * 100)}
            disabled={!s.enabled}
            onChange={(e) => set(s.id, { volume: Number(e.target.value) / 100, muted: false })}
            style={{ flex: 1, accentColor: "#E11D48" }}
          />
        </div>
      ))}

      <label style={{ display: "block", fontSize: 12, marginTop: 6 }}>
        Chọn micro
        <select
          value={list.find((s) => s.id === "mic")?.deviceId || ""}
          onChange={(e) => set("mic", { deviceId: e.target.value, enabled: true })}
          style={{ width: "100%", marginTop: 4, color: "inherit", background: "transparent" }}
        >
          <option value="">Mặc định hệ thống</option>
          {mics.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || d.deviceId.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      <p style={{ fontSize: 11, margin: "4px 0 0", opacity: 0.75, lineHeight: 1.35 }}>
        Micro không dây / Bluetooth: ghép (gắn) trên máy trước khi mở bàn mix. App không tự quét Bluetooth.
      </p>

      <label style={{ display: "block", fontSize: 12, marginTop: 8 }}>
        Micro và Thiết bị cầm tay (khe 4)
        <select
          value={list.find((s) => s.id === "handheld")?.deviceId || ""}
          onChange={(e) => set("handheld", { deviceId: e.target.value, enabled: true })}
          style={{ width: "100%", marginTop: 4, color: "inherit", background: "transparent" }}
        >
          <option value="">Chưa chọn nguồn cầm tay</option>
          {mics.map((d) => (
            <option key={"h-" + d.deviceId} value={d.deviceId}>
              {d.label || d.deviceId.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      <p style={{ fontSize: 11, margin: "4px 0 0", opacity: 0.75, lineHeight: 1.35 }}>
        Cắm USB / Lightning hoặc bật Bluetooth trên máy trước khi mở bàn mix, rồi chọn lại nguồn ở đây.
      </p>

      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          className="ev-publish"
          style={{ height: 36, marginRight: 8, marginBottom: 8 }}
          onClick={async () => {
            try {
              await (navigator.mediaDevices as any).getDisplayMedia?.({ audio: true, video: false });
              set("device", { enabled: true });
            } catch {
              set("device", { enabled: true });
            }
          }}
        >
          Lấy tiếng máy / tab
        </button>
        <button
          type="button"
          className="ev-publish"
          style={{ height: 36, marginBottom: 8 }}
          onClick={() => fileRef.current?.click()}
        >
          Chọn file audio
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
            audioRef.current.volume = list.find((s) => s.id === "file")?.volume ?? 0.8;
            void audioRef.current.play();
            set("file", { enabled: true });
          }}
        />
      </div>
      <audio ref={audioRef} controls style={{ width: "100%", marginTop: 8 }} />

      <label style={{ display: "block", fontSize: 12, marginTop: 12 }}>
        Link phát trực tiếp (YouTube / Zing MP3 / SoundCloud)
        <input
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          placeholder="https://..."
          style={{ width: "100%", marginTop: 4 }}
        />
      </label>
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          className="ev-publish"
          style={{ height: 36, marginRight: 8, marginBottom: 8 }}
          onClick={() => {
            const p = detectProvider(streamUrl);
            const em = embedUrl(streamUrl);
            setEmbed(em);
            if (p === "youtube" || p === "zing" || p === "soundcloud") {
              set(p, { enabled: true, url: streamUrl });
            }
          }}
        >
          Phát link
        </button>
        <button
          type="button"
          className="ev-publish"
          style={{ height: 36, marginBottom: 8 }}
          onClick={async () => {
            try {
              await (navigator.mediaDevices as any).getDisplayMedia?.({ audio: true, video: true });
            } catch { /* user cancel */ }
          }}
        >
          Chia sẻ tab có tiếng
        </button>
      </div>
      <label style={{ display: "flex", alignItems: "center", fontSize: 12, marginTop: 10 }}>
        <input
          type="checkbox"
          checked={assistantMayPlay}
          onChange={(e) => onAssistantMayPlay?.(e.target.checked)}
        />
        Trợ lý phát nhạc miễn phí khi BTC yêu cầu — khách mời và khán giả không lệnh AI
      </label>
      <p style={{ fontSize: 11, opacity: 0.7 }}>
        YouTube/SoundCloud phát trong khung nhúng. Để tiếng vào phòng live: bấm «Chia sẻ tab có tiếng».
        Zing: mở link rồi chia sẻ tab Zing.
      </p>
      {embed && (
        <iframe
          title="stream"
          src={embed}
          allow="autoplay; encrypted-media"
          style={{ width: "100%", height: 140, border: 0, marginTop: 8, borderRadius: 8 }}
        />
      )}
      <button
        type="button"
        onClick={() => onMixReady?.()}
        style={{
          marginTop: 12,
          width: "100%",
          minHeight: 48,
          border: "none",
          borderRadius: 14,
          background: "linear-gradient(180deg,#FF6B8A,#E11D48)",
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
        }}
      >
        Phát LIVE
      </button>
      <AudienceStageDesk roomId={roomId} />
    </section>
  );
}
