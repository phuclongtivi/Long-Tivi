"use client";

import { useEffect } from "react";
import GuestNavLink from "./GuestNavLink";
import { readTheme, writeTheme } from "./event/theme";
import "./event/theme.css";
import "./core/v2-mixer-system.css";
import { PwaRegister } from "./event/PwaRegister";
import { UserAvatarFrame } from "./event/UserAvatarFrame";
import { APP_PROFILE, navForProfile, type CoreNavItem } from "./core/app-profile";

function ThemeBoot() {
  useEffect(() => {
    writeTheme(readTheme());
    document.documentElement.dataset.appProfile = APP_PROFILE;
  }, []);
  return null;
}

function Icon({ kind }: { kind: CoreNavItem["kind"] }) {
  if (kind === "home" || kind === "watch") {
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4.5 10.8 12 4.4l7.5 6.4V19.5H14v-5.2h-4v5.2H4.5z"/></svg>;
  }
  if (kind === "shop") {
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 8.2h10l-.8 11.1H7.8z"/><path d="M9.2 8.2V7.1A2.8 2.8 0 0 1 12 4.4a2.8 2.8 0 0 1 2.8 2.7v1.1"/></svg>;
  }
  if (kind === "mixer") {
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4v16M12 4v16M19 4v16"/><circle cx="5" cy="9" r="2"/><circle cx="12" cy="15" r="2"/><circle cx="19" cy="7" r="2"/></svg>;
  }
  if (kind === "ai") {
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 14 8l5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/></svg>;
  }
  if (kind === "connect") {
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="5" width="17" height="11" rx="2"/><path d="M9 20h6M12 16v4"/></svg>;
  }
  if (kind === "live") {
    return <span className="pl-v2-live-glyph">LIVE</span>;
  }
  return <UserAvatarFrame size={28} alt="" />;
}

export default function BottomNav({
  activeHref,
  profileSrc,
  profileRank,
}: {
  activeHref: string;
  profileSrc?: string;
  profileRank?: string;
}) {
  const tabs = navForProfile();

  return (
    <>
      <ThemeBoot />
      <PwaRegister />
      <nav className="pl-tabbar pl-v2-tabbar" aria-label={`Long ${APP_PROFILE} navigation`}>
        {tabs.map((tab) => {
          const active =
            activeHref === tab.href ||
            (tab.href !== "/" && !tab.href.includes("?") && activeHref.startsWith(tab.href));

          if (tab.center) {
            return (
              <GuestNavLink key={tab.label} href={tab.href} authMode="soft" className="pl-v2-live-link" aria-label={tab.label}>
                <span className="pl-live-circle pl-v2-live-circle">{tab.label}</span>
              </GuestNavLink>
            );
          }

          return (
            <GuestNavLink
              key={tab.label}
              href={tab.href}
              authMode="soft"
              aria-label={tab.label}
              title={tab.label}
              className={active ? "pl-v2-tab-link active" : "pl-v2-tab-link"}
            >
              <span className="pl-v2-tab-ico">
                {tab.kind === "menu" ? (
                  <UserAvatarFrame src={profileSrc} rank={profileRank} size={28} alt="" />
                ) : (
                  <Icon kind={tab.kind} />
                )}
              </span>
              <span className="pl-v2-tab-label">{tab.label}</span>
            </GuestNavLink>
          );
        })}
      </nav>
    </>
  );
}
