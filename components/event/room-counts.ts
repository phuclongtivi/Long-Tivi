export type RoomCounts = {
  /** Đã vào phòng (tham gia / xem nhanh / có vé) */
  inside: number;
  /** Đang xem Reels / đứng ngoài, chưa vào phòng */
  watching: number;
};

export function formatRoomCounts(c?: RoomCounts | null): string {
  const inside = Math.max(0, c?.inside ?? 0);
  const watching = Math.max(0, c?.watching ?? 0);
  return `${inside} trong phòng · ${watching} đang xem`;
}
