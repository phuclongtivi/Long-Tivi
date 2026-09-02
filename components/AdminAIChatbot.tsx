'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PhucChatbotAvatar } from '@/components/event/PhucChatbotAvatar';

type Msg = { role: 'user' | 'assistant'; content: string };

const BOT_NAME = 'Phúc';

function guestKey() {
  if (typeof window === 'undefined') return '';
  let k = localStorage.getItem('pl_assistant_session');
  if (!k) {
    k = `g_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem('pl_assistant_session', k);
  }
  return k;
}

/** Mở chatbot Phúc: window.dispatchEvent(new CustomEvent('open-phuc-chat', { detail: { intent: 'booking' } })) */
export function openPhucChat(
  intent?: 'booking' | 'general' | 'marketplace',
  extra?: { platform?: string; message?: string }
) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('open-phuc-chat', {
        detail: { intent: intent || 'general', ...(extra || {}) },
      })
    );
  }
}

/**
 * Chatbot luôn tên **Phúc** (trước và sau đăng nhập).
 * Đăng nhập: lịch sử riêng; kiến thức AI Admin + kịch bản Boss.
 */
export default function AdminAIChatbot() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [limited, setLimited] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<{ used?: number; limit?: number } | null>(null);
  const [pendingIntent, setPendingIntent] = useState<'booking' | 'general' | 'marketplace' | null>(null);
  const [isBossUser, setIsBossUser] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedBooking = useRef(false);

  // Boss: chatbot luôn mở để nhận mệnh lệnh
  useEffect(() => {
    if (status !== 'authenticated') {
      setIsBossUser(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        if (!cancelled && data.isBoss) {
          setIsBossUser(true);
          setOpen(true);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);

  const loadHistory = async () => {
    const params = new URLSearchParams();
    if (status !== 'authenticated') params.set('sessionKey', guestKey());
    try {
      const res = await fetch(`/api/assistant?${params}`);
      const data = await res.json();
      const list = (data.messages || [])
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .map((m: any) => ({ role: m.role, content: m.content }));
      setMsgs(list);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setOpen(true);
      if (detail.intent === 'booking' || detail.guideOrganize) {
        setPendingIntent('booking');
        startedBooking.current = false;
        if (detail.guideOrganize) {
          (window as any).__pl_guide_organize = {
            canOrganize: !!detail.canOrganize,
            zalo: detail.zalo || '0966717808',
            zaloUrl: detail.zaloUrl || 'https://zalo.me/0966717808',
          };
        }
      } else if (detail.intent === 'marketplace') {
        setPendingIntent('marketplace');
        startedBooking.current = false;
        (window as any).__pl_marketplace_guide = {
          platform: detail.platform || '',
          message: detail.message || '',
        };
      }
    };
    window.addEventListener('open-phuc-chat', handler as EventListener);
    return () => window.removeEventListener('open-phuc-chat', handler as EventListener);
  }, []);

  useEffect(() => {
    if (open) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status]);

  useEffect(() => {
    if (!open || pendingIntent !== 'booking' || startedBooking.current || loading) return;
    startedBooking.current = true;
    setPendingIntent(null);
    (async () => {
      setLoading(true);
      const guide = (typeof window !== 'undefined' &&
        (window as any).__pl_guide_organize) || null;
      const startMsg = guide
        ? guide.canOrganize
          ? '[Hướng dẫn Tổ chức sự kiện] Tôi đủ điều kiện Nghệ sĩ. Hướng dẫn đăng ký và tổ chức livestream/sự kiện trên app Long.'
          : `[Hướng dẫn Tổ chức sự kiện] Tôi chưa đủ điều kiện tổ chức theo phân quyền. Hướng dẫn cách nâng hạng hoặc liên hệ Zalo ${guide.zalo} (phuclongtivi.com).`
        : '[Bắt đầu tư vấn Đặt lịch Livestream/Biểu diễn]';
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: startMsg,
            intent: 'booking',
            sessionKey: status === 'authenticated' ? undefined : guestKey(),
          }),
        });
        const data = await res.json();
        if (data.reply) {
          setMsgs((m) => [...m, { role: 'assistant', content: data.reply }]);
        } else if (guide && !guide.canOrganize) {
          setMsgs((m) => [
            ...m,
            {
              role: 'assistant',
              content: `Xin chào, tôi là Phúc. Bạn đã đăng nhập nên có thể tạo phiên livestream (tab LIVE). Để live lên màn hình chính và đầy đủ bảng điều khiển Nghệ sĩ, cần hạng Nghệ sĩ. Liên hệ Zalo ${guide.zalo} — ${guide.zaloUrl} hoặc xem https://phuclongtivi.com để được hỗ trợ đăng ký tổ chức.`,
            },
          ]);
        }
      } catch {
        setMsgs((m) => [
          ...m,
          {
            role: 'assistant',
            content: guide && !guide.canOrganize
              ? `Xin chào, tôi là Phúc. Bạn chưa đủ điều kiện tổ chức theo phân quyền. Vui lòng liên hệ Zalo 0966717808 (https://zalo.me/0966717808) hoặc website phuclongtivi.com để được hỗ trợ.`
              : 'Xin chào, tôi là Phúc. Bạn muốn đặt lịch livestream hay biểu diễn? Cho tôi biết loại sự kiện, số khách dự kiến và thời gian mong muốn nhé.',
          },
        ]);
      } finally {
        setLoading(false);
        if (typeof window !== 'undefined') {
          delete (window as any).__pl_guide_organize;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingIntent]);

  // Hướng dẫn gắn SP / tạo gian Shopee TikTok Facebook
  useEffect(() => {
    if (!open || pendingIntent !== 'marketplace' || startedBooking.current || loading) return;
    startedBooking.current = true;
    setPendingIntent(null);
    (async () => {
      setLoading(true);
      const ctx = (typeof window !== 'undefined' && (window as any).__pl_marketplace_guide) || {};
      const platform = ctx.platform || 'Shopee/TikTok/Facebook';
      const userMsg =
        ctx.message ||
        `[Hướng dẫn gian hàng] Tôi đang làm theo hướng dẫn gắn sản phẩm / tạo gian trên ${platform}. Bạn (Phúc) hỏi tôi cần giúp gì thêm không, và hỗ trợ từng bước.`;
      try {
        setMsgs((m) => [...m, { role: 'user', content: userMsg }]);
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMsg,
            sessionKey: status === 'authenticated' ? undefined : undefined,
          }),
        });
        const data = await res.json();
        setMsgs((m) => [
          ...m,
          {
            role: 'assistant',
            content:
              data.reply ||
              data.error ||
              `Bạn cần mình hỗ trợ bước nào trên ${platform}? Có thể hỏi về tạo gian, đăng sản phẩm, ảnh, giá, hoặc chính sách sàn.`,
          },
        ]);
      } catch {
        setMsgs((m) => [
          ...m,
          {
            role: 'assistant',
            content: `Xin chào, tôi là Phúc. Bạn đang gắn sản phẩm / tạo gian trên ${platform}. Bạn cần mình giúp gì — tạo shop, đăng sản phẩm, hình ảnh, hay chính sách sàn?`,
          },
        ]);
      } finally {
        setLoading(false);
        if (typeof window !== 'undefined') delete (window as any).__pl_marketplace_guide;
      }
    })();
  }, [open, pendingIntent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionKey: status === 'authenticated' ? undefined : guestKey(),
        }),
      });
      const data = await res.json();
      if (data.limited || data.quota?.remaining === 0) {
        setLimited(true);
        setQuotaInfo(data.quota || null);
      } else {
        setLimited(false);
        if (data.quota) setQuotaInfo(data.quota);
      }
      setMsgs((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.reply || data.error || 'Không nhận được phản hồi.',
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: 'assistant', content: 'Lỗi kết nối. Thử lại sau.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pl-ai-launcher fixed bottom-24 right-4 z-[60] rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'transparent', boxShadow: 'none', width: 64, height: 64 }}
        aria-label="Mở chatbot Phúc"
      >
        {open ? '×' : (
          <PhucChatbotAvatar size={56} name="Phúc" />
        )}
      </button>

      {open && (
        <div
          className="pl-ai-chat-panel fixed bottom-40 right-4 z-[60] w-[min(100vw-2rem,360px)] h-[min(70vh,480px)] flex flex-col overflow-hidden"
        >
          <div className="pl-ai-chat-head px-3 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{BOT_NAME}</p>
              <p className="text-[10px] opacity-70">
                {status === 'authenticated'
                  ? 'Trợ lý riêng của bạn · Phúc Long Center'
                  : 'Trợ lý AI Admin · Phúc Long Center'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-lg leading-none px-1"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {msgs.length === 0 && !loading && (
              <div className="text-xs opacity-70 space-y-1">
                <p>
                  Xin chào, tôi là <strong>Phúc</strong>. Tôi có thể giúp bạn:
                </p>
                <p>• Đặt lịch livestream / biểu diễn</p>
                <p>• Hướng dẫn dùng app, hạng Pro / Nghệ sĩ</p>
                <p>• Mua hàng, đơn hàng, sản phẩm / dịch vụ</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-xl max-w-[90%] whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'ml-auto pl-ai-chat-bubble-user'
                    : 'mr-auto pl-ai-chat-bubble-bot'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && <p className="text-xs opacity-50">Phúc đang trả lời…</p>}
            <div ref={bottomRef} />
          </div>

          {limited && (
            <div className="pl-ai-chat-limit px-3 py-2 space-y-2">
              <p className="text-[11px] opacity-75">
                Đã hết hạn mức hôm nay
                {quotaInfo?.limit != null ? ` (${quotaInfo.used ?? '?'}/${quotaInfo.limit})` : ''}.
                Mua gói để tăng số câu Phúc trả lời mỗi ngày.
              </p>
              <a
                href="/store?filter=chatbot"
                className="pl-ai-chat-cta block w-full text-center text-sm font-bold py-2.5 rounded-xl"
                onClick={() => setOpen(false)}
              >
                Gia hạn
              </a>
              <p className="text-[10px] opacity-50 text-center">
                10k→10 câu · 20k→20 câu · 50k→50 câu / ngày · Boss duyệt
              </p>
            </div>
          )}

          <div
            className="pl-ai-chat-inputbar p-2 flex gap-2"
          >
            <input
              className="pl-ai-chat-input flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              placeholder="Nhắn với Phúc…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="pl-ai-chat-cta px-3 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
