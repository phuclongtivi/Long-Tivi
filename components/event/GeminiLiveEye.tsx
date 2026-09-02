"use client";

import { useEffect, useState } from "react";

/** BTC chạm khung → /api/gemini/frame — key chỉ trên server. */
export function GeminiLiveEye({
  enabled = true,
  onCaption,
}: {
  enabled?: boolean;
  onCaption?: (text: string) => void;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    fetch("/api/gemini/frame")
      .then((r) => r.json())
      .then((d) => setOn(!!d.ok))
      .catch(() => setOn(false));
  }, []);
  if (!enabled) return null;
  return (
    <p style={{ fontSize: 11, opacity: 0.7 }}>
      Gemini nhìn khung · {on ? "server đã có key" : "chưa thấy GEMINI_API_KEY trên server"}
      {onCaption ? "" : ""}
    </p>
  );
}
