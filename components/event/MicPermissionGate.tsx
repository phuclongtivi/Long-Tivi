"use client";

import { useEffect, useState } from "react";
import { micHint, queryMicPerm, requestMic, type MicPerm } from "./mic-permission";

/** Tự đề xuất xin micro khi vào preview / live / nhận giọng. */
export function MicPermissionGate({
  auto = true,
  onGranted,
}: {
  auto?: boolean;
  onGranted?: () => void;
}) {
  const [perm, setPerm] = useState<MicPerm>("prompt");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      const now = await queryMicPerm();
      if (!live) return;
      setPerm(now);
      if (now === "granted") {
        onGranted?.();
        return;
      }
      if (auto && now !== "denied" && now !== "unsupported") {
        const r = await requestMic();
        if (!live) return;
        setPerm(r.perm);
        setMsg(r.error || "");
        if (r.ok) onGranted?.();
      } else if (now === "denied" || now === "unsupported") {
        setMsg(micHint() || "Thiết bị không hỗ trợ micro.");
      }
    })();
    return () => {
      live = false;
    };
  }, [auto]);

  if (perm === "granted") return null;

  return (
    <div
      style={{
        background: "#FFF7ED",
        border: "1px solid #E4D5C2",
        borderRadius: 12,
        padding: 10,
        fontSize: 12,
        color: "#333",
      }}
    >
      <b>Cần quyền micro</b> để {`nói với trợ lý và lên tiếng live.`}
      <p style={{ margin: "6px 0" }}>{msg || micHint()}</p>
      <button
        type="button"
        className="ev-publish"
        style={{ height: 36 }}
        onClick={async () => {
          const r = await requestMic();
          setPerm(r.perm);
          setMsg(r.error || "");
          if (r.ok) onGranted?.();
        }}
      >
        Cho phép micro
      </button>
    </div>
  );
}
