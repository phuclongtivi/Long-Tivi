'use client';

/**
 * Tab Sự kiện — 2 khu vực:
 * - Trên: Đang diễn ra | Sắp diễn ra | Lưu trữ
 * - Dưới: 6 chủ đề xu hướng (chi tiết theo topic)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GuestNavLink from './GuestNavLink';
import { LanguageSwitcher } from './LanguageSwitcher';
import { openPhucChat } from './AdminAIChatbot';
import { PHUC_LONG_CONTACT } from '@/lib/contact';
import { normalizeRank, permissionsForRank } from '@/lib/rank';
import BottomNav from '@/components/BottomNav';

type LiveItem = {
  id: string;
  title: string;
  viewerCount?: number;
  startedAt?: string | null;
  endedAt?: string | null;
  scheduledStartAt?: string | null;
  isPublic?: boolean;
  coverUrl?: string | null;
  hasReward?: boolean;
  requiresTicket?: boolean;
  organizerName?: string | null;
  benefits?: string | null;
  description?: string | null;
};

type Zone = 'live' | 'upcoming' | 'archive';
type TopicId =
  | 'music'
  | 'news_sport'
  | 'reward'
  | 'ticket'
  | 'schedule'
  | 'guide'
  | null;

const TREND_TOPICS = [
  {
    id: 'music' as const,
    title: 'Âm nhạc',
    desc: 'AI đăng bài đang hot MXH Việt Nam',
    emoji: '🎵',
  },
  {
    id: 'news_sport' as const,
    title: 'Thời sự và Thể thao',
    desc: 'AI thu thập xu hướng VN',
    emoji: '📰',
  },
  {
    id: 'reward' as const,
    title: 'Xem và nhận thưởng',
    desc: 'Live có thưởng — sắp / đang / đã diễn ra',
    emoji: '🎁',
  },
  {
    id: 'ticket' as const,
    title: 'Xem Live có mua vé',
    desc: 'Vé 5.000–20tr do người xem tự chọn',
    emoji: '🎫',
  },
  {
    id: 'schedule' as const,
    title: 'Lịch tổ chức sự kiện',
    desc: 'Lịch + Google Map + BTC + quyền lợi',
    emoji: '📅',
  },
  {
    id: 'guide' as const,
    title: 'Hướng dẫn Tổ chức sự kiện',
    desc: 'Phân quyền, tổ chức, quảng cáo, hoa hồng',
    emoji: '📘',
  },
];


function TicketBuyCard({ item }: { item: LiveItem }) {
  const [amount, setAmount] = useState('50000');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const buy = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/live/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveSessionId: item.id, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error || 'Không mua được vé');
      else setMsg(data.message || 'Đã tạo đơn vé — thanh toán trong Đơn hàng');
    } catch {
      setMsg('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="rounded-2xl border bg-white p-3 space-y-2" style={{ borderColor: '#E8DFD0' }}>
      <span className="text-[10px] font-bold text-amber-700">Sắp diễn ra · Vé tự chọn mức tiền</span>
      <h3 className="font-bold text-sm">{item.title}</h3>
      <p className="text-xs text-black/50">
        {item.scheduledStartAt
          ? new Date(item.scheduledStartAt).toLocaleString('vi-VN')
          : 'Lịch do Admin / BTC cập nhật'}
      </p>
      <label className="block text-xs font-semibold">
        Số tiền vé (5.000 – 20.000.000 VNĐ)
        <input
          type="number"
          min={5000}
          max={20000000}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: '#D4C9B5' }}
        />
      </label>
      <button
        type="button"
        disabled={loading}
        onClick={buy}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: '#C41E3A' }}
      >
        {loading ? 'Đang tạo đơn…' : 'Mua vé — thanh toán như mua hàng'}
      </button>
      {msg && <p className="text-xs text-black/70">{msg}</p>}
    </div>
  );
}

export default function EventsClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicParam = (searchParams.get('topic') as TopicId) || null;

  const [zone, setZone] = useState<Zone>('live');
  const [items, setItems] = useState<LiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [topicItems, setTopicItems] = useState<any[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [rank, setRank] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setRank((session.user as any).rank || 'user');
    } else {
      setRank(null);
    }
  }, [session]);

  const canOrganize = useMemo(() => {
    if (!session?.user) return false;
    return permissionsForRank(rank).canOrganizeEvent;
  }, [session, rank]);

  // Khu vực trên: zone feeds
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/live?zone=${zone}`);
        const data = await res.json();
        if (!cancelled) setItems(data.lives || data.items || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [zone]);

  // Topic detail feeds
  const loadTopic = useCallback(async (topic: TopicId) => {
    if (!topic || topic === 'guide') return;
    setTopicLoading(true);
    try {
      if (topic === 'music' || topic === 'news_sport') {
        const res = await fetch(`/api/events/trends?topic=${topic}`);
        const data = await res.json();
        setTopicItems(data.items || []);
      } else if (topic === 'reward') {
        // upcoming first (top 2), then live, then archive — hasReward preferred
        const [up, live, arch] = await Promise.all([
          fetch('/api/live?zone=upcoming').then((r) => r.json()),
          fetch('/api/live?zone=live').then((r) => r.json()),
          fetch('/api/live?zone=archive').then((r) => r.json()),
        ]);
        const upcoming = (up.lives || []).slice(0, 2);
        const rest = [...(live.lives || []), ...(arch.lives || [])];
        setTopicItems([
          ...upcoming.map((x: LiveItem) => ({ ...x, _badge: 'Sắp diễn ra' })),
          ...rest.map((x: LiveItem) => ({
            ...x,
            _badge: x.endedAt ? 'Đã diễn ra' : 'Đang diễn ra',
          })),
        ]);
      } else if (topic === 'ticket') {
        const res = await fetch('/api/live?zone=upcoming');
        const data = await res.json();
        setTopicItems(
          (data.lives || []).map((x: LiveItem) => ({
            ...x,
            requiresTicket: true,
            _badge: 'Cần mua vé',
          }))
        );
      } else if (topic === 'schedule') {
        const res = await fetch('/api/live?zone=upcoming');
        const data = await res.json();
        setTopicItems(data.lives || []);
      }
    } catch {
      setTopicItems([]);
    } finally {
      setTopicLoading(false);
    }
  }, []);

  useEffect(() => {
    if (topicParam === 'guide') return;
    if (topicParam) loadTopic(topicParam);
  }, [topicParam, loadTopic, canOrganize]);

  const openTopic = (id: TopicId) => {
    if (id === 'guide') {
      router.push('/events?topic=guide');
      return;
    }
    router.push(`/events?topic=${id}`);
  };

  const closeTopic = () => router.push('/events');

  const zoneTabs: { id: Zone; label: string }[] = [
    { id: 'live', label: 'Đang diễn ra' },
    { id: 'upcoming', label: 'Sắp diễn ra' },
    { id: 'archive', label: 'Lưu trữ' },
  ];

  const topicTitle = TREND_TOPICS.find((t) => t.id === topicParam)?.title;

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        backgroundColor: '#F5F0E6',
        color: '#1A1A1A',
        fontFamily: 'var(--font-x)',
      }}
    >
      <header className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => openPhucChat('general')}
          className="flex items-center gap-2 min-w-0 text-left rounded-lg focus:outline-none"
          title="Mở trợ lý Phúc"
          aria-label="Mở chatbot Phúc"
        >
          <img
            src="/logo-phuc-long.png"
            alt="Phúc Long"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">
              Phúc Long Center
            </h1>
            <p className="text-[10px] text-black/50 tracking-wide">SINCE 2019 · Hỏi Phúc</p>
          </div>
        </button>
        <LanguageSwitcher />
      </header>

      <div className="px-4 pb-2">
        <h2 className="text-2xl font-bold">
          {topicParam ? topicTitle || 'Sự kiện' : 'Sự kiện'}
        </h2>
        {topicParam && (
          <button
            type="button"
            onClick={closeTopic}
            className="text-xs font-semibold mt-1"
            style={{ color: '#C41E3A' }}
          >
            ← Quay lại tab Sự kiện
          </button>
        )}
      </div>

      {/* ===== Chi tiết topic ===== */}
      {topicParam && topicParam !== 'guide' && (
        <section className="px-4 space-y-3">
          {topicParam === 'music' && (
            <p className="text-xs text-black/60">
              Admin AI tự động đăng bài đang được nhiều người xem, thu thập từ mạng xã
              hội trong phạm vi <strong>Việt Nam</strong>, chủ đề âm nhạc.
            </p>
          )}
          {topicParam === 'news_sport' && (
            <p className="text-xs text-black/60">
              Admin AI tự động đăng bài đang hot trên MXH phạm vi <strong>Việt Nam</strong>{' '}
              — thời sự và thể thao.
            </p>
          )}
          {topicParam === 'reward' && (
            <p className="text-xs text-black/60">
              Feed sự kiện có thể xem live và nhận thưởng. <strong>2 sự kiện sắp diễn
              ra</strong> luôn hiện trên cùng.
            </p>
          )}
          {topicParam === 'ticket' && (
            <p className="text-xs text-black/60">
              Sự kiện <strong>sắp diễn ra</strong> có yêu cầu vé. Người tổ chức bật
              &quot;Yêu cầu mua vé&quot;; người xem <strong>tự chọn số tiền</strong> từ{' '}
              <strong>5.000 – 20.000.000 VNĐ</strong> để được toàn quyền xem livestream
              (thanh toán giống mua hàng).
            </p>
          )}
          {topicParam === 'schedule' && (
            <p className="text-xs text-black/60">
              Lịch sự kiện sắp tổ chức: Google Map chỉ đường, BTC, nội dung, quyền lợi
              người tham gia.
            </p>
          )}

          {topicLoading && (
            <p className="text-sm text-center text-black/50 py-6">Đang tải…</p>
          )}

          {!topicLoading && topicItems.length === 0 && (
            <div
              className="rounded-2xl border p-6 text-center text-sm text-black/55"
              style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
            >
              Chưa có nội dung — AI Admin sẽ cập nhật feed này.
            </div>
          )}

          {/* Music / News trend cards */}
          {(topicParam === 'music' || topicParam === 'news_sport') &&
            topicItems.map((it: any) => (
              <article
                key={it.id}
                className="rounded-2xl border p-3 bg-white"
                style={{ borderColor: '#E8DFD0' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm">{it.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white shrink-0">
                    {it.viewsLabel || 'Hot VN'}
                  </span>
                </div>
                <p className="text-xs text-black/55 mt-1">
                  {it.platform || 'MXH Việt Nam'} · AI Admin thu thập
                </p>
                {it.excerpt && (
                  <p className="text-xs mt-2 text-black/70">{it.excerpt}</p>
                )}
                {it.url && (
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold mt-2 inline-block"
                    style={{ color: '#C41E3A' }}
                  >
                    Xem trên nền tảng →
                  </a>
                )}
              </article>
            ))}

          {/* Reward feed */}
          {topicParam === 'reward' &&
            topicItems.map((item: LiveItem & { _badge?: string }, idx: number) => (
              <Link
                key={item.id + String(idx)}
                href={`/live/${item.id}`}
                className="block rounded-2xl overflow-hidden border bg-white"
                style={{ borderColor: '#E8DFD0' }}
              >
                <div className="p-3">
                  <div className="flex gap-2 items-center mb-1">
                    {idx < 2 && item._badge === 'Sắp diễn ra' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                        TOP · Sắp diễn ra
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      🎁 Xem để nhận thưởng
                    </span>
                    {item._badge && item._badge !== 'Sắp diễn ra' && (
                      <span className="text-[10px] text-black/50">{item._badge}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-xs text-black/50 mt-1">
                    📍 {PHUC_LONG_CONTACT.addressShort}
                  </p>
                </div>
              </Link>
            ))}

          {/* Ticket feed — người mua tự chọn số tiền 5k–20tr */}
          {topicParam === 'ticket' &&
            topicItems.map((item: LiveItem) => (
              <TicketBuyCard key={item.id} item={item} />
            ))}

          {/* Schedule feed */}
          {topicParam === 'schedule' &&
            topicItems.map((item: LiveItem) => (
              <article
                key={item.id}
                className="rounded-2xl border bg-white p-3 space-y-2"
                style={{ borderColor: '#E8DFD0' }}
              >
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-xs text-black/60">
                  <strong>Nội dung:</strong>{' '}
                  {item.description || 'Sự kiện Phúc Long Center — chi tiết trên live.'}
                </p>
                <p className="text-xs text-black/60">
                  <strong>Người tổ chức:</strong>{' '}
                  {item.organizerName || 'Phúc Long Center / Nghệ sĩ được duyệt'}
                </p>
                <p className="text-xs text-black/60">
                  <strong>Quyền lợi tham gia:</strong>{' '}
                  {item.benefits ||
                    'Xem live, nhận quà (nếu có), tích điểm hạng, ưu đãi gian hàng.'}
                </p>
                <p className="text-xs text-black/60">
                  <strong>Địa điểm:</strong> {PHUC_LONG_CONTACT.address}
                </p>
                <a
                  href={PHUC_LONG_CONTACT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-xs font-bold px-3 py-2 rounded-lg border"
                  style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
                >
                  🗺️ Google Map chỉ đường
                </a>
                <div>
                  <Link
                    href={`/live/${item.id}`}
                    className="text-xs font-semibold"
                    style={{ color: '#C41E3A' }}
                  >
                    Xem chi tiết sự kiện →
                  </Link>
                </div>
              </article>
            ))}
        </section>
      )}

      {/* Guide: chatbot already opened; show contact card */}
      {topicParam === 'guide' && (
        <section className="px-4 space-y-4 pb-4">
          <article
            className="rounded-2xl border p-4 space-y-3 text-sm leading-relaxed"
            style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
          >
            <h3 className="font-bold text-base">Thông báo cố định — Phân quyền & tổ chức sự kiện</h3>

            <div>
              <p className="font-bold text-xs mb-1">1. Phân quyền từ cao → thấp</p>
              <ol className="list-decimal pl-4 text-xs space-y-1 text-black/75">
                <li><strong>Boss / Admin</strong> — toàn quyền quản trị, nâng hạng, cấu hình app.</li>
                <li><strong>Nghệ sĩ (Artist)</strong> — tổ chức livestream lên màn hình chính, mời khách, bảng điều khiển, tạo sản phẩm gian hàng.</li>
                <li><strong>User đã đăng nhập</strong> — được tạo phiên livestream (tab LIVE). Guest không tạo được live.</li>
                <li><strong>Phóng viên (Reporter)</strong> — livestream trong tab LIVE theo hạng mục; chưa đưa live lên màn hình chính.</li>
                <li><strong>User</strong> — dùng app đầy đủ (xem, mua, nhận thưởng); chưa tổ chức live.</li>
                <li><strong>Khách</strong> — xem nội dung; chuyển màn hình được nhắc đăng nhập nhanh.</li>
              </ol>
            </div>

            <div>
              <p className="font-bold text-xs mb-1">2. Ai được tổ chức livestream?</p>
              <p className="text-xs text-black/75">
                Sau khi được cấp quyền <strong>Nghệ sĩ</strong> hoặc <strong>Phóng viên</strong>,
                user có thể tổ chức livestream theo các hạng mục: Âm nhạc, Thời sự và Thể thao,
                Xem và nhận thưởng, Xem Live có mua vé, lịch sự kiện trên app.
              </p>
            </div>

            <div>
              <p className="font-bold text-xs mb-1">3. Hướng dẫn tổ chức từng loại trên app</p>
              <ul className="list-disc pl-4 text-xs space-y-1 text-black/75">
                <li><strong>Live thường / thưởng:</strong> Tạo live → bật &quot;Có thưởng&quot; nếu có quà → phát trên tab Sự kiện hoặc Trang chủ (Nghệ sĩ).</li>
                <li><strong>Live có vé:</strong> Bật &quot;Yêu cầu mua vé&quot; → người xem tự chọn mức 5.000–20.000.000 VNĐ → thanh toán xong được xem full.</li>
                <li><strong>Lịch sự kiện:</strong> Đặt giờ phát (scheduledStartAt) → hiện Sắp diễn ra + Map địa điểm Phúc Long.</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-xs mb-1">4. Quảng cáo & bán hàng</p>
              <p className="text-xs text-black/75">
                Video/live có thể gắn sản phẩm gian hàng; chia sẻ MXH kèm QR refer.
                AI Admin hỗ trợ chèn QR và ảnh nhận diện khi chia sẻ để hạn chế vi phạm chính sách nền tảng.
              </p>
              <p className="text-xs text-black/75 mt-2">
                <strong>Sản phẩm do pháp nhân sản xuất:</strong> sau khi Nghệ sĩ đăng SP, AI Admin
                rà soát tự động. Nếu nhận diện do pháp nhân sản xuất, SP hiện <strong>dấu tick đỏ
                cảnh báo</strong>. Nghệ sĩ cần bổ sung <strong>Chứng nhận xuất xứ</strong> và{' '}
                <strong>Bảng công bố chất lượng sản phẩm</strong> trong <strong>3 ngày làm việc</strong>
                để gỡ cảnh báo.
              </p>
            </div>

            <div>
              <p className="font-bold text-xs mb-1">5. Quyền lợi các bên (từ đăng nhập → hoa hồng)</p>
              <ul className="list-disc pl-4 text-xs space-y-1 text-black/75">
                <li><strong>Người xem:</strong> xem free hoặc mua vé (tự chọn mức tiền), nhận thưởng/quà khi live có thưởng.</li>
                <li><strong>Người chia sẻ:</strong> hoa hồng khi có đơn từ link/QR refer.</li>
                <li><strong>Người tổ chức (Phóng viên / Nghệ sĩ):</strong> phát live, bán vé/SP, tặng quà, điểm danh (khi được cấp).</li>
                <li><strong>Admin / Boss:</strong> duyệt hạng, cấu hình, giám sát AI, nhận refer mặc định khi không xác định được người giới thiệu.</li>
              </ul>
            </div>

            <p className="text-xs text-black/55 border-t pt-2" style={{ borderColor: '#D4C9B5' }}>
              Trợ lý AI <strong>Phúc</strong> luôn có mặt (nút chat) để hướng dẫn dùng app,
              tập trung quyền lợi các bên. Chưa đủ hạng tổ chức? Liên hệ Zalo{' '}
              <a href="https://zalo.me/0966717808" className="font-bold underline">0966717808</a>
              {' '}(phuclongtivi.com).
            </p>
          </article>

          <button
            type="button"
            onClick={() => openPhucChat('booking')}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: '#C41E3A' }}
          >
            Hỏi thêm chatbot Phúc về quyền lợi & tổ chức
          </button>
        </section>
      )}

      {/* ===== Màn hình chính tab (không topic) ===== */}
      {!topicParam && (
        <>
          <section className="px-4 pt-1">
            <div className="flex gap-2 mb-3">
              {zoneTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setZone(t.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition"
                  style={
                    zone === t.id
                      ? { backgroundColor: '#C41E3A', color: '#fff' }
                      : {
                          backgroundColor: '#FAF7F0',
                          color: '#1A1A1A',
                          border: '1px solid #D4C9B5',
                        }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="min-h-[200px] space-y-3">
              {loading && (
                <p className="text-sm text-black/50 py-8 text-center">Đang tải…</p>
              )}
              {!loading && items.length === 0 && (
                <div
                  className="rounded-2xl border p-6 text-center text-sm text-black/55"
                  style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
                >
                  {zone === 'live' && 'Chưa có sự kiện đang diễn ra'}
                  {zone === 'upcoming' && 'Chưa có sự kiện sắp diễn ra'}
                  {zone === 'archive' && 'Chưa có bản lưu trữ'}
                </div>
              )}
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/live/${item.id}`}
                  className="block rounded-2xl overflow-hidden border bg-white shadow-sm"
                  style={{ borderColor: '#E8DFD0' }}
                >
                  <div
                    className="h-36 relative"
                    style={{ backgroundColor: '#1A1A1A' }}
                  >
                    {zone === 'live' && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                        LIVE
                      </span>
                    )}
                    {zone === 'upcoming' && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                        SẮP DIỄN RA
                      </span>
                    )}
                    {zone === 'archive' && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white">
                        LƯU TRỮ
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm leading-snug">{item.title}</h3>
                    <p className="text-xs text-black/50 mt-1">
                      📍 {PHUC_LONG_CONTACT.addressShort}
                      {typeof item.viewerCount === 'number' && zone === 'live'
                        ? ` · ${item.viewerCount.toLocaleString('vi-VN')} đang xem`
                        : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="px-4 mt-6">
            <h3 className="font-bold text-sm mb-3 text-black/80">Chủ đề xu hướng</h3>
            <div className="grid grid-cols-2 gap-3">
              {TREND_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => openTopic(topic.id)}
                  className="rounded-2xl border p-3 flex flex-col gap-1 min-h-[100px] text-left"
                  style={{
                    backgroundColor: '#FAF7F0',
                    borderColor: '#D4C9B5',
                    color: '#1A1A1A',
                  }}
                >
                  <span className="text-2xl" aria-hidden>
                    {topic.emoji}
                  </span>
                  <span className="font-bold text-sm leading-tight">{topic.title}</span>
                  <span className="text-[11px] text-black/55 leading-snug">
                    {topic.desc}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <BottomNav activeHref="/events" />
    </div>
  );
}
