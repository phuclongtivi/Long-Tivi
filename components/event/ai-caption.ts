export type CaptionEffect = "none" | "marquee" | "fade" | "pop" | "glow";

export type CaptionFontSource = "btc-preview" | "theme" | "owner-vibe";

export type LiveThemeKey = "AmNhac" | "PhimAnh" | "SanPham" | "Talk" | "default";

export type OwnerVibe = "warm" | "formal" | "playful" | "minimal";

export type BtcPreviewType = {
  fontFamily?: string;
  effect?: CaptionEffect;
};

export const THEME_FONT: Record<LiveThemeKey, string> = {
  AmNhac: '"Inter", "SF Pro Display", system-ui, sans-serif',
  PhimAnh: '"Georgia", "Times New Roman", serif',
  SanPham: '"Inter", system-ui, sans-serif',
  Talk: '"Inter", system-ui, sans-serif',
  default: '"Inter", system-ui, sans-serif',
};

export const VIBE_FONT: Record<OwnerVibe, string> = {
  warm: '"Georgia", "Palatino", serif',
  formal: '"Inter", "Helvetica Neue", sans-serif',
  playful: '"Trebuchet MS", "Comic Sans MS", sans-serif',
  minimal: '"Inter", system-ui, sans-serif',
};

export function resolveCaptionFont(opts: {
  preview?: BtcPreviewType | null;
  theme?: LiveThemeKey;
  vibe?: OwnerVibe;
}): { family: string; source: CaptionFontSource } {
  const custom = opts.preview?.fontFamily?.trim();
  if (custom) return { family: custom, source: "btc-preview" };
  if (opts.theme && opts.theme !== "default") {
    return { family: THEME_FONT[opts.theme], source: "theme" };
  }
  return { family: VIBE_FONT[opts.vibe ?? "warm"], source: "owner-vibe" };
}

export function parseCaptionCommand(text: string): { text: string; effect: CaptionEffect } | null {
  const m = text.match(/^(?:chạy chữ|hiện chữ|chữ)\s*[:：]?\s*(.+)$/i);
  if (!m) return null;
  let body = m[1].trim();
  let effect: CaptionEffect = "marquee";
  if (/\[glow\]/i.test(body)) effect = "glow";
  if (/\[pop\]/i.test(body)) effect = "pop";
  if (/\[fade\]/i.test(body)) effect = "fade";
  if (/\[đứng\]/i.test(body)) effect = "none";
  body = body.replace(/\[(glow|pop|fade|đứng)\]/gi, "").trim();
  if (!body) return null;
  return { text: body, effect };
}
