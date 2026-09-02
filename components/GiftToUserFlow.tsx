'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type InventoryItem = {
  id: string;
  itemType: string;
  title: string;
  amount?: number | null;
  quantity: number;
};

type BankPayload = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  deepLink?: string;
  vietQrHint?: string;
};

type Step = 'closed' | 'confirm_intent' | 'pick_gift' | 'transfer';

type Props = {
  recipientUserId: string;
  recipientName?: string;
  liveSessionId?: string;
  open?: boolean;
  onClose?: () => void;
  triggerLabel?: string;
  className?: string;
};

export default function GiftToUserFlow({
  recipientUserId,
  recipientName,
  liveSessionId,
  open: controlledOpen,
  onClose,
  triggerLabel = 'Tặng quà',
  className = '',
}: Props) {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>('closed');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bank, setBank] = useState<BankPayload | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const isOpen = controlledOpen !== undefined ? controlledOpen : step !== 'closed';

  const close = () => {
    setStep('closed');
    setSelectedId('');
    setNote('');
    setError('');
    setBank(null);
    setSuccessMsg('');
    onClose?.();
  };

  const openIntent = () => {
    if (!session?.user) {
      setError('Vui lòng đăng nhập để tặng quà');
      setStep('confirm_intent');
      return;
    }
    if (session.user.id === recipientUserId) {
      setError('Không thể tự tặng quà cho mình');
      setStep('confirm_intent');
      return;
    }
    setError('');
    setStep('confirm_intent');
  };

  useEffect(() => {
    if (controlledOpen === true && step === 'closed') {
      openIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledOpen]);

  const loadInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setItems((data.items || []).filter((i: InventoryItem) => i.quantity > 0));
    } catch {
      setItems([]);
    }
  }, []);

  const goPickGift = async () => {
    setLoading(true);
    setError('');
    await loadInventory();
    setLoading(false);
    setStep('pick_gift');
  };

  const confirmGift = async () => {
    if (!selectedId) {
      setError('Hãy chọn một món quà trong túi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gift/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: recipientUserId,
          inventoryItemId: selectedId,
          note: note || undefined,
          liveSessionId: liveSessionId || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      if (data.bank) {
        setBank(data.bank);
        setSuccessMsg('');
      } else {
        setBank(null);
        setSuccessMsg(data.message || 'Đã tặng quà thành công');
      }
      setStep('transfer');
    } catch (e: any) {
      setError(e.message || 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  };

  const displayName = recipientName || recipientUserId.slice(0, 8) + '…';

  if (!isOpen && controlledOpen === undefined) {
    return (
      <button
        type="button"
        onClick={openIntent}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-red-600 text-white ${className}`}
      >
        {triggerLabel}
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: '#F5F0E6', color: '#1A1A1A', fontFamily: 'var(--font-x)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <h3 className="font-bold text-sm">
            {step === 'confirm_intent' && 'Tặng quà'}
            {step === 'pick_gift' && 'Chọn quà trong túi'}
            {step === 'transfer' && (bank ? 'Chuyển khoản quà tặng' : 'Hoàn tất')}
          </h3>
          <button type="button" onClick={close} className="text-lg leading-none px-1 text-black/50">
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          {step === 'confirm_intent' && (
            <>
              <p className="text-sm leading-relaxed">
                Bạn muốn tặng quà cho <strong>{displayName}</strong>?
              </p>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-sm font-semibold bg-white"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={loading || (error.includes('đăng nhập') || error.includes('tự tặng'))}
                  onClick={goPickGift}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  Đồng ý
                </button>
              </div>
            </>
          )}

          {step === 'pick_gift' && (
            <>
              <p className="text-xs text-black/55">
                Người nhận: <strong>{displayName}</strong>
              </p>
              {items.length === 0 ? (
                <p className="text-sm text-black/50 py-4 text-center">
                  Túi quà trống. Thêm món tại Dashboard → Kho quà.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-sm ${
                        selectedId === item.id
                          ? 'border-red-600 bg-red-50'
                          : 'border-black/10 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gift-pick"
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                      <span className="flex-1">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-black/45 ml-1">
                          ×{item.quantity}
                          {item.itemType === 'cash' && item.amount != null
                            ? ` · ${Number(item.amount).toLocaleString('vi-VN')}₫`
                            : ''}
                        </span>
                      </span>
                      <span className="text-[10px] uppercase text-black/35">{item.itemType}</span>
                    </label>
                  ))}
                </div>
              )}
              <input
                className="w-full border border-black/15 rounded-lg p-2 text-sm bg-white"
                placeholder="Ghi chú / nội dung chuyển khoản"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('confirm_intent')}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-sm font-semibold bg-white"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={loading || !selectedId}
                  onClick={confirmGift}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý…' : 'Đồng ý tặng'}
                </button>
              </div>
            </>
          )}

          {step === 'transfer' && (
            <>
              {bank ? (
                <>
                  <p className="text-xs text-black/55 leading-relaxed">
                    Thông tin bên nhận đã điền sẵn theo tài khoản trên app. Hoàn tất chuyển khoản
                    trên app ngân hàng của bạn.
                  </p>
                  <div className="rounded-xl bg-white border border-black/10 p-3 space-y-1.5 text-sm">
                    <Row label="Ngân hàng" value={bank.bankName} />
                    <Row label="Số tài khoản" value={bank.accountNumber} />
                    <Row label="Chủ tài khoản" value={bank.accountName} />
                    <Row
                      label="Số tiền"
                      value={`${Number(bank.amount).toLocaleString('vi-VN')}₫`}
                    />
                    <Row label="Nội dung" value={bank.content} />
                  </div>
                  {bank.deepLink && (
                    <a
                      href={bank.deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-3 rounded-xl bg-red-600 text-white text-sm font-bold"
                    >
                      Mở app ngân hàng / VietQR
                    </a>
                  )}
                  {bank.vietQrHint && (
                    <p className="text-[10px] text-black/40 break-all">{bank.vietQrHint}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-center py-4 text-green-700 font-medium">
                  {successMsg || 'Đã tặng quà thành công.'}
                </p>
              )}
              <button
                type="button"
                onClick={close}
                className="w-full py-2.5 rounded-xl border border-black/15 text-sm font-semibold bg-white"
              >
                Đóng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-black/45 text-xs shrink-0">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  );
}
