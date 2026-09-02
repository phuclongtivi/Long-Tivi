"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { InViewGate } from "./InViewGate";
import type { EventPost } from "./types";
import { joinLive, topJoined, type JoinedLive } from "./joined-lives";
import { joinButtonLabel, resolveJoinAccess } from "./join-cta";
import { LiveTapChatOverlay } from "./LiveTapChatOverlay";
import { AiIdlePresence } from "./AiIdlePresence";
import { DEFAULT_COMPANION, type AiCompanion } from "./ai-companion";
import { RoomCountsLabel } from "./RoomCountsLabel";
import { ViewerCinemaScreen } from "./ViewerCinemaScreen";
import { LiveThemePlayer } from "./LiveThemePlayer";
import { LiveRoomChat } from "./LiveRoomChat";
import { CloseCountdownBanner } from "./CloseCountdownBanner";
import { ZoomStageOverlay } from "./ZoomStageOverlay";
import { EventNoticeWallCard } from "./EventNoticeWallCard";
import { LongLiveMark } from "./LongLiveMark";
import { FlipCinemaStage } from "./FlipCinemaStage";
import type { EventNoticeFields } from "./event-notice";
import {
  isRoomHiddenFromReel,
  isRoomNoticeOnly,
  scanLiveRoom,
} from "./live-moderation";

type Props = {
  posts: EventPost[];
  videoSrcFor?: (post: EventPost) => string | undefined;
  onBuyTicket?: (post: EventPost) => void;
};

function organizerNotice(p: EventPost): string {
  const extra = (p as EventPost & { organizerNotice?: string }).organizerNotice;
  if (extra && extra.trim()) return extra.trim();
  if (p.description && p.description.trim()) return p.description.trim();
  return "Thông báo tổ chức sẽ hiện ở đây. Mua vé để vào phòng xem video đầy đủ.";
}

function isTicketed(p: EventPost): boolean {
  const a = resolveJoinAccess(p);
  return a === "ticket" || a === "invite";
}

function LiveReelsTabInner({ posts, videoSrcFor, onBuyTicket }: Props) {
  const [joined, setJoined] = useState<JoinedLive[]>([]);
  const [phuc, setPhuc] = useState<AiCompanion>(DEFAULT_COMPANION);
  const [cinema, setCinema] = useState<EventPost | null>(null);
  const liveNow = useMemo(
    () =>
      posts
        .filter((p) => p.status === "live" || p.kind === "live")
        .filter((p) => !isRoomHiddenFromReel(p.id))
        .sort((a, b) => {
          const ca = (a.insideCount || 0) + (a.watchingCount || 0);
          const cb = (b.insideCount || 0) + (b.watchingCount || 0);
          if (cb !== ca) return cb - ca;
          return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        }),
    [posts]
  );

  useEffect(() => {
    setJoined(topJoined(3));
  }, []);

  useEffect(() => {
    liveNow.slice(0, 8).forEach((p) => {
      void scanLiveRoom({
        roomId: p.id,
        organizerName: p.organizerName,
        caption: p.title + " " + (p.description || ""),
        inside: p.insideCount,
        watching: p.watchingCount,
      });
    });
  }, [liveNow]);

  const onJoin = useCallback((p: EventPost) => {
    setJoined(
      joinLive({
        id: p.id,
        title: p.title,
        organizerName: p.organizerName,
        joinedAt: new Date().toISOString(),
      })
    );
    setCinema(p);
  }, []);

  return (
    <div className="pl-future-shell" style={{ paddingBottom: 104 }}>
      <LiveThemePlayer playing={!cinema} />
      {cinema && (
        <>
          <CloseCountdownBanner roomId={cinema.id} />
          <ViewerCinemaScreen
            post={cinema}
            seats={[{ id: "me", name: "Bạn" }]}
            videoSrc={videoSrcFor?.(cinema)}
            onExit={() => setCinema(null)}
          />
        </>
      )}
      <section style={{ padding: "10px 12px 8px" }}>
        <div className="pl-future-kicker" style={{ marginBottom: 8 }}>Đã tham gia</div>
        <div>
          {[0, 1, 2].map((i) => {
            const row = joined[i];
            return (
              <a
                key={i}
                href={row ? `/events/${row.id}` : undefined}
                className="pl-joined-cell"
                style={{
                  display: "inline-block",
                  width: "31%",
                  marginRight: "2%",
                  minHeight: 54,
                  borderRadius: 16,
                  padding: 8,
                  textDecoration: "none",
                  color: "var(--pl-text)",
                  fontSize: 12,
                  lineHeight: 1.3,
                  verticalAlign: "top",
                }}
              >
                {row ? (
                  <>
                    <div
                      style={{
                        fontWeight: 800,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.title}
                    </div>
                    <RoomCountsLabel
                      compact
                      counts={{ inside: row.insideCount ?? 0, watching: row.watchingCount ?? 0 }}
                    />
                    <div style={{ color: "var(--pl-muted,#C5D0E8)" }}>
                      @{row.organizerName.replace(/^@/, "")}
                    </div>
                  </>
                ) : (
                  <span style={{ color: "#aaa" }}>—</span>
                )}
              </a>
            );
          })}
        </div>
      </section>

      <FlipCinemaStage rooms={liveNow} videoSrcFor={videoSrcFor} onEnter={onJoin} />
    </div>
  );
}

export const LiveReelsTab = memo(LiveReelsTabInner, (a, b) => {
  if (a.posts === b.posts && a.videoSrcFor === b.videoSrcFor && a.onBuyTicket === b.onBuyTicket) return true;
  if (a.posts.length !== b.posts.length) return false;
  return a.posts.every(
    (p, i) =>
      p.id === b.posts[i]?.id &&
      p.status === b.posts[i]?.status &&
      p.insideCount === b.posts[i]?.insideCount
  );
});
