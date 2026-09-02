"use client";

import { useEffect, useRef, useState } from "react";

type Role = "host" | "viewer";

export function LiveKitStage({
  room,
  identity,
  role,
  height = "100%",
}: {
  room: string;
  identity?: string;
  role: Role;
  height?: string | number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [msg, setMsg] = useState("Đang kết nối phòng…");

  useEffect(() => {
    let stop = false;
    let roomObj: { disconnect?: () => void } | null = null;
    let local: { stop?: () => void } | null = null;

    (async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room,
            identity: identity || (role === "host" ? "btc" : "viewer"),
            role,
          }),
        });
        const data = await res.json();
        if (!data.ok) {
          setMsg(data.error || "Chưa gắn key LiveKit trên server.");
          return;
        }

        const lk = await import("livekit-client").catch(() => null);
        if (!lk) {
          setMsg("Chạy: npm i livekit-client  — rồi reload.");
          return;
        }

        const Room = lk.Room;
        const Track = lk.Track;
        const r = new Room({ adaptiveStream: true, dynacast: true });
        roomObj = r;
        r.on(lk.RoomEvent.TrackSubscribed, (track: { kind: string; attach: (el: HTMLMediaElement) => void }) => {
          if (track.kind === Track.Kind.Video && videoRef.current) track.attach(videoRef.current);
        });
        await r.connect(data.url, data.token);
        if (stop) {
          r.disconnect();
          return;
        }
        if (role === "host") {
          await r.localParticipant.setCameraEnabled(true);
          await r.localParticipant.setMicrophoneEnabled(true);
          const cam = r.localParticipant.getTrackPublication(Track.Source.Camera);
          const t = cam?.track;
          if (t && videoRef.current) t.attach(videoRef.current);
        }
        setMsg("");
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Không vào được phòng LiveKit.");
      }
    })();

    return () => {
      stop = true;
      local?.stop?.();
      roomObj?.disconnect?.();
    };
  }, [room, identity, role]);

  return (
    <div style={{ position: "relative", width: "100%", height, background: "#070B12", minHeight: 240 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={role === "host"}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {msg && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            textAlign: "center",
            fontSize: 13,
            color: "#F4F7FB",
            background: "rgba(7,11,18,.72)",
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
