'use client';

/**
 * Ví tiền số Layer 1 Ethereum — user nhập & lưu để quản lý
 */

import { useState } from 'react';

function isValidEthAddress(addr: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
}

export default function EthWalletForm({
  initialAddress,
  initialLabel,
}: {
  initialAddress?: string | null;
  initialLabel?: string | null;
}) {
  const [address, setAddress] = useState(initialAddress || '');
  const [label, setLabel] = useState(initialLabel || '');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const trimmed = address.trim();
    if (trimmed && !isValidEthAddress(trimmed)) {
      setMsg('Địa chỉ không hợp lệ. Ví dụ: 0x + 40 ký tự hex (Ethereum Layer 1).');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ethWalletAddress: trimmed || null,
          ethWalletLabel: label.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Không lưu được');
        return;
      }
      setMsg('Đã lưu ví Ethereum Layer 1.');
    } catch {
      setMsg('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-black/60">
        Địa chỉ ví <strong>Ethereum mạng Layer 1</strong> (chuỗi chính, không phải L2). Dùng để quản
        lý / nhận tài sản số khi hệ thống hỗ trợ. Không nhập seed phrase hay private key.
      </p>
      <div>
        <label className="text-xs font-semibold block mb-1">Địa chỉ ví (0x…)</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x…"
          spellCheck={false}
          className="w-full px-3 py-2 text-sm rounded-lg border font-mono"
          style={{ backgroundColor: '#F5F0E6', borderColor: '#D4C9B5', color: '#1A1A1A' }}
        />
      </div>
      <div>
        <label className="text-xs font-semibold block mb-1">Nhãn (tuỳ chọn)</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="VD: MetaMask chính, Ledger…"
          className="w-full px-3 py-2 text-sm rounded-lg border"
          style={{ backgroundColor: '#F5F0E6', borderColor: '#D4C9B5', color: '#1A1A1A' }}
        />
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={save}
        className="w-full py-2.5 text-sm font-bold rounded-xl text-white disabled:opacity-50"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        {loading ? 'Đang lưu…' : 'Lưu ví Ethereum L1'}
      </button>
      {msg && <p className="text-xs font-semibold">{msg}</p>}
    </div>
  );
}
