export type SeatRole = "guest" | "artist" | "journalist" | "audience";

export type SeatUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: SeatRole;
};

export const SEAT_RANK: Record<SeatRole, number> = {
  guest: 0,
  artist: 1,
  journalist: 2,
  audience: 3,
};

export function sortSeats(seats: SeatUser[]): SeatUser[] {
  return [...seats].sort(
    (a, b) => SEAT_RANK[a.role ?? "audience"] - SEAT_RANK[b.role ?? "audience"]
  );
}

/** 3 hàng × 4–6 ghế. Dọc 5, ngang 6. */
export function seatGrid(seats: SeatUser[], landscape: boolean) {
  const cols = landscape ? 6 : 5;
  const max = cols * 3;
  const ordered = sortSeats(seats);
  const shown = ordered.slice(0, max);
  const hidden = Math.max(0, ordered.length - shown.length);
  const rows: SeatUser[][] = [];
  for (let r = 0; r < 3; r++) rows.push(shown.slice(r * cols, (r + 1) * cols));
  return { rows, hidden, cols };
}
