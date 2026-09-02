'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import RankedUsername from '@/components/RankedUsername';
import GuestAuthPrompt from '@/components/GuestAuthPrompt';

type Msg = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; image?: string | null; rank?: string };
};

type Member = {
  id: string;
  name: string;
  image?: string | null;
  rank: string;
  lastOnline: string;
  isCreator?: boolean;
};

const STICKER_PACKS: { name: string; items: string[] }[] = [
  { name: 'Mặt', items: ['😀', '😂', '🥹', '😍', '🤩', '😎', '🥳', '😭', '😡', '🤔', '😴', '😇'] },
  { name: 'Tay', items: ['👍', '👎', '👏', '🙏', '🔥', '❤️', '💯', '🎉', '✨', '💪', '🤝', '✌️'] },
  { name: 'Động vật', items: ['🐶', '🐱', '🐼', '🦊', '🐯', '🦁', '🐸', '🐵', '🦄', '🐝', '🦋', '🌸'] },
  { name: 'Đồ ăn', items: ['🍜', '🍣', '🍕', '🍔', '☕', '🧋', '🍰', '🍓', '🍉', '🥂', '🍺', '🍩'] },
  { name: 'Live', items: ['🔴', '🎤', '🎬', '🎵', '🎶', '⭐', '🏆', '🎁', '💎', '📢', '💫', '🌈'] },
];

export default function EventChatRoomPage() {
  const params = useParams();
  const roomId = String(params?.roomId || '');
  const { status, data: session } = useSession();
  const myId = session?.user?.id;
  const [roomTitle, setRoomTitle] = useState('Phòng chat');
  const [closed, setClosed] = useState(false);
  const [creatorId, setCreatorId] = useState('');
  const [eventEndedAt, setEventEndedAt] = useState<string | null>(null);
  const [closesAt, setClosesAt] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [pack, setPack] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const loadRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      const [metaRes, msgRes] = await Promise.all([
        fetch(`/api/chat/rooms/${roomId}`),
        fetch(`/api/chat/rooms/${roomId}/messages`),
      ]);
      const meta = await metaRes.json();
      const data = await msgRes.json();
      if (meta.room) {
        setRoomTitle(meta.room.title);
        setClosed(!!meta.room.closed);
        setCreatorId(meta.room.creatorId || '');
        setEventEndedAt(meta.room.eventEndedAt);
        setClosesAt(meta.room.closesAt);
      }
      if (Array.isArray(meta.members)) setMembers(meta.members);
      if (data.room) {
        setRoomTitle(data.room.title);
        setClosed(!!data.room.closed);
      }
      setMessages(data.messages || []);
    } catch {
      /* ignore */
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
    const t = setInterval(loadRoom, 6000);
    return () => clearInterval(t);
  }, [loadRoom]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const renderContent = (content: string) => {
    const parts = content.split(/(@(?:"[^"]+"|[A-Za-z0-9_\.\u00C0-\u024F\u1E00-\u1EFF]+))/g);
    return parts.map((p, i) =>
      p.startsWith('@') ? (
        <span key={i} className="font-bold" style={{ color: '#1D9BF0' }}>
          {p}
        </span>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  const send = async (raw?: string) => {
    if (status !== 'authenticated') {
      setGuestOpen(true);
      return;
    }
    const content = (raw ?? text).trim();
    if (!content || closed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gửi thất bại');
        return;
      }
      setText('');
      setShowStickers(false);
      await loadRoom();
    } finally {
      setLoading(false);
    }
  };

  const endEvent = async () => {
    if (!confirm('Đánh dấu sự kiện đã kết thúc? Phòng sẽ tự đóng sau 48 giờ.')) return;
    const res = await fetch(`/api/chat/rooms/${roomId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end_event' }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Không kết thúc được');
      return;
    }
    alert(data.message || 'Đã kết thúc. Phòng đóng sau 48 giờ.');
    await loadRoom();
  };

  const canEnd = !!myId && (myId === creatorId || status === 'authenticated');

  return (
    <main
      className="pl-chat-room-page h-[100dvh] flex flex-col overflow-hidden"
      style={{ fontFamily: 'var(--font-x)' }}
    >
      <header
        className="pl-glass-bar px-3 py-2 flex items-center gap-3 shrink-0"
      >
        <Link href="/home?inbox=open" className="pl-nav-back text-sm font-bold">
          ← Home Chat
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm truncate">{roomTitle}</h1>
          <p className="text-[10px] text-black/50">
            {closed
              ? 'Đã đóng'
              : eventEndedAt
                ? `Sự kiện đã kết thúc · đóng ${closesAt ? new Date(closesAt).toLocaleString('vi-VN') : ''}`
                : 'Đang mở · @tag như X'}
          </p>
        </div>
        {canEnd && !closed && !eventEndedAt && (
          <button
            type="button"
            onClick={endEvent}
            className="text-[10px] font-bold px-2 py-1 rounded-lg text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563eb,#22d3ee)' }}
          >
            Kết thúc sự kiện
          </button>
        )}
      </header>

      {/* 1/3 trên: thành viên kiểu X Spaces */}
      <section
        className="pl-chat-stage shrink-0 border-b px-3 py-2 overflow-hidden"
        style={{ height: '33vh' }}
      >
        <p className="text-[10px] font-bold text-white/70 mb-2">
          {members.length} người trong phòng
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-3 overflow-y-auto h-[calc(33vh-2.2rem)] content-start">
          {members.length === 0 && (
            <p className="text-xs text-white/50">Chưa có thành viên — gửi tin để hiện diện.</p>
          )}
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center w-16">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold"
                  style={{
                    background: m.rank === 'artist' ? 'linear-gradient(135deg,#f59e0b,#ec4899)' : '#334155',
                    color: '#fff',
                    boxShadow: m.lastOnline === 'Đang hoạt động' ? '0 0 0 2px #22c55e' : '0 0 0 2px #64748b',
                  }}
                >
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (m.name || '?')[0]
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: m.lastOnline === 'Đang hoạt động' ? '#22c55e' : '#94a3b8',
                    borderColor: '#07111f',
                  }}
                />
              </div>
              <p className="text-[10px] text-white truncate w-full text-center mt-1 font-semibold">
                {m.name}
              </p>
              <p className="text-[8px] text-white/50 truncate w-full text-center">
                {m.isCreator ? 'Host' : m.lastOnline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2/3 dưới: khung chat */}
      <div className="flex-1 flex flex-col min-h-0" style={{ height: '67vh' }}>
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
          {messages.length === 0 && (
            <p className="text-center text-xs text-black/45 py-8">Chưa có tin nhắn. Dùng sticker hoặc @tên để bắt đầu.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="flex gap-2 items-start">
              <div className="pl-chat-avatar w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {(m.user.name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <RankedUsername name={m.user.name} rank={m.user.rank} role={null} />
                  <span className="text-[10px] text-black/40">
                    {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
                  {/^\p{Extended_Pictographic}{1,4}$/u.test(m.content.trim()) ? (
                    <span className="text-3xl leading-none">{m.content}</span>
                  ) : (
                    renderContent(m.content)
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pl-chat-composer border-t shrink-0">
          {showStickers && !closed && (
            <div className="px-2 pt-2 border-b" style={{ borderColor: 'rgba(34,211,238,.22)' }}>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {STICKER_PACKS.map((p, i) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setPack(i)}
                    className="text-[11px] font-bold px-2 py-1 rounded-full shrink-0"
                    style={{
                      background: pack === i ? 'linear-gradient(135deg,#2563eb,#22d3ee)' : 'rgba(255,255,255,.54)',
                      color: pack === i ? '#fff' : 'var(--pl-text)',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-1 py-2">
                {STICKER_PACKS[pack].items.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="text-2xl h-10 rounded-lg hover:bg-black/5"
                    onClick={() => send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {closed ? (
            <p className="text-center text-xs text-black/50 py-3">Phòng đã đóng (hết 48 giờ sau sự kiện).</p>
          ) : (
            <div className="flex gap-2 p-3 items-center">
              <button
                type="button"
                onClick={() => setShowStickers((v) => !v)}
                className="w-10 h-10 rounded-full text-lg shrink-0"
                style={{ backgroundColor: showStickers ? '#EDE6D9' : 'transparent' }}
                aria-label="Sticker"
              >
                😊
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder='Nhắn tin… @tên hoặc sticker'
                maxLength={500}
                className="pl-field flex-1 px-3 py-2.5 rounded-full text-sm outline-none"
              />
              <button
                type="button"
                disabled={loading || !text.trim()}
                onClick={() => send()}
                className="px-4 py-2 rounded-full text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#2563eb,#22d3ee)' }}
              >
                Gửi
              </button>
            </div>
          )}
        </div>
      </div>

      <GuestAuthPrompt open={guestOpen} onClose={() => setGuestOpen(false)} callbackUrl={`/chat/${roomId}`} />
    </main>
  );
}
