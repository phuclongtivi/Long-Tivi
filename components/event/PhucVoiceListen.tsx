"use client";

import { useEffect, useRef, useState } from "react";
import type { AiCompanion } from "./ai-companion";
import { canSpeechRecognize, startPhucListen } from "./phuc-speech";
import { requestMic } from "./mic-permission";
import { MicPermissionGate } from "./MicPermissionGate";

type Props = {
  companion: AiCompanion;
  enabled?: boolean;
  onCommand: (text: string) => void;
};

export function PhucVoiceListen({ companion, enabled = true, onCommand }: Props) {
  const [hearing, setHearing] = useState(false);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  const voiceOk =
    companion.voiceListenOn !== false &&
    companion.inputMode === "voice" &&
    companion.voiceSecondsLeft > 0;

  function stop() {
    stopRef.current?.();
    stopRef.current = null;
    setHearing(false);
  }

  async function start() {
    setErr("");
    if (!voiceOk) {
      setErr("Hết hạn giọng — hãy gõ lệnh hoặc gia hạn bằng điểm sticker.");
      return;
    }
    const mic = await requestMic();
    if (!mic.ok) {
      setErr(mic.error || "Chưa cho phép micro.");
      return;
    }
    if (!canSpeechRecognize()) {
      setErr("Thiết bị chưa hỗ trợ nhận giọng. Gõ lệnh giúp.");
      return;
    }
    stop();
    const h = startPhucListen({
      onResult: (r) => {
        setDraft(r.text);
        if (r.final && r.text) onCommand(r.text);
      },
      onError: (m) => setErr(m),
      onEnd: () => setHearing(false),
    });
    if (h) {
      stopRef.current = h.stop;
      setHearing(true);
    }
  }

  useEffect(() => () => stop(), []);

  if (!enabled) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
      <MicPermissionGate />
      <button
        type="button"
        onClick={hearing ? stop : start}
        disabled={!voiceOk}
        style={{
          height: 36,
          border: "none",
          borderRadius: 999,
          background: hearing ? "#E11D48" : voiceOk ? "#333" : "#555",
          color: "#fff",
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        {hearing ? "Đang nghe…" : voiceOk ? `Nói với ${companion.name}` : "Chỉ gõ phím"}
      </button>
      {draft && <span style={{ fontSize: 11, color: "#ddd" }}>{draft}</span>}
      {err && <span style={{ fontSize: 11, color: "#f99" }}>{err}</span>}
    </div>
  );
}
