"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { LiveReelsTab } from "@/components/event/LiveReelsTab";
import { ThemeToggle } from "@/components/event/ThemeToggle";
import { LiveActionBar, type LivePane } from "@/components/event/LiveActionBar";
import { OrganizerLiveDesk } from "@/components/event/OrganizerLiveDesk";
import { GiftWalletScreen } from "@/components/event/GiftWalletScreen";
import { ViewerCinemaScreen } from "@/components/event/ViewerCinemaScreen";
import type { EventPost } from "@/components/event/types";
import GuestAuthPrompt from "@/components/GuestAuthPrompt";
import { sessionAccount } from "@/components/event/account-links";
import { useLanguage } from "@/components/LanguageProvider";
import DeviceConnectPanel from "@/components/DeviceConnectPanel";
import SecondaryControlDock from "@/components/SecondaryControlDock";

const DEMO: EventPost[] = [
  {
    id: "live-open",
    organizerName: "Phúc Long Center",
    organizerRole: "admin",
    organizerId: "org-1",
    title: "Phòng Live đang phát",
    description: "Tab mặc định khi mở app",
    kind: "live",
    status: "live",
    startsAt: new Date().toISOString(),
    venue: "Online",
    guests: [],
    publishedAt: new Date().toISOString(),
    pinned: true,
    joinAccess: "open",
    insideCount: 18,
    watchingCount: 64,
  },
  {
    id: "live-2",
    organizerName: "Nghệ sỹ mẫu",
    organizerRole: "artist",
    organizerId: "org-2",
    title: "Đêm nhạc live",
    description: "Phòng thứ hai",
    kind: "live",
    status: "live",
    startsAt: new Date().toISOString(),
    venue: "Online",
    guests: [],
    publishedAt: new Date().toISOString(),
    joinAccess: "open",
    insideCount: 7,
    watchingCount: 21,
  },
];

export default function LiveLandingClient() {
  const { t, tf } = useLanguage();
  const [pane, setPane] = useState<LivePane>("lobby");
  const [cinema, setCinema] = useState<EventPost | null>(null);
  const [starting, setStarting] = useState(false);
  const [startMessage, setStartMessage] = useState('');
  const [needAuth, setNeedAuth] = useState(false);
  const liveRooms = useMemo(
    () => DEMO.filter((p) => p.status === "live" || p.kind === "live"),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const paneQ = q.get("pane");
    if (paneQ === "create") {
      if (!sessionAccount()) {
        setNeedAuth(true);
        setPane("lobby");
        return;
      }
      setPane("create");
      return;
    }
    if (paneQ === "cinema") {
      const pool = liveRooms.length ? liveRooms : DEMO;
      setCinema(pool[Math.floor(Math.random() * pool.length)]);
      setPane("cinema");
      return;
    }
    const id = q.get("enter");
    if (!id) return;
    const room = DEMO.find((p) => p.id === id) || liveRooms[0] || DEMO[0];
    if (!room) return;
    setCinema({ ...room, status: "live" });
    setPane("cinema");
  }, [liveRooms]);

  function pick(p: LivePane) {
    if (p === "cinema") {
      const pool = liveRooms.length ? liveRooms : DEMO;
      const room = pool[Math.floor(Math.random() * pool.length)];
      setCinema(room);
      setPane("cinema");
      return;
    }
    setCinema(null);
    setPane(p);
  }

  return (
    <main
      className="pl-page pl-future-shell"
      style={{
        minHeight: "100dvh",
        background: "transparent",
        color: "var(--pl-text)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 12px",
          background: "transparent",
        }}
      >
        <ThemeToggle />
      </div>
      <LiveActionBar
        active={pane}
        onPick={(p) => {
          if (p === "create" && !sessionAccount()) {
            setNeedAuth(true);
            return;
          }
          pick(p);
        }}
      />
      {needAuth && (
        <GuestAuthPrompt
          open
          reason="create-live"
          callbackUrl="/?pane=create"
          onClose={() => setNeedAuth(false)}
        />
      )}
      {pane === "create" && (
        <div style={{ padding: "8px 12px 104px" }}>
          <OrganizerLiveDesk
            post={{
              id: "quick-" + Date.now(),
              organizerName: t("quick_live_default_owner"),
              organizerRole: "artist",
              organizerId: "me",
              title: t("quick_live_title"),
              description: "",
              kind: "live",
              status: "live",
              startsAt: new Date().toISOString(),
              venue: "Online",
              guests: [],
              publishedAt: new Date().toISOString(),
              joinAccess: "open",
            }}
            inside={0}
            onStartLive={async (preset) => {
              if (starting) return;
              setStarting(true); setStartMessage(t('creating_live_room'));
              try {
                const owner = sessionAccount()?.displayName || 'User';
                const res = await fetch('/api/live/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: tf('live_title_of_user', { name: owner }), isPublic: true, requireIdCard: false, hasReward: false, mixerPreset: preset }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || t('live_room_create_failed'));
                setStartMessage(t('live_room_created'));
              } catch (e) { setStartMessage(e instanceof Error ? e.message : t('live_room_create_failed')); }
              finally { setStarting(false); }
            }}
          />
          {startMessage && <p style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>{startMessage}</p>}
        </div>
      )}
      {pane === "wallet" && <GiftWalletScreen />}
      {pane === "devices" && (
        <div style={{ padding: "10px 12px 104px" }}>
          <DeviceConnectPanel />
        </div>
      )}
      {pane === "xr" && (
        <div className="pl-xr-panel" style={{ margin: "10px 12px 104px" }}>
          <span className="pl-future-kicker">AR / VR / MR</span>
          <h2>Kết nối kính & không gian hiển thị</h2>
          <p>
            Entry point cho bản sửa code sắp tới: chuẩn bị floating panel cho live,
            chat, mixer, vật phẩm và mascot trên kính AR/MR.
          </p>
          <div className="pl-device-actions">
            <article><strong>AR trong suốt</strong><span>XREAL · VITURE · Rokid · RayNeo</span></article>
            <article><strong>MR passthrough</strong><span>Vision Pro · Quest · WebXR</span></article>
          </div>
        </div>
      )}
      {pane === "lobby" && <LiveReelsTab posts={DEMO} />}
      {pane === "cinema" && cinema && (
        <ViewerCinemaScreen
          post={cinema}
          seats={[{ id: "me", name: "Bạn" }]}
          keepTabBar
          onExit={() => {
            setCinema(null);
            setPane("lobby");
          }}
        />
      )}
      {(pane === "cinema" || pane === "lobby") && <SecondaryControlDock compact />}
      <BottomNav activeHref="/" />
    </main>
  );
}
