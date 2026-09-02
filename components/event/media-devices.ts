/** Nhận diện máy + thiết bị AV / đèn mà trình duyệt cho phép. */

export type PlDeviceKind = "phone" | "tablet" | "laptop" | "desktop";

export type AvDevice = {
  id: string;
  label: string;
  kind: "audioinput" | "audiooutput" | "videoinput";
};

export function classifyDevice(): PlDeviceKind {
  if (typeof window === "undefined") return "phone";
  const ua = navigator.userAgent;
  const w = window.innerWidth;
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (w >= 1280 && !touch) return "desktop";
  if (w >= 1024 && touch) return "tablet";
  if (w >= 900 && !touch) return "laptop";
  if (w >= 768) return touch ? "tablet" : "laptop";
  return "phone";
}

export async function listAvDevices(): Promise<AvDevice[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  try {
    const raw = await navigator.mediaDevices.enumerateDevices();
    return raw
      .filter((d) => d.kind === "audioinput" || d.kind === "audiooutput" || d.kind === "videoinput")
      .map((d) => ({
        id: d.deviceId,
        kind: d.kind as AvDevice["kind"],
        label:
          d.label ||
          (d.kind === "audioinput"
            ? "Micro"
            : d.kind === "audiooutput"
              ? "Loa / tai nghe"
              : "Camera"),
      }));
  } catch {
    return [];
  }
}

export async function askAvPermission(): Promise<boolean> {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    s.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }
}

/** Đèn pin camera (điện thoại). USB light desk không có API web chuẩn. */
export async function setCameraTorch(on: boolean, videoDeviceId?: string): Promise<boolean> {
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: videoDeviceId
        ? { deviceId: { exact: videoDeviceId }, advanced: [{ torch: on } as MediaTrackConstraints] }
        : { facingMode: "environment", advanced: [{ torch: on } as MediaTrackConstraints] },
    });
    const track = s.getVideoTracks()[0];
    const cap = track.getCapabilities?.() as { torch?: boolean };
    if (cap?.torch && track.applyConstraints) {
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraints] });
      return true;
    }
    s.getTracks().forEach((t) => t.stop());
    return false;
  } catch {
    return false;
  }
}

export const KIND_LABEL: Record<AvDevice["kind"], string> = {
  audioinput: "Micro / mixer",
  audiooutput: "Loa / tai nghe",
  videoinput: "Camera / capture",
};
