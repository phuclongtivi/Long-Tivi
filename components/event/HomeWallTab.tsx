"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { PhotoReelComposer } from "./PhotoReelComposer";
import { PhotoReelWallCard } from "./PhotoReelWallCard";
import { visiblePhotoReels, type PhotoReel } from "./photo-reels";
import type { EventPost } from "./types";
import type { FollowEdge } from "./follow";
import type { JoinedLive } from "./joined-lives";
import { filterHomeQuick, postVisibleOnHome, searchHomePosts, sortHomePosts } from "./home-feed";
import { HomeQuickBar, type HomeQuickFilter } from "./HomeQuickBar";
import { EventWallPost } from "./EventWallPost";
import { InViewGate } from "./InViewGate";
import GlobalHomeChat from "@/components/GlobalHomeChat";
import { useLanguage } from "@/components/LanguageProvider";

const WallItem = memo(function WallItem({
  post,
  following,
  onFollow,
  onOpen,
  isLoggedIn,
}: {
  post: EventPost;
  following: boolean;
  onFollow?: (organizerId: string) => void;
  onOpen?: (p: EventPost) => void;
  isLoggedIn: boolean;
}) {
  const follow = useCallback(() => onFollow?.(post.organizerId), [onFollow, post.organizerId]);
  return (
    <InViewGate height={220}>
      <EventWallPost post={post} following={following} onFollow={follow} onOpen={onOpen} isLoggedIn={isLoggedIn} />
    </InViewGate>
  );
});

function HomeWallTabInner({
  posts,
  me = "me",
  joined = [],
  follows = [],
  followingIds = [],
  isLoggedIn = false,
  onFollow,
  onOpen,
}: {
  posts: EventPost[];
  me?: string;
  joined?: JoinedLive[];
  follows?: FollowEdge[];
  followingIds?: string[];
  isLoggedIn?: boolean;
  onFollow?: (organizerId: string) => void;
  onOpen?: (p: EventPost) => void;
}) {
  const { t } = useLanguage();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<HomeQuickFilter>("all");
  const [compose, setCompose] = useState(false);
  const [reels, setReels] = useState<PhotoReel[]>([]);
  useEffect(() => {
    setReels(visiblePhotoReels());
  }, []);
  const list = useMemo(() => {
    const vis = posts.filter((p) => postVisibleOnHome(p));
    const sorted = sortHomePosts(vis, { me, joined, follows });
    return searchHomePosts(filterHomeQuick(sorted, filter), q);
  }, [posts, me, joined, follows, q, filter]);

  const onSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value), []);

  return (
    <div className="pl-scroll pl-page pl-future-shell">
      <HomeQuickBar
        filter={filter}
        onFilter={setFilter}
        onCreate={() => {
          window.dispatchEvent(new CustomEvent("pl-need-auth", { detail: { next: "/events/create" } }));
        }}
        onCam={() => setCompose(true)}
        onRap={() => {
          window.location.href = "/?pane=cinema";
        }}
      />
      <input
        className="pl-search-input"
        value={q}
        onChange={onSearch}
        placeholder={t('home_search_placeholder')}
        style={{
          width: "100%",
          height: 44,
          borderRadius: 22,
          padding: "0 16px",
          marginBottom: 12,
          color: "var(--pl-text,#F4F7FB)",
          fontSize: 14,
        }}
      />
      <GlobalHomeChat isLoggedIn={isLoggedIn} />
      {compose ? (
        <PhotoReelComposer
          author={me}
          onPosted={(r) => {
            setReels((xs) => [r, ...xs]);
            setCompose(false);
          }}
          onClose={() => setCompose(false)}
        />
      ) : null}
      {reels.map((r) => (
        <PhotoReelWallCard key={r.id} reel={r} me={me} />
      ))}
      {list.map((p) => (
        <WallItem
          key={p.id}
          post={p}
          following={followingIds.includes(p.organizerId)}
          onFollow={onFollow}
          onOpen={onOpen}
          isLoggedIn={isLoggedIn}
        />
      ))}
      {!list.length && (
        <p style={{ textAlign: "center", opacity: 0.65, fontSize: 14 }}>
          {t('empty_home_events')}
        </p>
      )}
    </div>
  );
}

export const HomeWallTab = memo(HomeWallTabInner);
