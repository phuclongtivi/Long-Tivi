"use client";

import { useEffect, useState } from "react";
import type { AiCompanion } from "./ai-companion";
import { spawnCompanionOnCccd } from "./ai-companion";
import { LivePreviewGreeting } from "./LivePreviewGreeting";

/** Sau khi user xong CCCD: sinh mã + ngày sinh, hiện trợ lý và đọc lời chào preview. */
export function CccdAwakenAi({
  userName,
  justCompleted,
  companion,
  onSpawn,
}: {
  userName: string;
  justCompleted: boolean;
  companion?: AiCompanion | null;
  onSpawn: (ai: AiCompanion) => void;
}) {
  const [ai, setAi] = useState<AiCompanion | null>(companion ?? null);

  useEffect(() => {
    if (!justCompleted) return;
    if (companion?.code && companion.birthDate) {
      setAi(companion);
      return;
    }
    const born = spawnCompanionOnCccd();
    setAi(born);
    onSpawn(born);
  }, [justCompleted]);

  if (!justCompleted || !ai) return null;

  return (
    <div style={{ background: "#1a1210", color: "#fff", borderRadius: 16, padding: 12, margin: "12px 0" }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        Mã {ai.code} · Sinh {ai.birthDate} · {ai.gender === "female" ? "Nữ" : ai.gender === "male" ? "Nam" : "Trung tính"}
      </div>
      <LivePreviewGreeting userName={userName} companion={ai} />
    </div>
  );
}
