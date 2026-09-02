'use client';

import { useEffect } from 'react';
import GuestNavLink from './GuestNavLink';
import { readTheme, writeTheme } from './event/theme';
import './event/theme.css';
import { PwaRegister } from './event/PwaRegister';
import { UserAvatarFrame } from './event/UserAvatarFrame';
import { useLanguage } from './LanguageProvider';

function ThemeBoot() {
  useEffect(() => {
    writeTheme(readTheme());
  }, []);
  return null;
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="miter" aria-hidden="true">
      <path d="M4.5 10.8 12 4.4l7.5 6.4V19.5H14v-5.2h-4v5.2H4.5z" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="miter" aria-hidden="true">
      <path d="M7 8.2h10l-.8 11.1H7.8z" />
      <path d="M9.2 8.2V7.1A2.8 2.8 0 0 1 12 4.4 2.8 2.8 0 0 1 14.8 7.1v1.1" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="miter" aria-hidden="true">
      <path d="M6.2 16.2h11.6l-1.1-1.3V10.4A5.1 5.1 0 0 0 12 5.4a5.1 5.1 0 0 0-5.5 5v4.5z" />
      <path d="M10 16.2v.7a2 2 0 0 0 4 0v-.7" />
    </svg>
  );
}

function IconMenuFace({ src, rank }: { src?: string; rank?: string }) {
  return <UserAvatarFrame src={src} rank={rank} size={28} alt="" />;
}

const TABS = [
  { href: '/home', labelKey: 'home_short', Icon: IconHome },
  { href: '/store', labelKey: 'superbuy', Icon: IconBag },
  { href: '/', label: 'LIVE', center: true as const },
  { href: '/notify', labelKey: 'notifications', Icon: IconBell },
  { href: '/dashboard', labelKey: 'menu', menu: true as const },
];

export default function BottomNav({
  activeHref,
  profileSrc,
  profileRank,
}: {
  activeHref: string;
  profileSrc?: string;
  profileRank?: string;
}) {
  const { t } = useLanguage();
  return (
    <>
    <ThemeBoot />
    <PwaRegister />
    <nav
      className="pl-tabbar"
      style={{
        position: "fixed",
        left: 6,
        right: 6,
        bottom: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopStyle: "solid",
      }}
    >
      {TABS.map((tab) => {
        const active =
          activeHref === tab.href || (tab.href !== '/' && activeHref.startsWith(tab.href));
        if ('center' in tab && tab.center) {
          return (
            <GuestNavLink
              key={tab.href}
              href={tab.href}
              authMode="soft"
              aria-label={t('live_short')}
              className="pl-live-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <span className="pl-live-circle">{t('live_short')}</span>
            </GuestNavLink>
          );
        }
        const Ico = 'Icon' in tab ? tab.Icon : undefined;
        const shop = tab.href === "/store";
        const label = "labelKey" in tab ? t(tab.labelKey) : tab.label;
        return (
          <GuestNavLink
            key={tab.href}
            href={tab.href}
            authMode="soft"
            aria-label={label}
            title={label}
            className="pl-press pl-tab-link"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              opacity: active ? 1 : 0.86,
              textDecoration: "none",
            }}
          >
            {shop ? (
              <>
                <span className="pl-tab-ico">{Ico ? <Ico /> : null}</span>
                <span className="pl-tab-label">{label}</span>
              </>
            ) : (
              <>
                {"menu" in tab && tab.menu ? (
                  <IconMenuFace src={profileSrc} rank={profileRank} />
                ) : Ico ? (
                  <span className="pl-tab-ico">{Ico ? <Ico /> : null}</span>
                ) : null}
                <span className="pl-tab-label">{label}</span>
              </>
            )}
          </GuestNavLink>
        );
      })}
    </nav>
    </>
  );
}
