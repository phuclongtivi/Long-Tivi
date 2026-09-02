"use client";

import { useEffect, useState } from "react";
import { loadStage, type AudienceStage } from "./audience-stage";

/** Ô hình khán giả/khách mời đè một phần màn livestream — kiểu Zoom. */
export function ZoomStageOverlay({ roomId }: { roomId: string }) {
  const [st, setSt] = useState<AudienceStage>(() => loadStage(roomId));

  useEffect(() => {
    setSt(loadStage(roomId));
    const id = setInterval(() => setSt(loadStage(roomId)), 1500);
    return () => clearInterval(id);
  }, [roomId]);

  const tiles = st.seats.filter((s) => s.cameraOn);
  if (!tiles.length) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 8,
        bottom: 88,
        zIndex: 6,
        width: "34%",
      }}
    >
      {tiles.map((s) => (
        <div
          key={s.id}
          style={{
            marginBottom: 6,
            borderRadius: 10,
            overflow: "hidden",
            background: "rgba(29,41,81,.88)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.35)",
          }}
        >
          <div style={{ height: 64, background: "#24315c" }} />
          <div style={{ padding: "4px 6px", fontSize: 11, fontWeight: 700 }}>
            {s.name}
            {s.micOn && st.audienceMicMasterOn ? " · mic" : " · mute"}
          </div>
        </div>
      ))}
    </div>
  );
}
