import type { FollowEdge } from "./follow";
import { followingIds } from "./follow";
import type { JoinedLive } from "./joined-lives";

export type ChatRoom = {
  id: string;
  title: string;
  preview?: string;
  liveSessionId?: string;
  memberIds: string[];
  isLive?: boolean;
  updatedAt: string;
  insideCount?: number;
  watchingCount?: number;
};

export function sortChatRooms(
  rooms: ChatRoom[],
  opts: { me: string; joined: JoinedLive[]; follows: FollowEdge[] }
): ChatRoom[] {
  const joinedIds = new Set(opts.joined.map((j) => j.id));
  const fol = new Set(followingIds(opts.follows, opts.me));

  function rank(r: ChatRoom): [number, number, number] {
    const joined = r.liveSessionId && joinedIds.has(r.liveSessionId) ? 0 : 1;
    const hasFollow = r.memberIds.some((id) => fol.has(id)) ? 0 : 1;
    const live = r.isLive ? 0 : 1;
    return [joined, hasFollow, live];
  }

  return [...rooms].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) {
      if (ra[i] !== rb[i]) return ra[i] - rb[i];
    }
    return +new Date(b.updatedAt) - +new Date(a.updatedAt);
  });
}
