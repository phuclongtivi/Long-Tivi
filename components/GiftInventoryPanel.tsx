'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type InventoryItem = {
  id: string;
  itemType: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  quantity: number;
  imageUrl?: string | null;
};

type Props = {
  /** Gợi ý người nhận (vd: từ danh sách tham gia live) */
  defaultToUserId?: string;
  liveSessionId?: string;
};

export default function GiftInventoryPanel({ defaultToUserId, liveSessionId }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [toUserId, setToUserId] = useState(defaultToUserId || '');
  const [selectedId, setSelectedId] = useState<string>('');
  const [cashAmount, setCashAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bankInfo, setBankInfo] = useState<any>(null);

  // Form thêm vào kho
  const [addType, setAddType] = useState<'cash' | 'product'>('product');
  const [addTitle, setAddTitle] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addQty, setAddQty] = useState('1');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.items) setItems(data.items.filter((i: InventoryItem) => i.quantity > 0));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (defaultToUserId) setToUserId(defaultToUserId);
  }, [defaultToUserId]);

  const addToInventory = async () => {
    if (!addTitle.trim()) {
      setMessage('Nhập tên món quà');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: addType,
          title: addTitle.trim(),
          amount: addType === 'cash' ? Number(addAmount) : undefined,
          quantity: Number(addQty) || 1,
        }),
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else {
        setMessage('Đã thêm vào kho');
        setAddTitle('');
        setAddAmount('');
        await load();
      }
    } catch (e: any) {
      setMessage(e.message || 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const sendGift = async (mode: 'inventory' | 'cash_direct') => {
    if (!toUserId.trim()) {
      setMessage('Nhập ID / mã user người nhận');
      return;
    }
    setLoading(true);
    setMessage('');
    setBankInfo(null);
    try {
      const body: Record<string, unknown> = {
        toUserId: toUserId.trim(),
        note: note || undefined,
        liveSessionId: liveSessionId || undefined,
      };

      if (mode === 'inventory') {
        if (!selectedId) {
          setMessage('Chọn món trong kho');
          setLoading(false);
          return;
        }
        body.inventoryItemId = selectedId;
      } else {
        const amt = Number(cashAmount);
        if (!amt || amt <= 0) {
          setMessage('Nhập số tiền hợp lệ');
          setLoading(false);
          return;
        }
        body.giftType = 'cash';
        body.title = 'Tiền mặt';
        body.amount = amt;
      }

      const res = await fetch('/api/gift/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage(data.message || 'Thành công');
        if (data.bank) {
          setBankInfo(data.bank);
        }
        await load();
        setSelectedId('');
        setCashAmount('');
      }
    } catch (e: any) {
      setMessage(e.message || 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return <p className="text-sm text-center py-4">Đăng nhập để dùng kho quà & tặng quà</p>;
  }

  return (
    <div
      className="space-y-4 rounded-2xl p-4"
      style={{
        fontFamily: 'var(--font-x)',
        color: 'var(--pl-text)',
        background: 'transparent',
        border: '2px solid var(--pl-frame)',
        boxShadow: '0 0 0 1px rgba(29,41,81,.18)',
      }}
    >
      <h3 className="font-bold text-sm">Kho quà & Tặng quà</h3>
      <p className="text-xs text-black/55 leading-relaxed">
        Thêm sản phẩm / tiền mặt vào kho trên dashboard. Khi tặng tiền mặt, hệ thống lấy STK +
        ngân hàng người nhận đã lưu trên app và tạo link mở app ngân hàng (điền sẵn thông tin).
      </p>

      {/* Thêm vào kho */}
      <div
        className="rounded-xl p-3 space-y-2"
        style={{
          background: 'transparent',
          border: '2px solid var(--pl-frame)',
          boxShadow: '0 0 0 1px rgba(29,41,81,.16)',
        }}
      >
        <p className="text-xs font-bold">Thêm vào kho</p>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setAddType('product')}
            className={`px-3 py-1 rounded-full ${addType === 'product' ? 'bg-red-600 text-white' : 'bg-white border'}`}
          >
            Sản phẩm
          </button>
          <button
            type="button"
            onClick={() => setAddType('cash')}
            className={`px-3 py-1 rounded-full ${addType === 'cash' ? 'bg-red-600 text-white' : 'bg-white border'}`}
          >
            Tiền mặt
          </button>
        </div>
        <input
          className="w-full border rounded-lg p-2 text-sm bg-white"
          placeholder={addType === 'cash' ? 'Tên: VD Tiền mặt 500k' : 'Tên sản phẩm / voucher'}
          value={addTitle}
          onChange={(e) => setAddTitle(e.target.value)}
        />
        {addType === 'cash' && (
          <input
            type="number"
            className="w-full border rounded-lg p-2 text-sm bg-white"
            placeholder="Số tiền (VND)"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
        )}
        <input
          type="number"
          className="w-full border rounded-lg p-2 text-sm bg-white"
          placeholder="Số lượng"
          value={addQty}
          onChange={(e) => setAddQty(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={addToInventory}
          className="w-full py-2 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-50"
        >
          Lưu vào kho
        </button>
      </div>

      {/* Danh sách kho */}
      <div className="space-y-2">
        <p className="text-xs font-bold">Kho của bạn ({items.length})</p>
        {items.length === 0 && (
          <p className="text-xs text-black/40">Chưa có món nào — thêm ở trên.</p>
        )}
        <div className="max-h-40 overflow-y-auto space-y-1">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm"
              style={{
                background: 'transparent',
                border: selectedId === item.id ? '2px solid #E11D48' : '2px solid #1D2951',
                boxShadow: '0 0 0 1px rgba(29,41,81,.12)',
                marginBottom: 6,
              }}
            >
              <input
                type="radio"
                name="inv"
                checked={selectedId === item.id}
                onChange={() => setSelectedId(item.id)}
              />
              <span className="flex-1">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-black/50 ml-1">
                  ×{item.quantity}
                  {item.itemType === 'cash' && item.amount != null
                    ? ` · ${item.amount.toLocaleString('vi-VN')}₫`
                    : ''}
                </span>
              </span>
              <span className="text-[10px] uppercase text-black/40">{item.itemType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Người nhận + gửi */}
      <div className="space-y-2 border-t border-black/10 pt-3">
        <p className="text-xs font-bold">Người nhận</p>
        <input
          className="w-full border rounded-lg p-2 text-sm bg-white"
          placeholder="User ID người nhận"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
        />
        <input
          className="w-full border rounded-lg p-2 text-sm bg-white"
          placeholder="Ghi chú (nội dung CK nếu tiền mặt)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          disabled={loading || !selectedId}
          onClick={() => sendGift('inventory')}
          className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          Tặng món đã chọn trong kho
        </button>

        <div className="flex gap-2 items-center">
          <input
            type="number"
            className="flex-1 border rounded-lg p-2 text-sm bg-white"
            placeholder="Hoặc nhập số tiền mặt (VND)"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
          />
          <button
            disabled={loading}
            onClick={() => sendGift('cash_direct')}
            className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
          >
            Tặng tiền
          </button>
        </div>
      </div>

      {/* Kết quả chuyển khoản */}
      {bankInfo && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 space-y-2 text-xs">
          <p className="font-bold text-green-800">Thông tin chuyển khoản đã điền sẵn</p>
          <p>
            <strong>Ngân hàng:</strong> {bankInfo.bankName}
          </p>
          <p>
            <strong>STK:</strong> {bankInfo.accountNumber}
          </p>
          <p>
            <strong>Tên TK:</strong> {bankInfo.accountName}
          </p>
          <p>
            <strong>Số tiền:</strong> {Number(bankInfo.amount).toLocaleString('vi-VN')}₫
          </p>
          <p>
            <strong>Nội dung:</strong> {bankInfo.content}
          </p>
          {bankInfo.deepLink && (
            <a
              href={bankInfo.deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2 rounded-lg bg-red-600 text-white font-semibold"
            >
              Mở app ngân hàng / VietQR
            </a>
          )}
          {bankInfo.vietQrHint && (
            <p className="text-black/50 break-all">{bankInfo.vietQrHint}</p>
          )}
        </div>
      )}

      {message && (
        <p className="text-xs text-black/70 bg-black/5 rounded-lg px-2 py-1.5">{message}</p>
      )}
    </div>
  );
}
