/** Thông báo tổ chức: ảnh thay soạn text. Tối đa 5MB. */

export const NOTICE_MAX_BYTES = 5 * 1024 * 1024;

export const NOTICE_ACCEPT =
  "image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.heic,.heif,.avif,.tif,.tiff,.apng";

const ALLOWED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
  "image/apng",
  "image/x-icon",
];

export type NoticeImageKind = "static" | "animated";

export type NoticeInk = "navy" | "white";

export const NOTICE_NAVY = "#1D2951";
export const NOTICE_WHITE = "#FFFFFF";

export type EventNoticeFields = {
  organizerNotice?: string;
  organizerNoticeImageUrl?: string;
  organizerNoticeImageKind?: NoticeImageKind;
  organizerNoticeImageName?: string;
  organizerNoticeInk?: NoticeInk;
};

export function noticeColors(ink?: NoticeInk): { color: string; background: string } {
  if (ink === "white") return { color: NOTICE_WHITE, background: NOTICE_NAVY };
  return { color: NOTICE_NAVY, background: NOTICE_WHITE };
}

export function isAnimatedImage(file: File): boolean {
  const n = (file.name || "").toLowerCase();
  const t = (file.type || "").toLowerCase();
  return t === "image/gif" || t === "image/webp" || t === "image/apng" || /\.(gif|webp|apng)$/.test(n);
}

export function validateNoticeImage(file: File): string | null {
  if (file.size > NOTICE_MAX_BYTES) return "Ảnh tối đa 5 MB.";
  const t = (file.type || "").toLowerCase();
  if (t && !t.startsWith("image/") && ALLOWED.indexOf(t) < 0) {
    return "Chỉ nhận định dạng ảnh phổ biến (JPG, PNG, GIF, WEBP, HEIC, AVIF, SVG, BMP, TIFF…).";
  }
  return null;
}

export function readNoticeFile(file: File): Promise<EventNoticeFields> {
  const err = validateNoticeImage(file);
  if (err) return Promise.reject(new Error(err));
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () =>
      resolve({
        organizerNoticeImageUrl: String(r.result || ""),
        organizerNoticeImageKind: isAnimatedImage(file) ? "animated" : "static",
        organizerNoticeImageName: file.name,
        organizerNotice: "",
      });
    r.onerror = () => reject(new Error("Không đọc được ảnh."));
    r.readAsDataURL(file);
  });
}

export function formatWhen(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}
