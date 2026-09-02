'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import LiveVotePanel from '@/components/LiveVotePanel';
import Link from 'next/link';

export default function LiveVotePage() {
  const params = useParams();
  const liveSessionId = params?.id as string;
  const { data: session } = useSession();
  const [meta, setMeta] = useState<{
    isOwner: boolean;
    ownerRank: string;
    isAdmin: boolean;
    title?: string;
  }>({ isOwner: false, ownerRank: 'normal', isAdmin: false });

  useEffect(() => {
    if (!liveSessionId || !session?.user?.id) return;
    // Lấy trạng thái vote + quyền (tái dùng status API; ownership check đơn giản qua session)
    fetch('/api/live/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', liveSessionId }),
    })
      .then((r) => r.json())
      .then(() => {
        // Bổ sung: client tạm suy từ session (server vẫn enforce)
        const role = (session.user as any)?.role;
        const rank = (session.user as any)?.rank || 'normal';
        setMeta({
          isOwner: true, // server chặn nếu không phải owner khi open
          ownerRank: rank,
          isAdmin: role === 'admin' || role === 'boss',
        });
      })
      .catch(() => {});
  }, [liveSessionId, session]);

  if (!liveSessionId) {
    return <p className="p-4 text-center">Thiếu mã phiên live</p>;
  }

  return (
    <div
      className="pl-future-shell min-h-screen p-4 max-w-md mx-auto space-y-4"
      style={{ fontFamily: 'var(--font-x)' }}
    >
      <div className="flex items-center justify-between">
        <Link href={`/live/${liveSessionId}/map`} className="text-sm font-medium">
          ← Bản đồ
        </Link>
        <span className="text-xs text-black/50">Bình chọn live</span>
      </div>

      <h1 className="text-lg font-bold">Duyệt tổ chức livestream</h1>
      <p className="text-xs text-black/55">
        Phiên: <code className="bg-black/5 px-1 rounded">{liveSessionId.slice(0, 12)}…</code>
      </p>

      <LiveVotePanel
        liveSessionId={liveSessionId}
        isOwner={meta.isOwner}
        ownerRank={meta.ownerRank}
        isAdmin={meta.isAdmin}
      />
    </div>
  );
}
