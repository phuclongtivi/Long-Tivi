'use client';

import { useState } from 'react';

type UserRow = {
  id: string;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  rank?: string;
};

/**
 * Panel Boss: tìm user và nâng lên Nghệ sĩ (artist)
 */
export default function BossPromoteArtist() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`/api/admin/rank?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.error) setMsg(data.error);
      setUsers(data.users || []);
    } catch {
      setMsg('Lỗi tìm user');
    } finally {
      setLoading(false);
    }
  };

  const promote = async (userId: string, rank: 'artist' | 'pro' | 'normal') => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rank }),
      });
      const data = await res.json();
      setMsg(data.message || data.error || '');
      if (data.success) search();
    } catch {
      setMsg('Lỗi nâng cấp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5', color: '#1A1A1A' }}
    >
      <h2 className="font-bold text-sm">Boss · Nâng cấp Nghệ sĩ</h2>
      <p className="text-xs text-black/60">
        User hạng Nghệ sĩ được tạo sản phẩm trong gian hàng và tổ chức livestream trên màn hình
        chính.
      </p>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white"
          style={{ borderColor: '#D4C9B5' }}
          placeholder="Tìm tên / email / SĐT / userId"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
        <button
          type="button"
          disabled={loading}
          onClick={search}
          className="px-3 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: '#1A1A1A' }}
        >
          Tìm
        </button>
      </div>
      <ul className="space-y-2 max-h-56 overflow-y-auto">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white border text-sm"
            style={{ borderColor: '#EDE6D9' }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{u.fullName || u.name || u.email}</p>
              <p className="text-[10px] text-black/45">
                {u.email} · hạng: {u.rank || 'normal'}
              </p>
            </div>
            <button
              type="button"
              disabled={loading || u.rank === 'artist'}
              onClick={() => promote(u.id, 'artist')}
              className="text-xs font-bold px-2 py-1.5 rounded-lg text-white disabled:opacity-40"
              style={{ backgroundColor: '#DC2626' }}
            >
              → Nghệ sĩ
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => promote(u.id, 'pro')}
              className="text-xs font-semibold px-2 py-1.5 rounded-lg border"
            >
              Pro
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => promote(u.id, 'normal')}
              className="text-xs px-2 py-1.5 rounded-lg text-black/50"
            >
              Thường
            </button>
          </li>
        ))}
      </ul>
      {msg && <p className="text-xs font-semibold">{msg}</p>}
    </div>
  );
}
