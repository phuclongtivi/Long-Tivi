"use client";

import { useEffect, useState } from "react";
import {
  CLOSE_GRACE_MS,
  markClosed,
  openCaseForRoom,
  remainMs,
  type ModCase,
} from "./live-moderation";

export function CloseCountdownBanner({
  roomId,
  canClose,
  onForceClose,
}: {
  roomId: string;
  canClose?: boolean;
  onForceClose?: () => void;
}) {
  const [c, setC] = useState<ModCase | undefined>();
  const [left, setLeft] = useState(0);

  useEffect(() => {
    function tick() {
      const cur = openCaseForRoom(roomId);
      setC(cur);
      if (!cur) {
        setLeft(0);
        return;
      }
      const ms = remainMs(cur);
      setLeft(ms);
      if (ms <= 0 && !cur.closedAt) {
        markClosed(roomId, "ai-boss");
        void fetch("/api/live/moderate/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, by: "ai-boss", case: cur }),
        });
        onForceClose?.();
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [roomId, onForceClose]);

  if (!c || c.closedAt) return null;

  const sec = Math.max(0, Math.floor(left / 1000));
  const mm = Math.floor(sec / 60);
  const ss = String(sec % 60).padStart(2, "0");
  const total = CLOSE_GRACE_MS / 1000;
  const pct = Math.max(0, Math.min(100, (sec / total) * 100));

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        right: 8,
        zIndex: 80,
        background: "#E11D48",
        color: "#fff",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 14 }}>
        AI admin yêu cầu đóng phiên — còn {mm}:{ss}
      </div>
      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.95 }}>{c.verdict.reason}</div>
      <div style={{ height: 4, background: "rgba(255,255,255,.35)", marginTop: 8, borderRadius: 99 }}>
        <div style={{ width: pct + "%", height: "100%", background: "#fff", borderRadius: 99 }} />
      </div>
      {canClose ? (
        <button
          type="button"
          onClick={() => {
            markClosed(roomId, "user");
            void fetch("/api/live/moderate/close", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomId, by: "user", case: c }),
            });
            onForceClose?.();
          }}
          style={{
            marginTop: 8,
            height: 36,
            border: "none",
            borderRadius: 999,
            background: "#fff",
            color: "#E11D48",
            fontWeight: 800,
            padding: "0 14px",
          }}
        >
          Đóng phòng ngay
        </button>
      ) : (
        <div style={{ fontSize: 11, marginTop: 6 }}>
          Nếu BTC không đóng, AI dùng quyền Boss đóng bắt buộc.
        </div>
      )}
    </div>
  );
}
