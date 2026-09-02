'use client';

/**
 * Bảng theo dõi tiền thưởng, quà tặng nhận được và tiền đã tiêu trong app
 * - Tiền vào: nút Kiểm tra → app/ngân hàng user đã kê khai
 * - Tiền ra (đơn đã chọn PTTT): nút Kiểm tra → URL tra cứu giao hàng
 */

import { useEffect, useState } from 'react';

type Row = {
  id: string;
  direction: 'in' | 'out';
  category: string;
  amount: number;
  title: string;
  note?: string | null;
  status: string;
  createdAt: string;
  checkType: 'bank' | 'shipping' | null;
  checkUrl: string | null;
  checkLabel: string | null;
  paymentMethod?: string | null;
};

const CAT_LABEL: Record<string, string> = {
  reward: 'Thưởng',
  gift: 'Quà tặng',
  commission: 'Hoa hồng',
  spend: 'Chi tiêu',
  other: 'Khác',
};

export default function MoneyLedgerPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/user/money-ledger');
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || 'Không tải được sổ tiền');
        setRows([]);
      } else {
        setRows(data.rows || []);
        setSummary(data.summary);
      }
    } catch {
      setErr('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCheck = (row: Row) => {
    if (row.direction === 'in') {
      if (row.checkUrl) {
        window.open(row.checkUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      alert(
        summary?.bankLinked
          ? summary.bankHint
          : 'Bạn chưa kê khai số tài khoản / ngân hàng khi đăng ký. Cập nhật trong dashboard để dùng nút Kiểm tra.'
      );
      return;
    }
    // out — shipping
    if (row.checkUrl) {
      window.open(row.checkUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    alert(
      'Chưa có URL tra cứu giao hàng cho đơn này. Nghệ sĩ / Admin gắn link giao hàng khi đăng sản phẩm hoặc cập nhật đơn.'
    );
  };

  const fmt = (n: number) =>
    n.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫';

  return (
    <section
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h2 className="font-bold text-base">Theo dõi tiền &amp; quà trong app</h2>
          <p className="text-xs text-black/55 mt-0.5">
            AI / hệ thống tự cập nhật thưởng, quà nhận và chi tiêu mua hàng trên Long.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
          style={{ borderColor: '#D4C9B5' }}
        >
          Làm mới
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-3 border" style={{ borderColor: '#E8DFD0' }}>
            <p className="text-[10px] text-black/50">Tiền / quà vào</p>
            <p className="font-bold text-sm text-green-700">{fmt(summary.totalIn || 0)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border" style={{ borderColor: '#E8DFD0' }}>
            <p className="text-[10px] text-black/50">Đã tiêu trên app</p>
            <p className="font-bold text-sm text-red-700">{fmt(summary.totalOut || 0)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border" style={{ borderColor: '#E8DFD0' }}>
            <p className="text-[10px] text-black/50">Ví quà</p>
            <p className="font-bold text-sm">{fmt(summary.giftWalletBalance || 0)}</p>
          </div>
        </div>
      )}

      {!summary?.bankLinked && (
        <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">
          Chưa có STK ngân hàng — cập nhật tài khoản nhận thưởng để bật nút <strong>Kiểm tra</strong> tiền vào.
        </p>
      )}

      {loading && <p className="text-sm text-black/50 text-center py-4">Đang tải sổ…</p>}
      {err && <p className="text-xs text-red-700">{err}</p>}

      {!loading && rows.length === 0 && (
        <p className="text-sm text-black/50 text-center py-6">
          Chưa có giao dịch thưởng / quà / chi tiêu trên app.
        </p>
      )}

      <div className="space-y-2 max-h-[420px] overflow-y-auto">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white rounded-xl border p-3 flex gap-3 items-center"
            style={{ borderColor: '#E8DFD0' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                backgroundColor: row.direction === 'in' ? '#E8F5E9' : '#FFEBEE',
                color: row.direction === 'in' ? '#2E7D32' : '#C62828',
              }}
            >
              {row.direction === 'in' ? '+' : '−'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5">
                  {CAT_LABEL[row.category] || row.category}
                </span>
                <span className="text-[10px] text-black/40">
                  {new Date(row.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <p className="font-semibold text-sm truncate">{row.title}</p>
              {row.note && (
                <p className="text-[11px] text-black/50 truncate">{row.note}</p>
              )}
              <p
                className="text-sm font-bold"
                style={{ color: row.direction === 'in' ? '#2E7D32' : '#C62828' }}
              >
                {row.direction === 'in' ? '+' : '−'}
                {fmt(row.amount)}
              </p>
            </div>
            {row.checkLabel && (
              <button
                type="button"
                onClick={() => onCheck(row)}
                className="shrink-0 px-3 py-2 rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: '#C41E3A' }}
                title={
                  row.checkType === 'bank'
                    ? 'Mở liên kết ngân hàng đã kê khai'
                    : 'Mở tra cứu giao hàng'
                }
              >
                Kiểm tra
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
