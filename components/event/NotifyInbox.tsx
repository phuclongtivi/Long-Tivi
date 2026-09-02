"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { isExpired, loadNotices } from "./notify-store";
import { ThemeToggle } from "./ThemeToggle";
import { AiMascot } from "./AiMascot";

export type NotifyItem = {
  id: string;
  title: string;
  body: string;
  at: string;
  href?: string;
  imageUrl?: string;
  kind?: string;
  expiresAt?: string;
  lane?: "latest" | "follow" | "gift" | "ticket" | "order";
  fromFollow?: boolean;
};

const DEMO: NotifyItem[] = [
  { id: "demo-new-1", lane: "latest", title: "Phiên live vừa mở", body: "Phúc Long Center đang phát trên tab Live.", at: new Date().toISOString(), href: "/" },
  { id: "demo-new-2", lane: "latest", title: "Đơn hàng cập nhật", body: "Đơn superBUY™ đang chờ xác nhận thanh toán.", at: new Date(Date.now() - 8 * 60_000).toISOString(), kind: "order", href: "/store" },
  { id: "demo-fol-1", fromFollow: true, title: "Tham gia sự kiện", body: "@NghệSỹA (bạn follow) vừa tham gia Đêm nhạc có vé.", at: new Date(Date.now() - 12 * 60_000).toISOString(), kind: "follow", href: "/home" },
  { id: "demo-fol-2", fromFollow: true, title: "Mua hàng", body: "@PhóngViênB vừa mua Sticker Level 1 trên superBUY™.", at: new Date(Date.now() - 20 * 60_000).toISOString(), kind: "order", href: "/store" },
  { id: "demo-fol-3", fromFollow: true, title: "Tặng quà", body: "@BạnC tặng sticker Gấu trà sữa trong phòng live.", at: new Date(Date.now() - 30 * 60_000).toISOString(), kind: "gift", href: "/" },
  { id: "demo-fol-4", fromFollow: true, title: "Follow mới", body: "@NghệSỹA vừa follow @MC Phúc.", at: new Date(Date.now() - 40 * 60_000).toISOString(), kind: "follow" },
];

function isFollowLane(n: NotifyItem): boolean {
  if (n.fromFollow) return true;
  if (n.lane === "follow") return true;
  return n.kind === "follow" && !!n.body?.includes("follow");
}

export function NotifyInbox({
  followNotices = [],
  giftFeedNotices = [],
  ticketFeedNotices = [],
  orderNotices = [],
}: {
  followNotices?: NotifyItem[];
  giftFeedNotices?: NotifyItem[];
  ticketFeedNotices?: NotifyItem[];
  orderNotices?: NotifyItem[];
}) {
  const [stored, setStored] = useState<NotifyItem[]>([]);
  const [open, setOpen] = useState<NotifyItem | null>(null);

  useEffect(() => {
    setStored(loadNotices());
  }, []);

  const all = useMemo(() => {
    const merged = [...stored, ...orderNotices, ...followNotices, ...giftFeedNotices, ...ticketFeedNotices];
    const seen = new Set<string>();
    const live = merged
      .filter((n) => n && n.id && !isExpired(n))
      .filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)))
      .sort((a, b) => Date.parse(b.at || "0") - Date.parse(a.at || "0"));
    return live.length ? live : DEMO;
  }, [stored, orderNotices, followNotices, giftFeedNotices, ticketFeedNotices]);

  const followPane = all.filter(isFollowLane);
  const latestPane = all.filter((n) => !isFollowLane(n));

  return (
    <div className="pl-page" style={{ minHeight: "100dvh", background: "transparent", color: "var(--pl-text)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Link href="/" style={{ color: "var(--pl-text)", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
          ← Home
        </Link>
        <h1 style={{ flex: 1, margin: 0 }}>Thông báo</h1>
        <AiMascot kind="round" size={36} />
        <ThemeToggle />
      </header>

      <Lane title="Mới nhất" items={latestPane} onOpen={setOpen} />
      <Lane title="Từ người bạn follow" hint="Tham gia sự kiện · mua hàng · tặng quà · follow" items={followPane} onOpen={setOpen} />

      {open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "grid", alignItems: "end", zIndex: 50, paddingBottom: 88 }}
          onClick={() => setOpen(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ height: "46vh", background: "var(--pl-bg)", color: "var(--pl-text)", borderRadius: "20px 20px 0 0", padding: 16, overflow: "auto", border: "1px solid var(--pl-frame)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{open.title}</h3>
              <button type="button" onClick={() => setOpen(null)} style={{ background: "none", border: "none", color: "var(--pl-text)", fontSize: 22 }}>×</button>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.5 }}>{open.body}</p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>{open.at}</p>
            {open.href && (
              <Link href={open.href} style={{ color: "var(--pl-text)", fontWeight: 700, fontSize: 15 }}>Mở →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Lane({ title, hint, items, onOpen }: { title: string; hint?: string; items: NotifyItem[]; onOpen: (n: NotifyItem) => void }) {
  return (
    <section
      className="pl-notify-lane"
      style={{
        marginBottom: 16,
        border: "1px solid rgba(37,99,235,.18)",
        borderRadius: 8,
        padding: 12,
        background: "linear-gradient(135deg, rgba(255,255,255,.92), rgba(229,246,255,.78))",
        color: "var(--pl-text)",
        minHeight: 160,
        boxShadow: "0 14px 34px rgba(37,99,235,.12)",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: "var(--pl-text)" }}>{title}</div>
      {hint ? <p style={{ margin: "0 0 10px", fontSize: 13, opacity: 0.75, color: "var(--pl-text)" }}>{hint}</p> : null}
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>Chưa có thông báo.</p>
      ) : (
        items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onOpen(n)}
            style={{
              width: "100%",
              textAlign: "left",
              display: "block",
              padding: "10px 6px",
              marginBottom: 4,
              border: "none",
              borderBottom: "1px solid rgba(37,99,235,.14)",
              background: "rgba(255,255,255,.54)",
              color: "var(--pl-text)",
              cursor: "pointer",
              borderRadius: 8,
            }}
          >
            <span style={{ display: "block", fontWeight: 700, fontSize: 16, color: "var(--pl-text)" }}>{n.title}</span>
            <span style={{ display: "block", fontSize: 14, opacity: 0.85, marginTop: 2, color: "var(--pl-text)" }}>{n.body}</span>
          </button>
        ))
      )}
    </section>
  );
}
