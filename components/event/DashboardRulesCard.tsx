"use client";

import { useEffect, useState } from "react";
import { DEFAULT_ROOM_RULES, loadRoomRules, saveRoomRules } from "./room-rules";

export function DashboardRulesCard() {
  const [text, setText] = useState(DEFAULT_ROOM_RULES.join("\n"));
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setText(loadRoomRules().rules.join("\n"));
  }, []);

  return (
    <section
      style={{
        background: "transparent",
        border: "1px solid var(--pl-border)",
        borderRadius: 14,
        padding: 12,
        color: "var(--pl-text)",
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Nội quy phòng live</h3>
      <p style={{ fontSize: 12, opacity: 0.75, marginTop: 0 }}>
        AI admin (DeepSeek) đối chiếu video/ảnh trong phòng với bản nội quy này. Mỗi dòng một điều.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        style={{
          width: "100%",
          fontSize: 14,
          lineHeight: 1.4,
          color: "inherit",
          background: "transparent",
          border: "1px solid var(--pl-border)",
          borderRadius: 10,
          padding: 8,
        }}
      />
      <button
        type="button"
        onClick={() => {
          const rules = text
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          saveRoomRules({ rules });
          setSaved("Đã gắn nội quy trên Dashboard.");
        }}
        style={{
          marginTop: 8,
          height: 40,
          border: "none",
          borderRadius: 10,
          background: "#E11D48",
          color: "#fff",
          fontWeight: 800,
          padding: "0 14px",
        }}
      >
        Lưu nội quy
      </button>
      {saved ? <span style={{ marginLeft: 8, fontSize: 12 }}>{saved}</span> : null}
    </section>
  );
}
