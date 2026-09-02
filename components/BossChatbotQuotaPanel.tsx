'use client';

/**
 * Boss: lưới duyệt mua gói chatbot Phúc → cộng dồn hạn mức
 */

import { useEffect, useState } from 'react';

type Item = {
  id: string;
  userId: string;
  productSku: string;
  productName?: string | null;
  amount: number;
  dailyQuotaAdd: number;
  status: string;
  createdAt: string;
  note?: string | null;
  user?: {
    id: string;
    name?: string | null;
    fullName?: string | null;
    email?: string | null;
    aiDailyBonus?: number;
  } | null;
};

export default function BossChatbotQuotaPanel() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/boss/chatbot-quota?status=${tab}`);
      const data = await res.json();
      if (!res.ok) setMsg(data.error || 'Không tải được');
      else {
        setItems(data.items || []);
        setMsg('');
      }
    } catch {
      setMsg('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch('/api/boss/chatbot-quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || '');
    load();
  };

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

  return (
    <section
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
    >
      <div>
        <h3 className="font-bold text-[#1A1A1A]">Duyệt gói Chatbot Phúc</h3>
        <p className="text-xs text-black/60 mt-1">
          Khách mua gói 10k / 20k / 50k → hiện tại đây. Duyệt = <strong>cộng dồn</strong> số câu/ngày
          vào hạn mức Phúc của user.
        </p>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'all'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={
              tab === t
                ? { backgroundColor: '#C41E3A', color: '#fff' }
                : { backgroundColor: '#fff', border: '1px solid #D4C9B5' }
            }
          >
            {t === 'pending' ? 'Chờ duyệt' : t === 'approved' ? 'Đã duyệt' : 'Tất cả'}
          </button>
        ))}
      </div>

      {msg && <p className="text-xs font-semibold">{msg}</p>}
      {loading && <p className="text-sm text-black/50">Đang tải…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!loading && items.length === 0 && (
          <p className="text-sm text-black/50 col-span-full text-center py-6">
            Không có yêu cầu {tab === 'pending' ? 'chờ duyệt' : ''}.
          </p>
        )}
        {items.map((it) => (
          <article
            key={it.id}
            className="rounded-xl border bg-white p-3 space-y-2"
            style={{ borderColor: '#E8DFD0' }}
          >
            <div className="flex justify-between gap-2">
              <p className="font-bold text-sm">{it.productName || it.productSku}</p>
              <span className="text-xs font-bold" style={{ color: '#C41E3A' }}>
                {fmt(it.amount)}
              </span>
            </div>
            <p className="text-xs text-black/60">
              +{it.dailyQuotaAdd} câu/ngày · {it.status}
            </p>
            <p className="text-xs">
              User:{' '}
              <strong>
                {it.user?.fullName || it.user?.name || it.user?.email || it.userId.slice(0, 8)}
              </strong>
              {typeof it.user?.aiDailyBonus === 'number' && (
                <span className="text-black/50"> · bonus hiện tại {it.user.aiDailyBonus}</span>
              )}
            </p>
            <p className="text-[10px] text-black/40">
              {new Date(it.createdAt).toLocaleString('vi-VN')}
            </p>
            {it.status === 'pending' && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => act(it.id, 'approve')}
                  className="flex-1 text-xs font-bold py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#2E7D32' }}
                >
                  Duyệt cộng dồn
                </button>
                <button
                  type="button"
                  onClick={() => act(it.id, 'reject')}
                  className="text-xs font-bold py-2 px-3 rounded-lg border"
                  style={{ borderColor: '#D4C9B5' }}
                >
                  Từ chối
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
