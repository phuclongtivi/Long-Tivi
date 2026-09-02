"use client";
import BottomNav from "@/components/BottomNav";
import { NotifyInbox } from "@/components/event/NotifyInbox";

export default function NotifyPage() {
  return (
    <main className="pl-page" style={{ minHeight: "100dvh", background: "transparent", color: "var(--pl-text)", padding: "14px 12px 104px" }}>
      <section className="pl-notify-shell pl-notify-pulse">
        <span className="pl-future-kicker">Signal Center</span>
        <h1 style={{ margin: "4px 0 6px", fontSize: 24 }}>Thông báo</h1>
        <p className="pl-muted" style={{ marginBottom: 12 }}>
          Live, chat, sự kiện, quà, gian hàng và AI được gom theo mức ưu tiên để user dễ tham gia.
        </p>
        <NotifyInbox />
      </section>
      <BottomNav activeHref="/notify" />
    </main>
  );
}
