"use client";

import { useEffect, useState } from "react";
import type { AiCompanion } from "./ai-companion";
import { DEFAULT_COMPANION } from "./ai-companion";
import { livePreviewScript, speakPreviewGreeting, PREVIEW_VOICE_VOLUME } from "./phuc-greeting";
import { AiIdlePresence } from "./AiIdlePresence";
import { MicPermissionGate } from "./MicPermissionGate";
import { PhucVoiceListen } from "./PhucVoiceListen";

type Props = {
  userName: string;
  companion?: AiCompanion;
  onVolume?: (v: number) => void;
};

export function LivePreviewGreeting({
  userName,
  companion = { ...DEFAULT_COMPANION, volume: PREVIEW_VOICE_VOLUME },
  onVolume,
}: Props) {
  const [ai, setAi] = useState<AiCompanion>({
    ...companion,
    volume: companion.volume || PREVIEW_VOICE_VOLUME,
  });

  useEffect(() => {
    const u = speakPreviewGreeting(ai, userName);
    return () => {
      u?.voice;
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // chào một lần khi vào preview
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "relative", minHeight: 220 }}>
      <p style={{ fontSize: 13, color: "#eee", padding: "12px 16px 80px", lineHeight: 1.45 }}>
        {livePreviewScript(userName, ai.name)}
      </p>
      <div style={{ padding: "0 12px 8px" }}>
        <MicPermissionGate />
        <PhucVoiceListen companion={ai} onCommand={() => undefined} />
      </div>
      <AiIdlePresence
        companion={ai}
        onVolume={(v) => {
          setAi((c) => ({ ...c, volume: v }));
          onVolume?.(v);
        }}
      />
    </div>
  );
}
