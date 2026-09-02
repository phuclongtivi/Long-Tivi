'use client';

import { useMemo, useState } from 'react';
import { VN_BANKS } from '@/lib/vnBanks';

type Props = {
  initialBankName?: string | null;
  initialAccountNumber?: string | null;
  initialAccountName?: string | null;
};

/**
 * Form cập nhật TK ngân hàng — danh sách NH VN kiểu Shopee
 */
export default function BankAccountForm({
  initialBankName,
  initialAccountNumber,
  initialAccountName,
}: Props) {
  const [bankName, setBankName] = useState(initialBankName || '');
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber || '');
  const [accountName, setAccountName] = useState(initialAccountName || '');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return VN_BANKS;
    return VN_BANKS.filter(
      (b) =>
        b.name.toLowerCase().includes(s) ||
        b.shortName.toLowerCase().includes(s) ||
        b.code.toLowerCase().includes(s)
    );
  }, [q]);

  const save = async () => {
    if (!bankName.trim()) {
      setMsg('Vui lòng chọn ngân hàng');
      return;
    }
    if (!accountNumber.trim()) {
      setMsg('Vui lòng nhập số tài khoản');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: bankName.trim(),
          bankAccountNumber: accountNumber.trim(),
          bankAccountName: accountName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Không lưu được');
      } else {
        setMsg('Đã lưu thông tin ngân hàng nhận thưởng.');
      }
    } catch {
      setMsg('Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-black/55">
        Chọn ngân hàng đang hoạt động tại Việt Nam (danh sách tương tự form thanh toán
        Shopee). Dùng để nhận thưởng và nút <strong>Kiểm tra</strong> trên sổ tiền.
      </p>

      <div>
        <label className="text-xs font-semibold block mb-1">Tìm / chọn ngân hàng</label>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Gõ tên NH: Vietcombank, MB, Techcombank…"
          className="w-full px-3 py-2 rounded-lg border text-sm mb-2"
          style={{ borderColor: '#D4C9B5', backgroundColor: '#F5F0E6' }}
        />
        <select
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border text-sm"
          style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
          size={Math.min(8, Math.max(4, filtered.length))}
        >
          <option value="">— Chọn ngân hàng —</option>
          {filtered.map((b) => (
            <option key={b.code} value={b.shortName}>
              {b.shortName} — {b.name}
            </option>
          ))}
        </select>
        {bankName && (
          <p className="text-[11px] text-black/50 mt-1">Đã chọn: <strong>{bankName}</strong></p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1">Số tài khoản</label>
        <input
          type="text"
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="Chỉ nhập số"
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
        />
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1">
          Tên chủ tài khoản (tuỳ chọn)
        </label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Để trống nếu trùng họ tên trên app"
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
        />
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        {saving ? 'Đang lưu…' : 'Lưu thông tin ngân hàng'}
      </button>
      {msg && <p className="text-xs font-semibold">{msg}</p>}
    </div>
  );
}
