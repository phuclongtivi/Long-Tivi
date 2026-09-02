/**
 * Deep link mở app / trang ngân hàng theo thông tin user đã kê khai khi đăng ký
 */

import { buildBankTransferPayload } from '@/lib/bankTransfer';

export function userBankCheckUrl(params: {
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  amount?: number;
  content?: string;
}): string | null {
  if (!params.bankName || !params.accountNumber) return null;
  const payload = buildBankTransferPayload({
    recipientBankName: params.bankName,
    recipientAccountNumber: params.accountNumber,
    recipientAccountName: params.accountName || params.bankName,
    amount: params.amount && params.amount > 0 ? params.amount : 0,
    transferContent: params.content || 'Kiem tra so du Phuc Long Center',
  });
  return payload.deepLink || null;
}

/** Map tên NH → trang tra cứu / app phổ biến (fallback) */
export function bankAppHint(bankName?: string | null): string {
  if (!bankName) return 'Mở app ngân hàng bạn đã đăng ký trên dashboard';
  return `Mở app ${bankName} hoặc quét VietQR để đối chiếu giao dịch trên app Long`;
}
