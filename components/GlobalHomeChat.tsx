'use client';

/**
 * Phòng Chat Phúc Long Center — màn hình chính (Twitter cổ).
 * 2 tin mới nhất của Nghệ sĩ được ghim 1 dòng/tin trên đầu khung;
 * tin Nghệ sĩ mới hơn sẽ thay thế tin Nghệ sĩ cũ.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RankedUsername from './RankedUsername';
import { normalizeRank } from '@/lib/rank';

type Msg = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    rank?: string | null;
    role?: string | null;
  };
};

const MAX = 280;

function isArtistMsg(m: Msg) {
  return normalizeRank(m.user?.rank) === 'artist';
}

function briefLine(text: string, max = 72) {
  const one = text.replace(/\s+/g, ' ').trim();
  if (one.length <= max) return one;
  return one.slice(0, max - 1) + '…';
}

function normalizeMessages(messages: Msg[]) {
  return Array.from(new Map(messages.map((message) => [message.id, message])).values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export default function GlobalHomeChat({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const latestRequest = useRef(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++latestRequest.current;
    try {
      const res = await fetch('/api/chat/global', { cache: 'no-store', signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể tải phòng chat');
      if (requestId !== latestRequest.current) return;
      setMessages(normalizeMessages(Array.isArray(data.messages) ? data.messages : []));
      setError('');
    } catch (loadError) {
      if (signal?.aborted || requestId !== latestRequest.current) return;
      setError(loadError instanceof Error ? loadError.message : 'Lỗi kết nối');
    }
  }, []);

  useEffect(() => {
    let controller: AbortController | undefined;
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      controller?.abort();
      controller = new AbortController();
      void load(controller.signal);
    };

    refresh();
    const t = window.setInterval(refresh, 8000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller?.abort();
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [load]);

  /** 2 tin Nghệ sĩ mới nhất (mọi nghệ sĩ) — luôn nằm trên đầu */
  const artistPinned = useMemo(() => {
    return messages
      .filter(isArtistMsg)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
  }, [messages]);

  const pinnedIds = useMemo(() => new Set(artistPinned.map((m) => m.id)), [artistPinned]);

  /** Timeline: tin thường + tin nghệ sĩ không còn trong top 2 (lịch sử) */
  const timeline = useMemo(() => {
    return messages.filter((m) => !pinnedIds.has(m.id));
  }, [messages, pinnedIds]);

  const latestTimelineId = timeline[timeline.length - 1]?.id;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [latestTimelineId]);

  const send = async () => {
    const content = text.trim();
    if (!content || !isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chat/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gửi thất bại');
        return;
      }
      setText('');
      if (data.message) {
        setMessages((current) => normalizeMessages([...current, data.message]));
      } else {
        await load();
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl pt-1 pb-3" aria-label="Phòng Chat Phúc Long Center">
      <div
        className="h-[clamp(320px,58dvh,520px)] min-h-[320px] max-h-[520px] rounded-xl overflow-hidden flex flex-col shadow-md"
        style={{
          border: '3px solid #1DA1F2',
          backgroundColor: '#E8F5FE',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ backgroundColor: '#1DA1F2', borderColor: '#0d8bd9' }}
        >
          <span className="text-white text-lg leading-none" aria-hidden>
            🐦
          </span>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold leading-tight">
              Phòng Chat Phúc Long Center
            </p>
            <p className="text-white/85 text-[10px] leading-tight">
              Trò chuyện công khai · 2 tin Nghệ sĩ mới nhất ghim trên đầu
            </p>
          </div>
        </div>

        {/* Ghim 2 tin Nghệ sĩ — 1 dòng / tin */}
        {artistPinned.length > 0 && (
          <div
            className="border-b px-2 py-1.5 space-y-1"
            style={{ backgroundColor: '#FFF8E7', borderColor: '#1DA1F2' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#8B4513' }}>
              ⭐ Nghệ sĩ · tin mới
            </p>
            {artistPinned.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-1.5 text-[11px] leading-tight min-w-0"
                title={m.content}
              >
                <span className="shrink-0 text-[10px]" aria-hidden>
                  ◆
                </span>
                <RankedUsername
                  name={m.user.name}
                  rank={m.user.rank}
                  role={m.user.role}
                  className="inline-block max-w-[45%] truncate text-[11px] shrink-0"
                />
                <span className="text-black/30 shrink-0">·</span>
                <span className="truncate text-[#14171A] font-medium min-w-0">
                  {briefLine(m.content)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
          style={{ backgroundColor: '#fff' }}
        >
          {timeline.length === 0 && artistPinned.length === 0 && (
            <p className="text-center text-xs text-black/40 py-6">
              Chưa có tin nhắn. Hãy là người đầu tiên chào mọi người!
            </p>
          )}
          {timeline.map((m) => (
            <div
              key={m.id}
              className="flex gap-2 px-2 py-1.5 border-b last:border-0"
              style={{ borderColor: '#E1E8ED' }}
            >
              {m.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.user.image}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                  style={{ backgroundColor: '#1DA1F2' }}
                >
                  {(m.user.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <RankedUsername
                    name={m.user.name}
                    rank={m.user.rank}
                    role={m.user.role}
                    className="text-xs"
                  />
                  <span className="text-[10px] text-black/40">
                    {new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#14171A] whitespace-pre-wrap break-words mt-0.5">
                  {m.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Compose */}
        <div
          className="border-t px-2 py-2"
          style={{ backgroundColor: '#F5F8FA', borderColor: '#1DA1F2' }}
        >
          {!isLoggedIn ? (
            <p className="text-[11px] text-center text-black/55 py-1">
              Đăng nhập để trò chuyện trong Phòng Chat Phúc Long Center.
            </p>
          ) : (
            <div className="flex gap-2 items-end">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX))}
                rows={2}
                aria-label="Nội dung tin nhắn"
                placeholder="What's happening? / Bạn đang nghĩ gì?"
                className="flex-1 text-xs rounded-lg border px-2 py-1.5 resize-none outline-none focus:ring-1"
                style={{
                  borderColor: '#AAB8C2',
                  backgroundColor: '#fff',
                  color: '#14171A',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="flex flex-col items-end gap-1">
                <span
                  className="text-[10px]"
                  style={{ color: text.length > MAX - 20 ? '#E0245E' : '#657786' }}
                >
                  {text.length}/{MAX}
                </span>
                <button
                  type="button"
                  disabled={loading || !text.trim()}
                  onClick={send}
                  className="text-xs font-bold px-3 py-1.5 rounded-full text-white disabled:opacity-40"
                  style={{ backgroundColor: '#1DA1F2' }}
                >
                  {loading ? 'Đang gửi…' : 'Đăng'}
                </button>
              </div>
            </div>
          )}
          {error && (
            <p className="text-[10px] text-red-600 mt-1" role="status" aria-live="polite">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
