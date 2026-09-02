"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadStage,
  saveStage,
  toggleSeatCam,
  toggleSeatMic,
  type AudienceStage,
  type StageSeat,
} from "./audience-stage";

type Props = {
  roomId: string;
  /** Danh sách user trong phòng — BTC chọn để mở mic / hiện hình */
  people?: { id: string; name: string; role?: "audience" | "guest" }[];
};

export function AudienceStageDesk({ roomId, people }: Props) {
  const [st, setSt] = useState<AudienceStage>(() => loadStage(roomId));
  const [pick, setPick] = useState("");
  const localRef = useRef<HTMLVideoElement>(null);
  const [localOn, setLocalOn] = useState(false);

  useEffect(() => {
    setSt(loadStage(roomId));
  }, [roomId]);

  function commit(next: AudienceStage) {
    setSt(next);
    saveStage(next);
  }

  const roster = useMemo(() => {
    const base = people && people.length
      ? people
      : [
          { id: "aud-1", name: "Khán giả A", role: "audience" as const },
          { id: "aud-2", name: "Khán giả B", role: "audience" as const },
          { id: "gst-1", name: "Khách mời 1", role: "guest" as const },
        ];
    return base;
  }, [people]);

  useEffect(() => {
    let stream: MediaStream | undefined;
    if (!localOn || !localRef.current) return;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((s) => {
        stream = s;
        if (localRef.current) localRef.current.srcObject = s;
      })
      .catch(() => undefined);
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [localOn]);

  function addSeat(id: string) {
    const p = roster.find((x) => x.id === id);
    if (!p) return;
    if (st.seats.some((s) => s.id === id)) return;
    commit({
      ...st,
      seats: [
        ...st.seats,
        {
          id: p.id,
          name: p.name,
          role: p.role || "audience",
          micOn: true,
          cameraOn: true,
        },
      ],
    });
    setPick("");
  }

  return (
    <section
      style={{
        marginTop: 12,
        background: "transparent",
        color: "var(--pl-text)",
        border: "2px solid var(--pl-frame)",
        boxShadow: "0 0 0 1px var(--pl-frame-soft)",
        borderRadius: 14,
        padding: 12,
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>Micro khán giả + hình kiểu Zoom</h3>

      <button
        type="button"
        onClick={() => commit({ ...st, audienceMicMasterOn: !st.audienceMicMasterOn })}
        style={{
          height: 40,
          padding: "0 14px",
          borderRadius: 999,
          border: "1px solid var(--pl-border)",
          background: st.audienceMicMasterOn ? "#E11D48" : "transparent",
          color: st.audienceMicMasterOn ? "#fff" : "inherit",
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        {st.audienceMicMasterOn ? "Mic khán giả: ĐANG MỞ" : "Mic khán giả: ĐANG TẮT"}
      </button>

      <div style={{ marginTop: 10 }}>
        <label style={{ fontSize: 12 }}>
          Chọn user mở mic / hiện hình
          <select
            value={pick}
            onChange={(e) => {
              setPick(e.target.value);
              if (e.target.value) addSeat(e.target.value);
            }}
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              color: "inherit",
              background: "transparent",
            }}
          >
            <option value="">— chọn người —</option>
            {roster.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role === "guest" ? "khách mời" : "khán giả"})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        {st.seats.map((seat: StageSeat) => (
          <div
            key={seat.id}
            style={{
              display: "inline-block",
              width: "31%",
              marginRight: "2%",
              marginBottom: 8,
              verticalAlign: "top",
              border: "1px solid var(--pl-border)",
              borderRadius: 10,
              overflow: "hidden",
              background: "#111",
              color: "#fff",
            }}
          >
            <div
              style={{
                height: 72,
                background: seat.cameraOn ? "#24315c" : "#222",
                textAlign: "center",
                lineHeight: "72px",
                fontSize: 11,
              }}
            >
              {seat.cameraOn ? "Camera ON" : "Ẩn hình"}
            </div>
            <div style={{ padding: 6, fontSize: 11 }}>
              <b>{seat.name}</b>
              <div>
                <button
                  type="button"
                  onClick={() => commit(toggleSeatMic(st, seat.id))}
                  style={{
                    marginTop: 4,
                    marginRight: 4,
                    height: 26,
                    fontSize: 11,
                    fontWeight: 700,
                    border: "none",
                    borderRadius: 8,
                    background: seat.micOn && st.audienceMicMasterOn ? "#E11D48" : "#555",
                    color: "#fff",
                  }}
                >
                  {seat.micOn ? "Mic On" : "Mute"}
                </button>
                <button
                  type="button"
                  onClick={() => commit(toggleSeatCam(st, seat.id))}
                  style={{
                    marginTop: 4,
                    height: 26,
                    fontSize: 11,
                    fontWeight: 700,
                    border: "none",
                    borderRadius: 8,
                    background: seat.cameraOn ? "#1d2951" : "#555",
                    color: "#fff",
                  }}
                >
                  {seat.cameraOn ? "Hiện hình" : "Ẩn"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {!st.seats.length ? (
          <p style={{ fontSize: 12, opacity: 0.7 }}>Chưa có ô hình. Chọn user ở danh sách trên.</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setLocalOn((v) => !v)}
        style={{
          marginTop: 6,
          height: 36,
          padding: "0 12px",
          borderRadius: 10,
          border: "1px solid var(--pl-border)",
          background: "transparent",
          color: "inherit",
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {localOn ? "Tắt camera máy BTC (xem thử ô)" : "Bật camera máy BTC xem thử ô Zoom"}
      </button>
      {localOn ? (
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          style={{ width: "48%", marginTop: 8, borderRadius: 10, background: "#000" }}
        />
      ) : null}
    </section>
  );
}
