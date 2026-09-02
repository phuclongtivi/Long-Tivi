import { HOME_POST_EXTRA_MS } from "./home-feed";

export type PhotoReelComment = {
  id: string;
  name: string;
  text: string;
  at: string;
};

export type PhotoReel = {
  id: string;
  title: string;
  description: string;
  images: string[];
  videoUrl?: string;
  createdAt: string;
  author: string;
  likesCount?: number;
  comments?: PhotoReelComment[];
};

/** Video ảnh không có giờ kết thúc live → hết hạn = đăng + 72 giờ (cùng hằng số tường sự kiện). */
export function photoReelExpiresAt(r: PhotoReel): Date {
  return new Date(+new Date(r.createdAt) + HOME_POST_EXTRA_MS);
}

export function photoReelVisibleOnHome(r: PhotoReel, now = Date.now()): boolean {
  const start = +new Date(r.createdAt);
  if (!Number.isFinite(start)) return false;
  return now <= start + HOME_POST_EXTRA_MS;
}

const KEY = "pl-photo-reels";

export function loadPhotoReels(): PhotoReel[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as PhotoReel[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePhotoReels(list: PhotoReel[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 40)));
}

export function addPhotoReel(r: PhotoReel) {
  savePhotoReels([r, ...loadPhotoReels()]);
}

export function patchPhotoReel(id: string, patch: Partial<PhotoReel>) {
  savePhotoReels(loadPhotoReels().map((x) => (x.id === id ? { ...x, ...patch } : x)));
}

export function visiblePhotoReels(now = Date.now()): PhotoReel[] {
  return loadPhotoReels().filter((r) => photoReelVisibleOnHome(r, now));
}

export function getPhotoReel(id: string): PhotoReel | undefined {
  return loadPhotoReels().find((r) => r.id === id);
}

export function readImageFile(file: File): Promise<string> {
  if (!file.type || file.type.indexOf("image/") !== 0) {
    return Promise.reject(new Error("Chỉ nhận ảnh."));
  }
  if (file.size > 5 * 1024 * 1024) {
    return Promise.reject(new Error("Mỗi ảnh tối đa 5 MB."));
  }
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Không đọc được ảnh."));
    r.readAsDataURL(file);
  });
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Ảnh lỗi"));
    img.src = src;
  });
}

/** Slideshow ~2s/ảnh. Có MediaRecorder thì ra webm; không thì chỉ giữ ảnh. */
export async function bakePhotoVideo(images: string[]): Promise<string | undefined> {
  if (typeof MediaRecorder === "undefined" || !images.length) return undefined;
  const w = 640;
  const h = 360;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  let stream: MediaStream;
  try {
    stream = canvas.captureStream(12);
  } catch {
    return undefined;
  }
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
    ? "video/webm;codecs=vp8"
    : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";
  if (!mime) return undefined;
  const rec = new MediaRecorder(stream, { mimeType: mime });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data);
  };
  rec.start();
  const hold = 1800;
  for (let i = 0; i < images.length; i++) {
    const img = await loadImg(images[i]);
    ctx.fillStyle = "#1D2951";
    ctx.fillRect(0, 0, w, h);
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    await new Promise((r) => setTimeout(r, hold));
  }
  rec.stop();
  await new Promise((r) => setTimeout(r, 200));
  if (!chunks.length) return undefined;
  const blob = new Blob(chunks, { type: "video/webm" });
  return URL.createObjectURL(blob);
}
