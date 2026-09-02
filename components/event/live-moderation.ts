/** AI admin (DeepSeek) — vi phạm nội quy phòng live. */

export const MOD_STORE = "pl.live-moderation.v1";
export const CLOSE_GRACE_MS = 15 * 60 * 1000;

export type ModVerdict = {
  violate: boolean;
  reason: string;
  rule: string;
  severity: "warn" | "close15" | "closeNow";
};

export type ModCase = {
  roomId: string;
  organizerName?: string;
  verdict: ModVerdict;
  evidenceUrl?: string;
  requestedAt: string;
  deadlineAt: string;
  closedAt?: string;
  closedBy?: "user" | "ai-boss";
  emailedBoss?: boolean;
};

export function loadCases(): ModCase[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MOD_STORE) || "[]") as ModCase[];
  } catch {
    return [];
  }
}

export function saveCases(list: ModCase[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOD_STORE, JSON.stringify(list));
}

export function openCaseForRoom(roomId: string): ModCase | undefined {
  return loadCases()
    .filter((c) => c.roomId === roomId && !c.closedAt)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
}

export function upsertCase(next: ModCase) {
  const list = loadCases().filter((c) => !(c.roomId === next.roomId && !c.closedAt));
  list.push(next);
  saveCases(list);
  return next;
}

export function markClosed(roomId: string, by: "user" | "ai-boss") {
  const list = loadCases().map((c) =>
    c.roomId === roomId && !c.closedAt
      ? { ...c, closedAt: new Date().toISOString(), closedBy: by }
      : c
  );
  saveCases(list);
}

export function remainMs(c: ModCase): number {
  return new Date(c.deadlineAt).getTime() - Date.now();
}

export function isRoomHiddenFromReel(roomId: string): boolean {
  const c = openCaseForRoom(roomId);
  if (!c) return false;
  return c.verdict.severity === "closeNow" || c.verdict.rule === "junk";
}

export function isRoomNoticeOnly(roomId: string): boolean {
  const c = openCaseForRoom(roomId);
  return !!(c && c.verdict.violate && !isRoomHiddenFromReel(roomId));
}

export async function scanLiveRoom(opts: {
  roomId: string;
  organizerName?: string;
  caption?: string;
  inside?: number;
  watching?: number;
  rules?: string[];
}) {
  const crowd = (opts.inside || 0) + (opts.watching || 0);
  const empty = crowd < 1;
  const caption = [
    opts.caption || "",
    empty ? "Phòng mở cho có, không người, không hoạt động." : `Đang có ${crowd} người.`,
  ].join(" ");
  try {
    const res = await fetch("/api/live/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: opts.roomId,
        organizerName: opts.organizerName,
        rules: opts.rules || [
          "Cấm khiêu dâm.",
          "Cấm chửi tục nặng.",
          "Cấm phòng rác: mở không người / không hoạt động.",
        ],
        caption,
      }),
    });
    const json = await res.json();
    const verdict = json.verdict || { violate: false, reason: "", rule: "", severity: "warn" };
    if (empty && !verdict.violate) {
      verdict.violate = true;
      verdict.rule = "junk";
      verdict.severity = "closeNow";
      verdict.reason = "Phòng rác: không người / không hoạt động.";
    }
    if (verdict.violate) {
      upsertCase({
        roomId: opts.roomId,
        organizerName: opts.organizerName,
        verdict,
        requestedAt: new Date().toISOString(),
        deadlineAt: new Date(Date.now() + CLOSE_GRACE_MS).toISOString(),
      });
    }
    return verdict;
  } catch {
    if (empty) {
      upsertCase({
        roomId: opts.roomId,
        organizerName: opts.organizerName,
        verdict: {
          violate: true,
          reason: "Phòng rác (offline scan).",
          rule: "junk",
          severity: "closeNow",
        },
        requestedAt: new Date().toISOString(),
        deadlineAt: new Date(Date.now() + CLOSE_GRACE_MS).toISOString(),
      });
    }
    return null;
  }
}
