/** Chạm khung livestream → cắt vùng quanh điểm chạm → AI Phúc nhận đồ. */

export type TapPoint = {
  /** 0–1 theo bề ngang / cao player */
  xPct: number;
  yPct: number;
  clientX: number;
  clientY: number;
};

export type VisionHit = {
  label: string;
  confidence: number;
  kind: "product" | "gift" | "person" | "text" | "other";
  reply: string;
  productCode?: string;
};

export const TAP_CROP_PCT = 0.28; // ô vuông quanh điểm chạm (~28% cạnh ngắn)

export function tapFromPointer(
  el: HTMLElement,
  clientX: number,
  clientY: number
): TapPoint {
  const r = el.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (clientX - r.left) / Math.max(1, r.width)));
  const y = Math.min(1, Math.max(0, (clientY - r.top) / Math.max(1, r.height)));
  return { xPct: x, yPct: y, clientX, clientY };
}

/** Vùng crop 0–1, không đụng mép. */
export function cropBoxAroundTap(tap: TapPoint, sizePct = TAP_CROP_PCT) {
  const half = sizePct / 2;
  let left = tap.xPct - half;
  let top = tap.yPct - half;
  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + sizePct > 1) left = 1 - sizePct;
  if (top + sizePct > 1) top = 1 - sizePct;
  return { left, top, size: sizePct };
}

export async function captureTapCrop(
  video: HTMLVideoElement,
  tap: TapPoint
): Promise<string | null> {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;
  const box = cropBoxAroundTap(tap);
  const sx = Math.floor(box.left * w);
  const sy = Math.floor(box.top * h);
  const sw = Math.max(32, Math.floor(box.size * w));
  const sh = Math.max(32, Math.floor(box.size * h));
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export const PHUC_VISION_PATH = "/api/phuc-vision";

export async function askPhucVision(opts: {
  imageDataUrl: string;
  tap: TapPoint;
  liveSessionId?: string;
  listedProducts?: { name: string; productCode: string }[];
}): Promise<VisionHit> {
  try {
    const res = await fetch(PHUC_VISION_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    if (res.ok) return (await res.json()) as VisionHit;
  } catch {
    /* fallback local */
  }
  return localGuess(opts);
}

function localGuess(opts: {
  listedProducts?: { name: string; productCode: string }[];
}): VisionHit {
  const p = opts.listedProducts?.[0];
  if (p) {
    return {
      label: p.name,
      confidence: 0.4,
      kind: "product",
      productCode: p.productCode,
      reply: `Phúc thấy gần điểm bạn chạm có thể là «${p.name}» (mã ${p.productCode}). Bấm xem trên gian hàng superBUY để chắc chắn.`,
    };
  }
  return {
    label: "vật trong khung",
    confidence: 0.2,
    kind: "other",
    reply:
      "Phúc đã nhận điểm chạm. Gửi ảnh vùng này lên server nhận diện khi API phuc-vision sẵn sàng. Bạn mô tả thêm món muốn hỏi nhé.",
  };
}

export const TAP_VISION_HINT =
  "Chạm vào đồ trong khung live. Phúc cắt ô quanh điểm chạm, nhận món và trả lời — không che mặt người diễn.";
