export type AppTheme = "dark" | "light";

export const THEME_KEY = "pl-theme";

/** Space Cadet — thương hiệu + hạng user */
export const SPACE_CADET = "#1D2951";
export const SPACE_CADET_SURFACE = "#24315C";
export const SPACE_CADET_BORDER = "#2E3D6B";
export const WHITE = "#FFFFFF";

export function readTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem(THEME_KEY);
  if (v === "dark") return "dark";
  return "light";
}

export function writeTheme(t: AppTheme) {
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.dataset.theme = t;
  document.documentElement.setAttribute("data-theme", t);
  if (document.body) document.body.setAttribute("data-theme", t);
}

export const THEME = {
  dark: {
    bg: SPACE_CADET,
    bgGlow: `radial-gradient(1200px 500px at 50% -10%, #2A3A72 0%, ${SPACE_CADET} 58%)`,
    surface: "transparent",
    text: WHITE,
    muted: "#F4F7FB",
    tab: "transparent",
    border: WHITE,
    gem: "white",
    icon: WHITE,
  },
  light: {
    bg: WHITE,
    bgGlow: "none",
    surface: "transparent",
    text: SPACE_CADET,
    muted: "#3A4A78",
    tab: "transparent",
    border: SPACE_CADET,
    gem: "pink",
    icon: SPACE_CADET,
  },
};
