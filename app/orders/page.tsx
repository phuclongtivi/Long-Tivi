'use client';

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
  createdAt: string;
};

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_payment', label: 'Chờ thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  pending: 'Chờ xử lý',
  paid: 'Đã thanh toán',
};

export default function OrdersPage() {
  const { status: authStatus } = useSession();
  const [tab, setTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestOpen, setGuestOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const q = tab === 'all' ? '' : `?status=${tab}`;
      const res = await fetch(`/api/orders${q}`);
      if (res.status === 401) {
        setGuestOpen(true);
        setOrders([]);
      } else {
        const data = await res.json();
        setOrders(data.orders || []);
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

  const openDetail = async (id: string) => {
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    if (data.error) setMsg(data.error);
    else setDetail(data);
  };

  const act = async (id: string, action: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || 'Đã cập nhật');
    setDetail(null);
    load();
  };

  return (
    <main className="min-h-screen pb-8" style={{ backgroundColor: '#F5F0E6', color: '#1A1A1A' }}>
      <header
        className="sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#EDE6D9', borderColor: '#D4C9B5' }}
      >
        <Link href="/store" className="text-sm">
          ← Store
        </Link>
        <h1 className="font-bold">Đơn mua</h1>
        <Link href="/cart" className="text-sm text-red-700">
          Giỏ hàng
        </Link>
      </header>

      <div className="flex overflow-x-auto gap-1 px-2 py-2 border-b" style={{ borderColor: '#D4C9B5' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full ${
              tab === t.key ? 'bg-red-600 text-white' : 'bg-white text-black/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto p-3 space-y-3">
        {loading && <p className="text-center text-sm text-black/50 py-8">Đang tải…</p>}
        {!loading && orders.length === 0 && (
          <p className="text-center text-sm text-black/50 py-12">Chưa có đơn hàng</p>
        )}
        {orders.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => openDetail(o.id)}
            className="w-full text-left p-3 rounded-xl border bg-white space-y-1"
            style={{ borderColor: '#D4C9B5' }}
          >
            <div className="flex justify-between text-xs text-black/50">
              <span>{new Date(o.createdAt).toLocaleString('vi-VN')}</span>
              <span className="font-semibold text-red-700">
                {STATUS_LABEL[o.status] || o.status}
              </span>
            </div>
            <p className="font-semibold text-sm">{o.productName || 'Sản phẩm'}</p>
            <p className="text-xs text-black/55">
              x{o.quantity || 1}
              {o.paymentMethod ? ` · ${o.paymentMethod}` : ''}
              {o.trackingCode ? ` · VĐ: ${o.trackingCode}` : ''}
            </p>
            <p className="text-right font-bold text-red-600 text-sm">
              {(o.totalAmount ?? o.amount).toLocaleString('vi-VN')}₫
            </p>
          </button>
        ))}
        {msg && <p className="text-xs text-center">{msg}</p>}
      </div>

      {/* Chi tiết đơn + timeline */}
      {detail?.order && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-[#F5F0E6] max-h-[85vh] overflow-y-auto p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold">Chi tiết đơn</h2>
              <button type="button" onClick={() => setDetail(null)}>
                ×
              </button>
            </div>
            <p className="text-sm font-semibold">{detail.order.productName}</p>
            <p className="text-xs text-black/55">Mã đơn: {detail.order.id}</p>
            <p className="text-sm">
              Trạng thái:{' '}
              <strong>{STATUS_LABEL[detail.order.status] || detail.order.status}</strong>
            </p>
            <p className="text-sm">
              Giao hàng: <strong>{detail.order.shippingStatus || 'pending'}</strong>
            </p>
            {detail.trackingHint && (
              <p className="text-xs bg-white rounded-lg p-2 border" style={{ borderColor: '#D4C9B5' }}>
                {detail.trackingHint}
              </p>
            )}
            {detail.shippingLookupUrl && (
              <a
                href={
                  detail.order.trackingCode
                    ? `${detail.shippingLookupUrl}${detail.shippingLookupUrl.includes('?') ? '&' : '?'}code=${encodeURIComponent(detail.order.trackingCode)}`
                    : detail.shippingLookupUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm font-semibold text-red-700 underline"
              >
                Tra cứu vận đơn (link Boss cấu hình)
              </a>
            )}

            <p className="text-xs font-bold uppercase text-black/45">Tiến trình</p>
            <ul className="space-y-2 border-l-2 border-red-200 pl-3">
              {(detail.timeline || []).map((log: any) => (
                <li key={log.id} className="text-xs">
                  <span className="font-semibold">{STATUS_LABEL[log.status] || log.status}</span>
                  <span className="text-black/40 ml-2">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </span>
                  {log.note && <p className="text-black/55">{log.note}</p>}
                </li>
              ))}
            </ul>

            <div className="flex gap-2 pt-2">
              {['pending_payment', 'processing', 'pending'].includes(detail.order.status) && (
                <button
                  type="button"
                  onClick={() => act(detail.order.id, 'cancel')}
                  className="flex-1 py-2 rounded-xl border text-sm font-semibold bg-white"
                >
                  Hủy đơn
                </button>
              )}
              {['shipping', 'delivered'].includes(detail.order.status) && (
                <button
                  type="button"
                  onClick={() => act(detail.order.id, 'confirm_received')}
                  className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold"
                >
                  Đã nhận hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <GuestAuthPrompt
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        callbackUrl="/orders"
      />
    </main>
  );
}
