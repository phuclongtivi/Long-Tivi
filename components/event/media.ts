/** Quy tắc ảnh Long — chi phí 0đ ngoài Vercel hiện có. */

export const QR_KEEP_PNG = "/pay/boss-qr.png";
export const LIVE_GEM_SVG = "/live-gem.svg";
export const PHUC_AVATAR_WEBP = "/stickers/phuc-chatbot-avatar-v2.webp";
export const PHUC_LOGO_WEBP = "/stickers/phuc-chatbot-logo-v2.webp";

/** Chỉ đổi những asset chắc chắn có bản tối ưu tương ứng. */
export function optimizeAssetUrl(url?: string | null): string {
  if (!url) return "";
  if (url === "/logo.png") return "/icon-512.png";
  if (url === "/ai-mascot-round.jpg") return "/ai-mascot-round-v2.webp";
  if (url === "/ai-mascot-full.jpg") return "/ai-mascot-full-v2.webp";
  if (url === "/stickers/phuc-chatbot-avatar.png") return "/stickers/phuc-chatbot-avatar-v2.webp";
  if (url === "/stickers/phuc-chatbot-avatar.webp") return "/stickers/phuc-chatbot-avatar-v2.webp";
  if (url === "/stickers/phuc-chatbot-logo.webp") return "/stickers/phuc-chatbot-logo-v2.webp";
  if (url === "/live-gem.png") return LIVE_GEM_SVG;
  if (/^\/stickers\/tier[123]\/t[123]_.+\.png$/i.test(url)) return url.replace(/\.png$/i, ".webp");
  return url;
}
