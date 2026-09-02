/** Nội quy phòng — gắn trên Dashboard người dùng. AI admin đọc bản này. */

export const ROOM_RULES_KEY = "pl.room-rules.v1";

export const DEFAULT_ROOM_RULES = [
  "Cấm phát video khiêu dâm trong phòng live.",
  "Cấm phát tán hình ảnh khiêu dâm.",
  "Cấm nội dung xâm hại trẻ em — đóng ngay, không đếm 15 phút.",
  "Tôn trọng khách mời và khán giả; không quấy rối.",
];

export type RoomRulesDoc = {
  userId?: string;
  roomId?: string;
  rules: string[];
  updatedAt: string;
};

export function loadRoomRules(): RoomRulesDoc {
  if (typeof window === "undefined") {
    return { rules: DEFAULT_ROOM_RULES, updatedAt: "" };
  }
  try {
    const raw = localStorage.getItem(ROOM_RULES_KEY);
    if (!raw) return { rules: DEFAULT_ROOM_RULES.slice(), updatedAt: "" };
    const d = JSON.parse(raw) as RoomRulesDoc;
    if (!d.rules || !d.rules.length) d.rules = DEFAULT_ROOM_RULES.slice();
    return d;
  } catch {
    return { rules: DEFAULT_ROOM_RULES.slice(), updatedAt: "" };
  }
}

export function saveRoomRules(doc: RoomRulesDoc) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    ROOM_RULES_KEY,
    JSON.stringify({ ...doc, updatedAt: new Date().toISOString() })
  );
}

export function rulesText(doc?: RoomRulesDoc): string {
  return (doc || loadRoomRules()).rules.join("\n");
}
