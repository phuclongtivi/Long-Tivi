"use client";

import { formatRoomCounts, type RoomCounts } from "./room-counts";

export function RoomCountsLabel({
  counts,
  compact,
}: {
  counts?: RoomCounts | null;
  compact?: boolean;
}) {
  const text = formatRoomCounts(counts);
  return (
    <span
      style={{
        fontSize: compact ? 10 : 12,
        fontWeight: 700,
        opacity: 0.8,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}
