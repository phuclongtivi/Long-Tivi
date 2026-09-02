'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GuestAuthPrompt from '@/components/GuestAuthPrompt';

type CartItem = {
  id: string;
  productId: string;
  productName?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  selected: boolean;
};

const PAYMENTS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
  { id: 'ewallet', label: 'Ví điện tử (MoMo / ZaloPay…)' },
  { id: 'card', label: 'Thẻ ATM / Visa / Mastercard' },
];

export default function CartPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [guestOpen, setGuestOpen] = useState(false);

  // Checkout form
  const [step, setStep] = useState<'cart' | 'checkout' | 'done'>('cart');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderIds, setOrderIds] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (res.status === 401) {
        setItems([]);
      } else {
        setItems(data.items || []);
        setSubtotal(data.subtotal || 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') load();
    else if (status === 'unauthenticated') {
      setLoading(false);
      setGuestOpen(true);
    }
  }, [status]);

  const call = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMsg(data.message || data.error || '');
    await load();
    return data;
  };

  const checkout = async () => {
    if (!shippingPhone.trim() || !shippingAddress.trim()) {
      setMsg('Nhập số điện thoại và địa chỉ giao hàng');
      return;
    }
    setMsg('');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkout_cart',
        paymentMethod,
        shippingName: shippingName || session?.user?.name,
        shippingPhone,
        shippingAddress,
        referCode:
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('ref') || localStorage.getItem('pl_refer_code')
            : null,
      }),
    });
    const data = await res.json();
    if (data.error) {
      setMsg(data.error);
      return;
    }
    setOrderIds((data.orders || []).map((o: any) => o.id));
    setStep('done');
    setMsg(data.message || 'Đặt hàng thành công');
  };

  if (status === 'loading' || loading) {
    return (
      <main className="pl-page min-h-screen p-6 text-center" style={{ background: 'transparent', color: 'var(--pl-text)' }}>
        Đang đồng bộ giỏ hàng…
      </main>
    );
  }

  return (
    <main className="pl-page min-h-screen pb-28" style={{ background: 'transparent', color: 'var(--pl-text)' }}>
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(248,251,255,.86)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(125,211,252,.26)' }}
      >
        <Link href="/store" className="text-sm font-medium">
          ← superBUY™
        </Link>
        <h1 className="font-bold">Giỏ hàng</h1>
        <Link href="/orders" className="text-sm font-medium">
          Đơn mua
        </Link>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-3 pl-commerce-shell">
        <div className="pl-section-head">
          <div>
            <span className="pl-future-kicker">Commerce Flow</span>
            <h2 style={{ fontSize: 22 }}>Mua nhanh, rõ điểm</h2>
          </div>
          <span className="pl-status-pill">ticker ready</span>
        </div>
        {step === 'cart' && (
          <>
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="pl-muted">Giỏ hàng trống</p>
                <Link
                  href="/store"
                  className="pl-holo-button inline-block px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={items.every((i) => i.selected)}
                    onChange={(e) => call({ action: 'select_all', selected: e.target.checked })}
                  />
                  Chọn tất cả
                </label>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="pl-cart-item flex gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) =>
                        call({
                          action: 'select',
                          productId: item.productId,
                          selected: e.target.checked,
                        })
                      }
                    />
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0" style={{ background: 'rgba(125,211,252,.16)' }}>
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2">{item.productName}</p>
                      <p className="font-bold text-sm mt-1" style={{ color: '#2563eb' }}>
                        {item.unitPrice.toLocaleString('vi-VN')}₫
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border text-sm"
                          onClick={() =>
                            call({
                              action: 'update',
                              productId: item.productId,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                        >
                          −
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border text-sm"
                          onClick={() =>
                            call({
                              action: 'update',
                              productId: item.productId,
                              quantity: item.quantity + 1,
                            })
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-xs"
                          onClick={() => call({ action: 'remove', productId: item.productId })}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  className="fixed left-3 right-3 p-3 flex items-center gap-3"
                  style={{ bottom: 86, background: 'rgba(15,23,42,.86)', border: '1px solid rgba(125,211,252,.34)', borderRadius: 18, backdropFilter: 'blur(18px)' }}
                >
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'rgba(248,251,255,.72)' }}>Tổng thanh toán</p>
                    <p className="text-lg font-bold" style={{ color: '#f8fbff' }}>
                      {subtotal.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={subtotal <= 0}
                    onClick={() => setStep('checkout')}
                    className="pl-holo-button px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    Mua hàng
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 'checkout' && (
          <div className="space-y-4">
            <h2 className="font-bold">Xác nhận mua hàng</h2>
            <input
              className="text-sm"
              placeholder="Họ tên người nhận"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
            />
            <input
              className="text-sm"
              placeholder="Số điện thoại *"
              value={shippingPhone}
              onChange={(e) => setShippingPhone(e.target.value)}
            />
            <textarea
              rows={3}
              placeholder="Địa chỉ giao hàng *"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />

            <p className="text-sm font-semibold">Phương thức thanh toán</p>
            <div className="space-y-2">
              {PAYMENTS.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm cursor-pointer pl-cart-item"
                  style={{ borderColor: paymentMethod === p.id ? 'rgba(34,211,238,.72)' : undefined }}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === p.id}
                    onChange={() => setPaymentMethod(p.id)}
                  />
                  {p.label}
                </label>
              ))}
            </div>

            <div className="flex justify-between font-bold">
              <span>Tổng</span>
              <span style={{ color: '#2563eb' }}>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="flex-1 py-3 rounded-xl border text-sm font-semibold"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={checkout}
                className="pl-holo-button flex-1 py-3 rounded-xl text-sm font-bold"
              >
                Đặt hàng
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-10 space-y-4">
            <p className="font-bold text-lg" style={{ color: '#059669' }}>Đặt hàng thành công!</p>
            <p className="text-sm pl-muted">
              {orderIds.length} đơn đã được tạo. Theo dõi tại Đơn mua.
            </p>
            <Link
              href="/orders"
              className="pl-holo-button inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Theo dõi đơn hàng
            </Link>
            <div>
              <Link href="/store" className="text-sm underline">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}

        {msg && (
          <p className="text-xs text-center bg-black/5 rounded-lg px-2 py-1.5">{msg}</p>
        )}
      </div>

      <GuestAuthPrompt open={guestOpen} onClose={() => setGuestOpen(false)} callbackUrl="/cart" />
    </main>
  );
}
