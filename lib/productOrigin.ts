/**
 * AI Admin rà soát sản phẩm do pháp nhân sản xuất → dấu tick đỏ
 * Nghệ sĩ bổ sung Chứng nhận xuất xứ + công bố chất lượng trong 3 ngày làm việc
 */

const LEGAL_HINTS =
  /\b(công ty|cty|tnhh|cp|cổ phần|nhà máy|xưởng|factory|ltd|llc|corp|jsc|sản xuất bởi|manufactured by)\b/i;

/** +n ngày làm việc (bỏ T7 CN) */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return d;
}

export function detectLegalEntityProduct(input: {
  manufacturerName?: string | null;
  brand?: string | null;
  description?: string | null;
  name?: string | null;
}): boolean {
  const blob = [input.manufacturerName, input.brand, input.description, input.name]
    .filter(Boolean)
    .join(' ');
  if (input.manufacturerName && input.manufacturerName.trim().length > 2) return true;
  return LEGAL_HINTS.test(blob);
}

export function originWarningFields(isLegal: boolean, hasCert: boolean) {
  if (!isLegal || hasCert) {
    return {
      isLegalEntityProduct: isLegal,
      originWarning: false,
      originWarningAt: null as Date | null,
      originDeadline: null as Date | null,
    };
  }
  const now = new Date();
  return {
    isLegalEntityProduct: true,
    originWarning: true,
    originWarningAt: now,
    originDeadline: addBusinessDays(now, 3),
  };
}
