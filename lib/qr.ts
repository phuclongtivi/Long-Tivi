/**
 * Tạo payload QR riêng cho user
 * Dùng cho: tặng quà + tính hoa hồng giới thiệu
 */
export function buildUserQrPayload(userId: string, idNumber?: string | null) {
  const base = process.env.NEXTAUTH_URL || 'https://phuclong.app';
  return `${base}/u/${userId}?qr=1${idNumber ? `&cccd=${encodeURIComponent(idNumber)}` : ''}`;
}

/** Góc chèn QR trên video khi chia sẻ: top-left | top-right | bottom-left | bottom-right */
export type QrCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export function pickQrCorner(userId: string): QrCorner {
  const corners: QrCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h + userId.charCodeAt(i)) % 4;
  return corners[h];
}
