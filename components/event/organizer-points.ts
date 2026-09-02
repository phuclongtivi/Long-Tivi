/** Điểm tổ chức: được âm; tối đa 2 sự kiện liên tiếp khi đang âm. */

export const MAX_NEGATIVE_EVENTS_IN_A_ROW = 2;

export type OrganizerPointWallet = {
  userId: string;
  /** Có thể âm */
  balance: number;
  /** Số sự kiện đã đăng liên tiếp khi balance < 0 (sau khi trừ phí) */
  negativeEventStreak: number;
};

export function needLine(points: number): string {
  return `Bạn cần có ${points.toLocaleString("vi-VN")} điểm sticker`;
}

export function canCreateWhileNegative(wallet: OrganizerPointWallet): boolean {
  if (wallet.balance >= 0) return true;
  return wallet.negativeEventStreak < MAX_NEGATIVE_EVENTS_IN_A_ROW;
}

export function applyOrgFee(
  wallet: OrganizerPointWallet,
  fee: number
): { wallet: OrganizerPointWallet; allowed: boolean; reason?: string } {
  if (fee <= 0) {
    return {
      wallet: {
        ...wallet,
        negativeEventStreak: wallet.balance < 0 ? wallet.negativeEventStreak : 0,
      },
      allowed: true,
    };
  }
  const nextBal = wallet.balance - fee;
  const goingNegative = nextBal < 0;
  const streakIfNeg = goingNegative
    ? (wallet.balance < 0 ? wallet.negativeEventStreak + 1 : 1)
    : 0;
  if (goingNegative && streakIfNeg > MAX_NEGATIVE_EVENTS_IN_A_ROW) {
    return {
      wallet,
      allowed: false,
      reason: `Đang âm điểm — chỉ được tổ chức ${MAX_NEGATIVE_EVENTS_IN_A_ROW} sự kiện liên tiếp. Mua sticker trên superBUY hoặc chờ Boss/Admin gửi quà.`,
    };
  }
  return {
    allowed: true,
    wallet: {
      ...wallet,
      balance: nextBal,
      negativeEventStreak: goingNegative ? streakIfNeg : 0,
    },
  };
}

/** Sticker về kho → trừ nợ trước, phần dư cộng điểm. */
export function creditStickersAgainstDebt(
  wallet: OrganizerPointWallet,
  incomingPoints: number
): OrganizerPointWallet {
  const pts = Math.max(0, incomingPoints);
  const next = wallet.balance + pts;
  return {
    ...wallet,
    balance: next,
    negativeEventStreak: next < 0 ? wallet.negativeEventStreak : 0,
  };
}

export const STICKER_BILL_HINT =
  "Bill mua sticker: điền @Username + số lượng sticker + loại 1 / 2 / 3. Hoàn tất sẽ quay lại form khởi tạo sự kiện.";
