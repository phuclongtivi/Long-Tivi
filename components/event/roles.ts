export type AppRole =
  | "guest"
  | "user"
  | "artist"
  | "journalist"
  | "admin"
  | "boss";

export const CAN_CREATE_EVENT: AppRole[] = [
  "artist",
  "journalist",
  "admin",
  "boss",
];

export function canCreateEvent(role: AppRole | undefined | null): boolean {
  return !!role && CAN_CREATE_EVENT.includes(role);
}

export function canEditOwnEvent(role: AppRole | undefined | null): boolean {
  return canCreateEvent(role);
}

export function canEditAnyEvent(role: AppRole | undefined | null): boolean {
  return role === "admin" || role === "boss";
}

export const ROLE_HINT: Record<AppRole, string> = {
  guest:
    "Đăng nhập và được nâng hạng (Nghệ sỹ / Phóng viên) để tạo sự kiện.",
  user:
    "Tài khoản thường chưa tạo được sự kiện. Liên hệ Admin/Boss để được nâng hạng Nghệ sỹ hoặc Phóng viên.",
  artist: "Bạn có thể tạo và sửa sự kiện của mình.",
  journalist: "Bạn có thể tạo Event từ dashboard Phóng viên.",
  admin: "Bạn có thể tạo, sửa và ghim sự kiện.",
  boss: "Toàn quyền tạo, sửa, ghim và gỡ sự kiện.",
};

/** AI của tài khoản boss được hành động thay boss (không giới hạn quota). */
export function bossAiMayAct(role?: AppRole | null): boolean {
  return role === "boss";
}

export const BOSS_AI_SCOPE = [
  "Duyệt / gỡ sự kiện, ghim feed",
  "Gửi sticker từ kho Boss",
  "Tăng trần khán giả, kết thúc live",
  "Gắn vận chuyển, xem đơn",
  "Không trừ điểm AI",
] as const;
