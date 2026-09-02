/** Xin quyền micro — Chrome / Safari / Firefox / Cốc Cốc. */

export type MicPerm = "granted" | "denied" | "prompt" | "unsupported";

export function micHint(): string {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;
  if (/CocCoc|coccoc/i.test(ua)) {
    return "Cốc Cốc: biểu tượng ổ khóa góc địa chỉ → Quyền trang web → Micro → Cho phép.";
  }
  if (/Firefox/i.test(ua)) {
    return "Firefox: biểu tượng micro trên thanh địa chỉ → Cho phép.";
  }
  if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg|CocCoc/i.test(ua)) {
    return "Safari: Cài đặt / Safari → Trang web → Micro → Cho phép. iPhone: Cài đặt → Safari → Micro.";
  }
  return "Chrome: biểu tượng ổ khóa cạnh địa chỉ → Quyền → Micro → Cho phép.";
}

export async function queryMicPerm(): Promise<MicPerm> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "unsupported";
  }
  try {
    const perm = await navigator.permissions?.query?.({ name: "microphone" as PermissionName });
    if (perm?.state === "granted" || perm?.state === "denied" || perm?.state === "prompt") {
      return perm.state;
    }
  } catch {
    /* Safari / Cốc Cốc có thể không có permissions.query microphone */
  }
  return "prompt";
}

export async function requestMic(): Promise<{ ok: boolean; perm: MicPerm; error?: string }> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { ok: false, perm: "unsupported", error: "Trình duyệt không hỗ trợ micro." };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    stream.getTracks().forEach((t) => t.stop());
    return { ok: true, perm: "granted" };
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return { ok: false, perm: "denied", error: micHint() };
    }
    return { ok: false, perm: "denied", error: "Không bật được micro. " + micHint() };
  }
}
