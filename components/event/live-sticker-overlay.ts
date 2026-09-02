/** Sticker trên livestream: vừa phải, không che mặt người biểu diễn. */
export const LIVE_STICKER = {
  maxWidthPct: 18,
  maxHeightPct: 18,
  /** Vùng cấm: 1/3 giữa trên (mặt/đầu) */
  faceSafe: { topPct: 8, heightPct: 36, leftPct: 28, widthPct: 44 },
  lanes: [
    { xPct: 6, yPct: 58 },
    { xPct: 76, yPct: 58 },
    { xPct: 8, yPct: 78 },
    { xPct: 74, yPct: 78 },
    { xPct: 42, yPct: 82 },
  ],
} as const;

export function overlaySlot(index: number) {
  const lane = LIVE_STICKER.lanes[index % LIVE_STICKER.lanes.length];
  return { ...lane, wPct: LIVE_STICKER.maxWidthPct, hPct: LIVE_STICKER.maxHeightPct };
}
