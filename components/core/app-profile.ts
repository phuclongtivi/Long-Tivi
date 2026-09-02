export type LongAppProfile = "pro" | "mobile" | "tv";

export type CoreNavItem = {
  href: string;
  label: string;
  kind: "home" | "shop" | "live" | "ai" | "menu" | "watch" | "connect" | "mixer";
  center?: boolean;
};

/**
 * Long 1986 V2
 * Cùng một CoreNav, mỗi bản chỉ thay APP_PROFILE.
 * Đây là lớp khác biệt mỏng; business logic vẫn dùng chung.
 */
export const APP_PROFILE: LongAppProfile = "tv";

export const CORE_NAV: Record<LongAppProfile, CoreNavItem[]> = {
  mobile: [
    { href: "/home", label: "Home", kind: "home" },
    { href: "/store", label: "superBUY", kind: "shop" },
    { href: "/", label: "LIVE", kind: "live", center: true },
    { href: "/dashboard", label: "Me", kind: "menu" },
  ],
  pro: [
    { href: "/", label: "Live Studio", kind: "live" },
    { href: "/?pane=create", label: "Mixer", kind: "mixer" },
    { href: "/dashboard?section=ai", label: "AI", kind: "ai" },
    { href: "/dashboard", label: "Control", kind: "menu" },
  ],
  tv: [
    { href: "/home", label: "Watch", kind: "watch" },
    { href: "/", label: "LIVE", kind: "live", center: true },
    { href: "/?pane=devices", label: "Connect", kind: "connect" },
  ],
};

export function navForProfile(profile: LongAppProfile = APP_PROFILE) {
  return CORE_NAV[profile];
}
