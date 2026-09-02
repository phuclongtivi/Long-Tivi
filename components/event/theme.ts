export type AppTheme = "pearl" | "aqua" | "blush" | "lavender";

export const THEME_KEY = "pl-theme";

export const THEME_META: Record<AppTheme, { label: string; bg: string; accent: string }> = {
  pearl: { label: "Pearl White", bg: "#F7F9FC", accent: "#2563EB" },
  aqua: { label: "Aqua Mist", bg: "#EEF9F8", accent: "#0F9F93" },
  blush: { label: "Blush Pink", bg: "#FFF2F6", accent: "#E9487A" },
  lavender: { label: "Lavender Mist", bg: "#F4F1FF", accent: "#7C5CE0" },
};

export const THEMES: AppTheme[] = ["pearl", "aqua", "blush", "lavender"];

export function isAppTheme(v: unknown): v is AppTheme {
  return v === "pearl" || v === "aqua" || v === "blush" || v === "lavender";
}

export function readTheme(): AppTheme {
  if (typeof window === "undefined") return "pearl";
  const v = localStorage.getItem(THEME_KEY);
  return isAppTheme(v) ? v : "pearl";
}

export function writeTheme(t: AppTheme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.dataset.theme = t;
  document.documentElement.removeAttribute("data-long-theme");
  document.body?.setAttribute("data-theme", t);
  document.body?.removeAttribute("data-long-theme");
}

export function migrateLegacyTheme() {
  if (typeof window === "undefined") return "pearl" as AppTheme;
  const old = localStorage.getItem(THEME_KEY);
  const next: AppTheme = isAppTheme(old) ? old : "pearl";
  writeTheme(next);
  return next;
}
