'use client';

import { useEffect, useState } from 'react';

type Item = {
  id: string;
  title?: string | null;
  approvalStatus: string;
  scheduledStartAt?: string | null;
  startedAt?: string;
  organizer?: {
    id: string;
    name?: string | null;
    fullName?: string | null;
    email?: string | null;
    rank?: string | null;
    role?: string | null;
  } | null;
};

export default function BossLiveApprovalPanel() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const status = tab === 'pending' ? 'pending' : tab;
      const res = await fetch(`/api/boss/live-approval?status=${status}`);
      const data = await res.json();
      if (!res.ok) setMsg(data.error || 'Lỗi tải');
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
    const res = await fetch('/api/boss/live-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || '');
    load();
  };

  return (
    <section
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
    >
      <div>
        <h3 className="font-bold text-[#1A1A1A]">Duyệt livestream (Nghệ sĩ / Admin)</h3>
        <p className="text-xs text-black/60 mt-1">
          Live chỉ hiển thị trên app sau khi Boss đồng ý. Email gửi khi có yêu cầu mới (BOSS_EMAIL /
          Resend).
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            ['pending', 'Chờ duyệt'],
            ['approved', 'Đã duyệt'],
            ['rejected', 'Từ chối'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={
              tab === k
                ? { backgroundColor: '#C41E3A', color: '#fff' }
                : { backgroundColor: '#fff', border: '1px solid #D4C9B5' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {msg && <p className="text-xs font-semibold">{msg}</p>}
      {loading && <p className="text-sm text-black/50">Đang tải…</p>}

      <div className="space-y-2">
        {!loading && items.length === 0 && (
          <p className="text-sm text-black/50 text-center py-6">Không có mục nào.</p>
        )}
        {items.map((it) => (
          <article
            key={it.id}
            className="rounded-xl border bg-white p-3 space-y-1"
            style={{ borderColor: '#E8DFD0' }}
          >
            <p className="font-bold text-sm">{it.title || 'Không tiêu đề'}</p>
            <p className="text-xs text-black/60">
              Tổ chức:{' '}
              <strong>
                {it.organizer?.fullName || it.organizer?.name || it.organizer?.email || '—'}
              </strong>
              {it.organizer?.rank ? ` · ${it.organizer.rank}` : ''}
            </p>
            <p className="text-[10px] text-black/40">
              Lịch:{' '}
              {it.scheduledStartAt
                ? new Date(it.scheduledStartAt).toLocaleString('vi-VN')
                : it.startedAt
                  ? new Date(it.startedAt).toLocaleString('vi-VN')
                  : '—'}{' '}
              · {it.approvalStatus}
            </p>
            {tab === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => act(it.id, 'approve')}
                  className="flex-1 text-xs font-bold py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#2E7D32' }}
                >
                  Đồng ý hiển thị
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
