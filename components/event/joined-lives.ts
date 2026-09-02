const KEY = "pl-joined-lives";

export type JoinedLive = {
  id: string;
  title: string;
  organizerName: string;
  joinedAt: string;
  insideCount?: number;
  watchingCount?: number;
};

export function readJoined(): JoinedLive[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]") as JoinedLive[];
  } catch {
    return [];
  }
}

/** Tối đa 3 sự kiện đã bấm Tham gia — mới nhất trước. */
export function joinLive(row: JoinedLive): JoinedLive[] {
  const next = [row, ...readJoined().filter((x) => x.id !== row.id)].slice(0, 3);
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function topJoined(n = 3): JoinedLive[] {
  return readJoined().slice(0, n);
}
