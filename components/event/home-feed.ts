import type { FollowEdge } from "./follow";
import { followingIds } from "./follow";
import type { JoinedLive } from "./joined-lives";
import type { EventPost } from "./types";

/**
 * Logic hiển thị Home (ẩn với user):
 * - Tường = mọi thông báo còn hạn, một cột cuộn.
 * - Không tách khu Live / quà / vé trên UI.
 * - sortHomePosts: đang live (mở phòng) → sắp live gần nhất → còn lại mới đăng.
 * - Còn hạn TƯỜNG HOME: kết thúc live + 72 giờ (hoặc đăng + 72 giờ với video ảnh).
 * - Permalink /p/{id} không theo hạn tường — link MXH vẫn mở.
 * - Bản gốc media có thể xóa sau 90 ngày; giữ poster + chữ.
 */
export const HOME_POST_EXTRA_MS = 72 * 60 * 60 * 1000;
export const ARCHIVE_ORIGINALS_MS = 90 * 24 * 60 * 60 * 1000;

export function postVisibleOnHome(post: EventPost, now = Date.now()): boolean {
  const start = +new Date(post.publishedAt || 0);
  if (Number.isFinite(start) && start > 0 && now < start) return false;
  const ended = post.liveEndedAt || (post.status === "ended" ? post.endsAt : undefined);
  if (!ended) return true;
  const until = +new Date(ended) + HOME_POST_EXTRA_MS;
  return Number.isFinite(until) && now <= until;
}

export function postExpiresAt(post: EventPost): Date | null {
  const ended = post.liveEndedAt || (post.status === "ended" ? post.endsAt : undefined);
  if (!ended) return null;
  const t = +new Date(ended);
  return Number.isFinite(t) ? new Date(t + HOME_POST_EXTRA_MS) : null;
}

/** BTC đã mở phòng trên tab Live. */
export function isLiveRoomOpen(post: EventPost): boolean {
  return post.status === "live";
}

/**
 * 1) đang live — không dùng rank cũ
 * 2) sắp live, gần startsAt nhất — không dùng rank cũ
 * 3) còn lại: đã tham gia → follow → mới đăng
 */
export function sortHomePosts(
  posts: EventPost[],
  opts?: { me: string; joined: JoinedLive[]; follows: FollowEdge[] }
): EventPost[] {
  const now = Date.now();
  const joinedIds = new Set((opts?.joined || []).map((j) => j.id));
  const fol = new Set(opts ? followingIds(opts.follows, opts.me) : []);

  function bucket(p: EventPost): number {
    if (isLiveRoomOpen(p)) return 0;
    const start = +new Date(p.startsAt);
    if (p.status === "upcoming" && Number.isFinite(start) && start >= now) return 1;
    return 2;
  }

  function restRank(p: EventPost): [number, number] {
    return [joinedIds.has(p.id) ? 0 : 1, fol.has(p.organizerId) ? 0 : 1];
  }

  return [...posts].sort((a, b) => {
    const ba = bucket(a);
    const bb = bucket(b);
    if (ba !== bb) return ba - bb;
    if (ba === 0) return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    if (ba === 1) return +new Date(a.startsAt) - +new Date(b.startsAt);
    const ra = restRank(a);
    const rb = restRank(b);
    if (ra[0] !== rb[0]) return ra[0] - rb[0];
    if (ra[1] !== rb[1]) return ra[1] - rb[1];
    return +new Date(b.publishedAt) - +new Date(a.publishedAt);
  });
}

export function filterHomeQuick(
  posts: EventPost[],
  mode: "all" | "hot" | "guest" | "famous"
): EventPost[] {
  if (mode === "hot") {
    return posts.filter((p) => p.kind === "gift" || p.joinAccess === "open");
  }
  if (mode === "guest") {
    return posts.filter(
      (p) => p.kind === "ticket" || p.ticketMode === "invite" || p.joinAccess === "ticket" || p.joinAccess === "invite"
    );
  }
  if (mode === "famous") {
    return posts
      .filter((p) => p.organizerRole === "artist" && postVisibleOnHome(p))
      .sort((a, b) => (b.watchingCount || 0) - (a.watchingCount || 0));
  }
  return posts;
}

export function searchHomePosts(posts: EventPost[], q: string): EventPost[] {
  const s = q.trim().toLowerCase();
  if (!s) return posts;
  return posts.filter((p) => {
    const blob = [
      p.title,
      p.description,
      p.organizerName,
      p.organizerId,
      p.venue,
      p.gift,
      ...(p.guests || []).map((g) => g.name),
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(s);
  });
}
