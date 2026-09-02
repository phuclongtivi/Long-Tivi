/**
 * Deep link / payload chuyển khoản ngân hàng VN
 * Khi user tặng tiền mặt: mở app ngân hàng với thông tin đã điền sẵn
 * theo số TK + tên ngân hàng đã lưu trên dashboard của người nhận.
 */

export type BankTransferPayload = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  /** URL scheme / deep link nếu có */
  deepLink?: string;
  /** Chuỗi VietQR hoặc mô tả để app ngân hàng đọc */
  vietQrHint?: string;
};

/** Map tên ngân hàng phổ biến → BIN (VietQR) – rút gọn */
const BANK_BIN: Record<string, string> = {
  vietcombank: '970436',
  vcb: '970436',
  techcombank: '970407',
  tcb: '970407',
  bidv: '970418',
  vietinbank: '970415',
  ctg: '970415',
  mbbank: '970422',
  mb: '970422',
  acb: '970416',
  vpbank: '970432',
  tpbank: '970423',
  sacombank: '970403',
  shb: '970443',
  hdbank: '970437',
  vib: '970441',
};

function normalizeBankKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Tạo payload chuyển khoản từ thông tin ngân hàng người nhận trên app.
 */
export function buildBankTransferPayload(params: {
  recipientBankName: string;
  recipientAccountNumber: string;
  recipientAccountName: string;
  amount: number;
  transferContent: string;
}): BankTransferPayload {
  const { recipientBankName, recipientAccountNumber, recipientAccountName, amount, transferContent } =
    params;

  const key = normalizeBankKey(recipientBankName);
  const bin = BANK_BIN[key] || '';

  // Deep link dạng chung – nhiều app hỗ trợ mở với query; fallback là payload JSON
  // VietQR image URL pattern (ngân hàng có thể quét)
  const vietQrHint = bin
    ? `VietQR BIN=${bin} | STK=${recipientAccountNumber} | Số tiền=${amount} | ND=${transferContent}`
    : `STK=${recipientAccountNumber} | NH=${recipientBankName} | Số tiền=${amount} | ND=${transferContent}`;

  // Một số app hỗ trợ scheme (ví dụ); client sẽ chọn app ngân hàng của người gửi
  const deepLink = `https://dl.vietqr.io/pay?bank=${encodeURIComponent(
    recipientBankName
  )}&account=${encodeURIComponent(recipientAccountNumber)}&amount=${amount}&memo=${encodeURIComponent(
    transferContent
  )}`;

  return {
    bankName: recipientBankName,
    accountNumber: recipientAccountNumber,
    accountName: recipientAccountName,
    amount,
    content: transferContent,
    deepLink,
    vietQrHint,
  };
}
