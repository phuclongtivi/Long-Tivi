'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type VoteStatus = {
  approvalStatus: string;
  yesCount: number;
  needed: number;
  myVote: string | null;
  approvedAt?: string | null;
  approvedByAdminId?: string | null;
};

type Props = {
  liveSessionId: string;
  /** Chủ phiên + hạng artist mới được mở bình chọn */
  isOwner?: boolean;
  ownerRank?: string;
  /** Admin / Boss */
  isAdmin?: boolean;
};

export default function LiveVotePanel({
  liveSessionId,
  isOwner = false,
  ownerRank = 'normal',
  isAdmin = false,
}: Props) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<VoteStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/live/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', liveSessionId }),
      });
      const data = await res.json();
      if (!data.error) {
        setStatus({
          approvalStatus: data.approvalStatus,
          yesCount: data.yesCount ?? 0,
          needed: data.needed ?? 50,
          myVote: data.myVote ?? null,
          approvedAt: data.approvedAt,
          approvedByAdminId: data.approvedByAdminId,
        });
      }
    } catch {
      /* ignore */
    }
  }, [liveSessionId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const call = async (action: string, extra: Record<string, unknown> = {}) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/live/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, liveSessionId, ...extra }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage(data.message || 'OK');
        await load();
      }
    } catch (e: any) {
      setMessage(e.message || 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  };

  const isArtist = ownerRank === 'artist';
  const pending = status?.approvalStatus === 'pending_vote';
  const approved = status?.approvalStatus === 'approved';
  const pct = status
    ? Math.min(100, Math.round((status.yesCount / (status.needed || 50)) * 100))
    : 0;

  return (
    <div
      className="rounded-2xl border border-black/10 bg-white/80 p-4 space-y-3"
      style={{ fontFamily: 'var(--font-x)', color: '#1A1A1A' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">Bình chọn tổ chức livestream</h3>
        {approved && (
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            APPROVED
          </span>
        )}
        {pending && (
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            Đang bình chọn
          </span>
        )}
      </div>

      <p className="text-xs text-black/60 leading-relaxed">
        Nghệ sĩ mở bình chọn cho phiên live của mình. Đủ{' '}
        <strong>{status?.needed ?? 50} phiếu đồng ý</strong> → duyệt tự động. Admin có thể
        duyệt sớm.
      </p>

      {status && (pending || approved) && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span>
              {status.yesCount} / {status.needed} phiếu đồng ý
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-red-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Chủ phiên Nghệ sĩ – mở bình chọn */}
      {isOwner && isArtist && status?.approvalStatus === 'none' && (
        <button
          disabled={loading}
          onClick={() => call('open')}
          className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          Mở bình chọn (cần 50 phiếu đồng ý)
        </button>
      )}

      {isOwner && !isArtist && (
        <p className="text-xs text-amber-700">
          Chỉ hạng Nghệ sĩ mới được mở bình chọn tổ chức livestream.
        </p>
      )}

      {/* User khác – bỏ phiếu */}
      {session?.user && !isOwner && pending && (
        <div className="flex gap-2">
          <button
            disabled={loading || status?.myVote === 'yes'}
            onClick={() => call('cast', { vote: 'yes' })}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {status?.myVote === 'yes' ? 'Đã đồng ý ✓' : 'Đồng ý'}
          </button>
          <button
            disabled={loading || status?.myVote === 'no'}
            onClick={() => call('cast', { vote: 'no' })}
            className="flex-1 py-2.5 rounded-xl border border-black/20 bg-white text-sm font-semibold disabled:opacity-50"
          >
            {status?.myVote === 'no' ? 'Đã từ chối' : 'Từ chối'}
          </button>
        </div>
      )}

      {/* Admin duyệt sớm */}
      {isAdmin && !approved && (
        <button
          disabled={loading}
          onClick={() => call('admin_approve')}
          className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-50"
        >
          Admin duyệt sớm (không cần đủ phiếu)
        </button>
      )}

      {approved && (
        <p className="text-xs text-green-700">
          Phiên đã được duyệt
          {status?.approvedByAdminId ? ' bởi Admin' : ' tự động nhờ đủ phiếu'}.
        </p>
      )}

      {message && <p className="text-xs text-black/70 bg-black/5 rounded-lg px-2 py-1.5">{message}</p>}
    </div>
  );
}
