import type { FollowEdge } from "./follow";
import { followingIds } from "./follow";
import type { JoinedLive } from "./joined-lives";

export type LiveChatLine = {
  id: string;
  userId: string;
  name: string;
  text?: string;
  stickerUrl?: string;
  stickerName?: string;
  at: string;
};

/** Cùng rank phòng chat: đã tham gia sự kiện này → đang follow → mới hơn. */
export function sortLiveChatLines(
  lines: LiveChatLine[],
  opts: { me: string; roomId: string; joined: JoinedLive[]; follows: FollowEdge[] }
): LiveChatLine[] {
  const joinedHere = opts.joined.some((j) => j.id === opts.roomId);
  const fol = new Set(followingIds(opts.follows, opts.me));
  return [...lines].sort((a, b) => {
    const aj = joinedHere && a.userId !== opts.me ? 0 : 1;
    const bj = joinedHere && b.userId !== opts.me ? 0 : 1;
    if (aj !== bj) return aj - bj;
    const af = fol.has(a.userId) ? 0 : 1;
    const bf = fol.has(b.userId) ? 0 : 1;
    if (af !== bf) return af - bf;
    return +new Date(b.at) - +new Date(a.at);
  });
}

export function giftStickerLine(opts: {
  fromId: string;
  fromName: string;
  stickerUrl?: string;
  stickerName: string;
}): LiveChatLine {
  return {
    id: `stk-${Date.now()}`,
    userId: opts.fromId,
    name: opts.fromName,
    stickerUrl: opts.stickerUrl,
    stickerName: opts.stickerName,
    text: `đã tặng ${opts.stickerName}`,
    at: new Date().toISOString(),
  };
}
