export type AppTheme = "pearl" | "aqua" | "blush" | "lavender";

export const THEME_KEY = "pl-theme";

export const THEME_META: Record<AppTheme, { label: string; bg: string; accent: string }> = {
  pearl: { label: "Pearl White", bg: "#F7F9FC", accent: "#2563EB" },
  aqua: { label: "Aqua Mist", bg: "#EEF9F8", accent: "#0F9F93" },
  blush: { label: "Blush Pink", bg: "#FFF2F6", accent: "#E9487A" },
  lavender: { label: "Lavender Mist", bg: "#F4F1FF", accent: "#7C5CE0" },
};

export const THEMES: AppTheme[] = ["pearl", "aqua", "blush", "lavender"];

export function readTheme(): AppTheme {
  if (typeof window === "undefined") return "pearl";
  const v = localStorage.getItem(THEME_KEY);
  if (v === "pearl" || v === "aqua" || v === "blush" || v === "lavender") return v;
  // V2: bỏ dark navy. Theme cũ dark/light đều được nâng lên Pearl.
  return "pearl";
}

export function writeTheme(t: AppTheme) {
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.dataset.theme = t;
  document.documentElement.setAttribute("data-theme", t);
  if (document.body) document.body.setAttribute("data-theme", t);
}

export function nextTheme(current: AppTheme): AppTheme {
  const i = THEMES.indexOf(current);
  return THEMES[(i + 1) % THEMES.length];
}
