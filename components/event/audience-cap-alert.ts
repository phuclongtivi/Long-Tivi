export type CapAlertLevel = 90 | 93 | 95 | null;

export function capFillPct(inside: number, cap: number): number {
  if (!cap || cap <= 0) return 0;
  return Math.min(100, (Math.max(0, inside) / cap) * 100);
}

export function capAlertLevel(inside: number, cap: number): CapAlertLevel {
  const p = capFillPct(inside, cap);
  if (p >= 95) return 95;
  if (p >= 93) return 93;
  if (p >= 90) return 90;
  return null;
}

export function capAlertText(level: CapAlertLevel, inside: number, cap: number): string {
  if (!level) return "";
  const pct = Math.round(capFillPct(inside, cap));
  if (level >= 95) {
    return `Phòng đã ${pct}% (${inside}/${cap}). Tăng giới hạn khán giả ngay — thông báo này giữ đến khi bạn nâng trần.`;
  }
  return `Phòng đã ${pct}% (${inside}/${cap}). Sắp đầy — cân nhắc tăng giới hạn khán giả.`;
}
