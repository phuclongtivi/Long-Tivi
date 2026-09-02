/** Tên hiển thị + dòng CCCD mờ kiểu Notepad. */

export type UserPublicProfile = {
  displayName: string;
  legalFullName: string;
  idNumber: string;
  avatarUrl?: string;
};

/** Bỏ họ (từ đầu), giữ tên đệm + tên. */
export function middleAndGiven(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return parts.slice(1).join(" ");
}

export function last6Cccd(idNumber: string): string {
  const d = idNumber.replace(/\D/g, "");
  if (d.length < 6) return d.padStart(6, "•");
  return d.slice(-6);
}

/** [6 số cuối CCCD - tên đệm + tên] */
export function notepadIdLine(legalFullName: string, idNumber: string): string {
  const six = last6Cccd(idNumber) || "••••••";
  const rest = middleAndGiven(legalFullName) || "—";
  return `[${six} - ${rest}]`;
}

export const NOTEPAD_FONT =
  'Consolas, "Courier New", "Lucida Console", "Liberation Mono", monospace';
