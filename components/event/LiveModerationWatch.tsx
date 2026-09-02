"use client";

import { useEffect } from "react";
import { CLOSE_GRACE_MS, upsertCase, type ModVerdict } from "./live-moderation";
import { loadRoomRules } from "./room-rules";

/** Gắn trên màn BTC: định kỳ gửi mô tả khung cho AI admin. */
export function LiveModerationWatch({
  roomId,
  organizerName,
  captionForFrame,
  evidenceUrl,
  intervalMs = 45000,
}: {
  roomId: string;
  organizerName?: string;
  captionForFrame?: string;
  evidenceUrl?: string;
  intervalMs?: number;
}) {
  useEffect(() => {
    let stop = false;
    async function scan() {
      if (stop) return;
      const rules = loadRoomRules().rules;
      try {
        const r = await fetch("/api/live/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            organizerName,
            rules,
            caption: captionForFrame || "",
            evidenceUrl,
          }),
        });
        const d = await r.json();
        const v = d.verdict as ModVerdict | undefined;
        if (v && v.violate) {
          const now = Date.now();
          const grace = v.severity === "closeNow" ? 0 : CLOSE_GRACE_MS;
          upsertCase({
            roomId,
            organizerName,
            verdict: v,
            evidenceUrl,
            requestedAt: new Date(now).toISOString(),
            deadlineAt: new Date(now + grace).toISOString(),
          });
        }
      } catch {
        /* offline */
      }
    }
    void scan();
    const id = setInterval(scan, intervalMs);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [roomId, organizerName, captionForFrame, evidenceUrl, intervalMs]);

  return null;
}
