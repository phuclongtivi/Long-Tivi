"use client";

import { useEffect, useState } from "react";
import { sessionAccount } from "@/components/event/account-links";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import UserChip from "./UserChip";
import GuestNavLink from "./GuestNavLink";
import GuestAuthPrompt from "./GuestAuthPrompt";
import BottomNav from "@/components/BottomNav";
import { openPhucChat } from "./AdminAIChatbot";
import { HomeWallTab } from "@/components/event/HomeWallTab";
import { ThemeToggle } from "@/components/event/ThemeToggle";
import type { EventPost } from "@/components/event/types";
import { useLanguage } from "./LanguageProvider";

const SOCIAL = [
  { href: "https://facebook.com", label: "Facebook", bg: "#1877F2" },
  { href: "https://youtube.com", label: "YouTube", bg: "#FF0000" },
  { href: "https://zalo.me", label: "Zalo", bg: "#0068FF" },
] as const;

const DEMO_POSTS: EventPost[] = [
  {
    id: "p1",
    organizerName: "Phúc Long Center",
    organizerRole: "admin",
    organizerId: "org-1",
    title: "Livestream khai trương gian hàng superBUY™",
    description: "Xem và nhận quà · sticker cấp 1 khi tham gia đủ 10 phút.",
    kind: "gift",
    status: "live",
    gift: "Sticker Level 1",
    startsAt: new Date().toISOString(),
    venue: "Phòng Live Phúc Long",
    guests: [],
    publishedAt: new Date().toISOString(),
    pinned: true,
    joinAccess: "open",
    insideCount: 12,
    watchingCount: 48,
  },
  {
    id: "p2",
    organizerName: "Nghệ sỹ mẫu",
    organizerRole: "artist",
    organizerId: "org-2",
    title: "Đêm nhạc có vé từ 1.000đ",
    description: "Góp vé mời nghệ sỹ. Áp dụng điểm sticker khi BTC bật.",
    kind: "ticket",
    status: "upcoming",
    ticketMode: "flexible",
    startsAt: new Date(Date.now() + 86400_000).toISOString(),
    venue: "Online",
    guests: [{ name: "MC Phúc", role: "mc" }],
    publishedAt: new Date().toISOString(),
    joinAccess: "ticket",
  },
  {
    id: "p3",
    organizerName: "Phóng viên A",
    organizerRole: "journalist",
    organizerId: "org-3",
    title: "Talkshow giới thiệu sản phẩm",
    description: "Thông báo tổ chức · xem trên tường như bài đăng.",
    kind: "gift",
    status: "upcoming",
    gift: "Voucher 20k",
    startsAt: new Date(Date.now() + 2 * 86400_000).toISOString(),
    venue: "Online",
    guests: [],
    publishedAt: new Date(Date.now() - 3600_000).toISOString(),
    joinAccess: "open",
  },
  {
    id: "p4",
    organizerName: "Boss",
    organizerRole: "admin",
    organizerId: "org-1",
    title: "Góp vé mời nghệ sỹ cuối tuần",
    description: "Một bài trên tường Home, không tách khu feed.",
    kind: "ticket",
    ticketMode: "invite",
    status: "upcoming",
    startsAt: new Date(Date.now() + 3 * 86400_000).toISOString(),
    venue: "Phúc Long Center",
    guests: [{ name: "NS mẫu", role: "ca-sy" }],
    publishedAt: new Date(Date.now() - 7200_000).toISOString(),
    joinAccess: "ticket",
  },
];

export default function HomeClient({
  isLoggedIn,
  userName,
  userRank,
  canOrganizeLive = false,
}: {
  isLoggedIn: boolean;
  userName: string | null;
  userRank: string;
  canOrganizeLive?: boolean;
}) {
  const { t } = useLanguage();
  const [guestPrompt, setGuestPrompt] = useState(false);
  const [authNext, setAuthNext] = useState("/");
  const [homePosts, setHomePosts] = useState<EventPost[]>(DEMO_POSTS);
  const logged = isLoggedIn || !!sessionAccount();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pl.home.notices.v1') || '[]') as EventPost[];
      if (saved.length) setHomePosts([...saved, ...DEMO_POSTS]);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const fn = (e: Event) => {
      const next = (e as CustomEvent).detail?.next || "/?pane=create";
      if (sessionAccount()) {
        window.location.href = next;
        return;
      }
      setAuthNext(next);
      setGuestPrompt(true);
    };
    window.addEventListener("pl-need-auth", fn);
    return () => window.removeEventListener("pl-need-auth", fn);
  }, []);

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--pl-bg,#1D2951)", color: "var(--pl-text,#F4F7FB)" }}>
      <header style={{ padding: "14px 16px 6px", textAlign: "center" }}>
        <button type="button" onClick={() => openPhucChat?.()} style={{ background: "none", border: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <img
            src="/icon-512.png"
            alt="Phúc Long Center"
            width={48}
            height={48}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{ width: 48, height: 48, borderRadius: 24, objectFit: "cover" }}
          />
          <span>
            <span className="pl-brand" style={{ display: "block", fontSize: 26, letterSpacing: 0.2 }}>Phúc Long Center</span>
            <span style={{ display: "block", fontSize: 12, letterSpacing: 3, color: "#C5D0E8", marginTop: 2 }}>SINCE 2019</span>
          </span>
        </button>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, gap: 6 }}>
          <ThemeToggle />
          {logged ? (
            <UserChip name={userName || sessionAccount()?.displayName || "Bạn"} rank={userRank} />
          ) : (
            <button type="button" onClick={() => setGuestPrompt(true)} className="pl-btn" style={{ height: 32, fontSize: 12 }}>
              {t('login')}
            </button>
          )}
        </div>
      </header>

      <HomeWallTab posts={homePosts} me={userName || "guest"} isLoggedIn={logged} />

      {canOrganizeLive && (
        <p className="px-3 text-xs opacity-70">
          <Link href="/dashboard">{t('create_event_notice')}</Link>
        </p>
      )}

      {guestPrompt && (
        <GuestAuthPrompt
          open
          reason="create-live"
          callbackUrl={authNext}
          onClose={() => setGuestPrompt(false)}
        />
      )}
      <BottomNav activeHref="/home" />
    </div>
  );
}
