"use client";

import type { AiCompanion } from "./ai-companion";
import { AiMascot } from "./AiMascot";

/** Mascot AI gọn, không kèm volume vì âm thanh đã điều khiển trong bàn Mixer. */
export function AiIdlePresence({
  companion,
  corner = "left",
}: {
  companion: AiCompanion;
  corner?: "right" | "left";
  onVolume?: (v: number) => void;
}) {
  const side = corner === "right" ? { right: 8 } : { left: 8 };
  const full = companion.idleShape === "mascot" || companion.idleShape === "orb";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 14,
        ...side,
        zIndex: 6,
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        pointerEvents: "none",
      }}
    >
      {full ? <AiMascot kind="full" size={72} /> : <AiMascot kind="round" size={44} />}
      <div style={{ pointerEvents: "none" }}>
        {!companion.commandMode && companion.idleShape !== "corner-pin" ? (
          <div
            style={{
              border: "1px solid rgba(37,99,235,.18)",
              borderRadius: 999,
              padding: "3px 8px",
              background: "rgba(255,255,255,.86)",
              color: "var(--pl-text,#10172a)",
              fontSize: 10,
              fontWeight: 900,
              boxShadow: "0 8px 18px rgba(37,99,235,.12)",
            }}
          >
            {companion.name}
          </div>
        ) : null}
      </div>
    </div>
  );
}
