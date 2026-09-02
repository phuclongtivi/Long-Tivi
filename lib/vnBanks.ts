/**
 * Danh sách ngân hàng đang hoạt động tại Việt Nam
 * (phạm vi chọn giống form thanh toán Shopee / VietQR NAPAS)
 */

export type VnBank = {
  code: string;
  name: string;
  shortName: string;
  bin?: string;
};

export const VN_BANKS: VnBank[] = [
  { code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)', bin: '970436' },
  { code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)', bin: '970407' },
  { code: 'MB', shortName: 'MB Bank', name: 'Ngân hàng TMCP Quân đội (MB Bank)', bin: '970422' },
  { code: 'VIB', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam (VIB)', bin: '970441' },
  { code: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu (ACB)', bin: '970416' },
  { code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)', bin: '970432' },
  { code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng TMCP Tiên Phong (TPBank)', bin: '970423' },
  { code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)', bin: '970418' },
  { code: 'CTG', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)', bin: '970415' },
  { code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)', bin: '970403' },
  { code: 'SHB', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn – Hà Nội (SHB)', bin: '970443' },
  { code: 'HDB', shortName: 'HDBank', name: 'Ngân hàng TMCP Phát triển TP.HCM (HDBank)', bin: '970437' },
  { code: 'MSB', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam (MSB)', bin: '970426' },
  { code: 'OCB', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông (OCB)', bin: '970448' },
  { code: 'SCB', shortName: 'SCB', name: 'Ngân hàng TMCP Sài Gòn (SCB)', bin: '970429' },
  { code: 'SEA', shortName: 'SeABank', name: 'Ngân hàng TMCP Đông Nam Á (SeABank)', bin: '970440' },
  { code: 'LPB', shortName: 'LienVietPostBank', name: 'Ngân hàng TMCP Bưu điện Liên Việt (LienVietPostBank)', bin: '970449' },
  { code: 'VAB', shortName: 'VietABank', name: 'Ngân hàng TMCP Việt Á (VietABank)', bin: '970427' },
  { code: 'BAB', shortName: 'BacABank', name: 'Ngân hàng TMCP Bắc Á (BacABank)', bin: '970409' },
  { code: 'NAB', shortName: 'Nam A Bank', name: 'Ngân hàng TMCP Nam Á (Nam A Bank)', bin: '970428' },
  { code: 'PGB', shortName: 'PG Bank', name: 'Ngân hàng TMCP Xăng dầu Petrolimex (PG Bank)', bin: '970430' },
  { code: 'BVB', shortName: 'BaoVietBank', name: 'Ngân hàng TMCP Bảo Việt (BaoVietBank)', bin: '970438' },
  { code: 'VIETBANK', shortName: 'VietBank', name: 'Ngân hàng TMCP Việt Nam Thương Tín (VietBank)', bin: '970433' },
  { code: 'KLB', shortName: 'KienlongBank', name: 'Ngân hàng TMCP Kiên Long (KienlongBank)', bin: '970452' },
  { code: 'ABB', shortName: 'ABBank', name: 'Ngân hàng TMCP An Bình (ABBank)', bin: '970425' },
  { code: 'PVCOM', shortName: 'PVcomBank', name: 'Ngân hàng TMCP Đại Chúng Việt Nam (PVcomBank)', bin: '970412' },
  { code: 'NCB', shortName: 'NCB', name: 'Ngân hàng TMCP Quốc Dân (NCB)', bin: '970419' },
  { code: 'EXB', shortName: 'Eximbank', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam (Eximbank)', bin: '970431' },
  { code: 'SGB', shortName: 'Saigonbank', name: 'Ngân hàng TMCP Sài Gòn Công Thương (Saigonbank)', bin: '970400' },
  { code: 'VCCB', shortName: 'Viet Capital Bank', name: 'Ngân hàng TMCP Bản Việt (Viet Capital Bank)', bin: '970454' },
  { code: 'GPB', shortName: 'GPBank', name: 'Ngân hàng TMCP Dầu khí Toàn Cầu (GPBank)', bin: '970408' },
  { code: 'VRB', shortName: 'VRB', name: 'Ngân hàng Liên doanh Việt – Nga (VRB)', bin: '970421' },
  { code: 'IVB', shortName: 'Indovina Bank', name: 'Ngân hàng TNHH Indovina (Indovina Bank)', bin: '970434' },
  { code: 'WVN', shortName: 'Woori Bank', name: 'Ngân hàng TNHH MTV Woori Việt Nam', bin: '970457' },
  { code: 'SHBVN', shortName: 'Shinhan Bank', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', bin: '970424' },
  { code: 'HLB', shortName: 'Hong Leong Bank', name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam', bin: '970442' },
  { code: 'UOB', shortName: 'UOB', name: 'Ngân hàng TNHH MTV United Overseas Bank Việt Nam', bin: '970458' },
  { code: 'HSBC', shortName: 'HSBC', name: 'Ngân hàng TNHH MTV HSBC (Việt Nam)', bin: '458761' },
  { code: 'SCVN', shortName: 'Standard Chartered', name: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam', bin: '970410' },
  { code: 'CITI', shortName: 'Citibank', name: 'Ngân hàng Citibank Việt Nam', bin: '533948' },
  { code: 'PBVN', shortName: 'Public Bank', name: 'Ngân hàng TNHH MTV Public Việt Nam', bin: '970439' },
  { code: 'CIMB', shortName: 'CIMB', name: 'Ngân hàng TNHH MTV CIMB Việt Nam', bin: '422589' },
  { code: 'DBS', shortName: 'DBS Bank', name: 'DBS Bank Ltd - Chi nhánh TP.HCM', bin: '796500' },
  { code: 'COOP', shortName: 'Co-opBank', name: 'Ngân hàng Hợp tác xã Việt Nam (Co-opBank)', bin: '970446' },
  { code: 'AGRIBANK', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)', bin: '970405' },
  { code: 'VBSP', shortName: 'NHCSXH', name: 'Ngân hàng Chính sách Xã hội (VBSP)', bin: '999888' },
  { code: 'VDB', shortName: 'VDB', name: 'Ngân hàng Phát triển Việt Nam (VDB)', bin: '970455' },
];

export function findBankByName(name: string | null | undefined): VnBank | undefined {
  if (!name) return undefined;
  const n = name.toLowerCase();
  return VN_BANKS.find(
    (b) =>
      b.name.toLowerCase() === n ||
      b.shortName.toLowerCase() === n ||
      b.code.toLowerCase() === n ||
      b.name.toLowerCase().includes(n) ||
      n.includes(b.shortName.toLowerCase())
  );
}
