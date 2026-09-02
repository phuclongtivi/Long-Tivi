"use client";

import { useEffect, useState } from "react";
import {
  askAvPermission,
  classifyDevice,
  KIND_LABEL,
  listAvDevices,
  setCameraTorch,
  type AvDevice,
  type PlDeviceKind,
} from "./media-devices";

const MACHINE: Record<PlDeviceKind, string> = {
  phone: "Điện thoại",
  tablet: "Máy tính bảng",
  laptop: "Laptop",
  desktop: "Máy tính để bàn",
};

export function MediaDeviceDock({
  onPick,
  initial,
}: {
  onPick?: (d: { micId?: string; camId?: string; speakerId?: string }) => void;
  initial?: { micId?: string; camId?: string; speakerId?: string };
}) {
  const [kind, setKind] = useState<PlDeviceKind>("phone");
  const [list, setList] = useState<AvDevice[]>([]);
  const [micId, setMicId] = useState("");
  const [camId, setCamId] = useState("");
  const [spkId, setSpkId] = useState("");
  const [torch, setTorch] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!initial) return;
    setMicId(initial.micId || "");
    setCamId(initial.camId || "");
    setSpkId(initial.speakerId || "");
  }, [initial]);

  async function refresh() {
    setKind(classifyDevice());
    const ok = await askAvPermission();
    if (!ok) setMsg("Cần quyền micro + camera để thấy tên thiết bị gắn thêm.");
    setList(await listAvDevices());
  }

  useEffect(() => {
    refresh();
    const md = navigator.mediaDevices;
    md?.addEventListener?.("devicechange", refresh);
    return () => md?.removeEventListener?.("devicechange", refresh);
  }, []);

  function emit(next: { micId?: string; camId?: string; speakerId?: string }) { onPick?.(next); }

  const group = (k: AvDevice["kind"]) => list.filter((d) => d.kind === k);

  return (
    <section className="ev-form">
      <h3 style={{ marginTop: 0 }}>Thiết bị trên {MACHINE[kind]}</h3>
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        Nhận micro, loa, tai nghe, camera, card capture khi gắn/rút. Đèn pin camera (torch) trên điện thoại.
        Đèn USB bàn không có API web — bật ngoài máy.
      </p>
      {(["audioinput", "audiooutput", "videoinput"] as const).map((k) => (
        <label key={k}>
          {KIND_LABEL[k]}
          <select
            value={k === "audioinput" ? micId : k === "audiooutput" ? spkId : camId}
            onChange={(e) => {
              if (k === "audioinput") setMicId(e.target.value);
              else if (k === "audiooutput") setSpkId(e.target.value);
              else setCamId(e.target.value);
              emit({
                micId: k === "audioinput" ? e.target.value || undefined : micId || undefined,
                camId: k === "videoinput" ? e.target.value || undefined : camId || undefined,
                speakerId: k === "audiooutput" ? e.target.value || undefined : spkId || undefined,
              });
            }}
          >
            <option value="">Mặc định hệ thống</option>
            {group(k).map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="button"
        onClick={async () => {
          const ok = await setCameraTorch(!torch, camId || undefined);
          setTorch(ok ? !torch : false);
          setMsg(ok ? (torch ? "Đã tắt đèn camera" : "Đã bật đèn camera") : "Máy không hỗ trợ torch");
        }}
      >
        Đèn camera (torch)
      </button>
      <button type="button" onClick={refresh}>
        Quét lại thiết bị
      </button>
      {msg && <p style={{ fontSize: 12 }}>{msg}</p>}
    </section>
  );
}
