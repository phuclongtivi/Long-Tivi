"use client";

import { LiveReelsTab } from "./LiveReelsTab";
import type { EventPost } from "./types";

/** Tab LIVE /events — Reels + Xem nhanh → cinema fullscreen. */
export function EventsLiveScreen({ posts }: { posts: EventPost[] }) {
  return <LiveReelsTab posts={posts} />;
}
