'use client';

/**
 * Kênh người bán (Shopee-style) — Nghệ sĩ quản lý gian hàng, SP, đơn bán
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GuestAuthPrompt from '@/components/GuestAuthPrompt';

type Order = {
  id: string;
  productName?: string | null;
  quantity?: number;
  amount: number;
  totalAmount?: number | null;
  status: string;
  paymentMethod?: string | null;
  paymentStatus?: string;
  shippingStatus?: string;
  trackingCode?: string | null;
  carrierName?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  shippingAddress?: string | null;
  createdAt: string;
};

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_payment', label: 'Chờ TT' },
  { key: 'processing', label: 'Chờ xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function SellerCenterPage() {
  const { status: authStatus } = useSession();
  const [tab, setTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestOpen, setGuestOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [carrier, setCarrier] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const q = tab === 'all' ? '' : `?status=${tab}`;
      const res = await fetch(`/api/seller/orders${q}`);
      if (res.status === 401) {
        setGuestOpen(true);
        setOrders([]);
      } else if (res.status === 403) {
        setMsg('Chỉ Nghệ sĩ / Admin mới vào Kênh người bán');
        setOrders([]);
      } else {
        const data = await res.json();
        setOrders(data.orders || []);
        setMsg('');
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') load();
    else if (authStatus === 'unauthenticated') {
      setLoading(false);
      setGuestOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, tab]);

  const act = async (id: string, action: string, extra: Record<string, string> = {}) => {
    const res = await fetch(`/api/seller/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        trackingCode: tracking[id] || extra.trackingCode,
        carrierName: carrier[id] || extra.carrierName,
        ...extra,
      }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || '');
    load();
  };

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

  return (
    <main
      className="min-h-screen pb-10"
      style={{ backgroundColor: '#F5F0E6', color: '#1A1A1A', fontFamily: 'var(--font-x)' }}
    >
      <header className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#D4C9B5' }}>
        <div>
          <Link href="/dashboard" className="text-xs font-semibold" style={{ color: '#C41E3A' }}>
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold">Kênh người bán</h1>
          <p className="text-xs text-black/55">Quản lý đơn hàng · gian hàng · sản phẩm (kiểu Shopee)</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/store"
            className="text-xs font-bold px-3 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#8B4513' }}
          >
            Gian hàng / SP
          </Link>
          <Link
            href="/orders"
            className="text-xs font-bold px-3 py-2 rounded-lg border"
            style={{ borderColor: '#D4C9B5' }}
          >
            Đơn mua của tôi
          </Link>
        </div>
      </header>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={
              tab === t.key
                ? { backgroundColor: '#C41E3A', color: '#fff' }
                : { backgroundColor: '#FAF7F0', border: '1px solid #D4C9B5' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mx-4 text-xs font-semibold px-3 py-2 rounded-lg bg-white border" style={{ borderColor: '#D4C9B5' }}>
          {msg}
        </p>
      )}

      <div className="px-4 space-y-3 mt-2">
        {loading && <p className="text-sm text-center py-8 text-black/50">Đang tải đơn bán…</p>}
        {!loading && orders.length === 0 && (
          <p className="text-sm text-center py-12 text-black/50">
            Chưa có đơn nào. Khi khách mua SP trong gian hàng của bạn, đơn sẽ hiện ở đây.
          </p>
        )}
        {orders.map((o) => (
          <article
            key={o.id}
            className="rounded-xl border bg-white p-3 space-y-2"
            style={{ borderColor: '#E8DFD0' }}
          >
            <div className="flex justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{o.productName || 'Sản phẩm'}</p>
                <p className="text-[11px] text-black/50">
                  {new Date(o.createdAt).toLocaleString('vi-VN')} · x{o.quantity || 1}
                </p>
              </div>
              <p className="font-bold text-sm shrink-0" style={{ color: '#C41E3A' }}>
                {fmt(o.totalAmount ?? o.amount)}
              </p>
            </div>
            <p className="text-xs text-black/60">
              Trạng thái: <strong>{o.status}</strong>
              {o.paymentMethod ? ` · ${o.paymentMethod}` : ''} · TT: {o.paymentStatus}
            </p>
            {(o.buyerName || o.buyerPhone) && (
              <p className="text-xs text-black/60">
                Khách: {o.buyerName || '—'} {o.buyerPhone ? `· ${o.buyerPhone}` : ''}
              </p>
            )}
            {o.shippingAddress && (
              <p className="text-xs text-black/55 line-clamp-2">📍 {o.shippingAddress}</p>
            )}
            {o.trackingCode && (
              <p className="text-xs">Mã vận đơn: <strong>{o.trackingCode}</strong> {o.carrierName || ''}</p>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {o.status === 'pending_payment' && (
                <button
                  type="button"
                  onClick={() => act(o.id, 'mark_paid')}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: '#2E7D32' }}
                >
                  Đã nhận tiền
                </button>
              )}
              {(o.status === 'processing' || o.status === 'pending_payment') && (
                <>
                  <button
                    type="button"
                    onClick={() => act(o.id, 'confirm')}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border"
                    style={{ borderColor: '#D4C9B5' }}
                  >
                    Xác nhận đơn
                  </button>
                  <button
                    type="button"
                    onClick={() => act(o.id, 'pack')}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border"
                    style={{ borderColor: '#D4C9B5' }}
                  >
                    Đóng gói
                  </button>
                </>
              )}
              {['processing', 'shipping'].includes(o.status) && (
                <div className="w-full flex flex-wrap gap-1.5 items-center">
                  <input
                    placeholder="Mã vận đơn"
                    value={tracking[o.id] || ''}
                    onChange={(e) => setTracking({ ...tracking, [o.id]: e.target.value })}
                    className="text-xs px-2 py-1.5 rounded border flex-1 min-w-[100px]"
                    style={{ borderColor: '#D4C9B5' }}
                  />
                  <input
                    placeholder="ĐVVC (GHN, GHTK…)"
                    value={carrier[o.id] || ''}
                    onChange={(e) => setCarrier({ ...carrier, [o.id]: e.target.value })}
                    className="text-xs px-2 py-1.5 rounded border flex-1 min-w-[100px]"
                    style={{ borderColor: '#D4C9B5' }}
                  />
                  <button
                    type="button"
                    onClick={() => act(o.id, 'ship')}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white"
                    style={{ backgroundColor: '#C41E3A' }}
                  >
                    Giao vận chuyển
                  </button>
                </div>
              )}
              {o.status === 'shipping' && (
                <button
                  type="button"
                  onClick={() => act(o.id, 'deliver')}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: '#1A1A1A' }}
                >
                  Đã giao xong
                </button>
              )}
              {!['delivered', 'completed', 'cancelled'].includes(o.status) && (
                <button
                  type="button"
                  onClick={() => act(o.id, 'cancel_by_seller')}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-red-700"
                >
                  Hủy đơn
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <GuestAuthPrompt open={guestOpen} onClose={() => setGuestOpen(false)} callbackUrl="/dashboard/seller" />
    </main>
  );
}
