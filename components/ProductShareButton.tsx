'use client';

/**
 * Nút chia sẻ sản phẩm superBUY™ → chọn MXH + tạo mã refer cho user
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const PLATFORMS: { id: string; label: string; color: string }[] = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'tiktok', label: 'TikTok', color: '#010101' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000' },
  { id: 'zalo', label: 'Zalo', color: '#0068FF' },
  { id: 'shopee', label: 'Shopee', color: '#EE4D2D' },
];

type Props = {
  productId: string;
  productName?: string;
  compact?: boolean;
};

export default function ProductShareButton({ productId, productName, compact }: Props) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [result, setResult] = useState<{
    shareUrl: string;
    referCode: string;
    shareText?: string;
    deepLinks?: { open?: string | null; copy?: string; note?: string };
    platform?: string;
  } | null>(null);

  const share = async (platform: string) => {
    if (status !== 'authenticated') {
      setMsg('Vui lòng đăng nhập để chia sẻ và nhận hoa hồng giới thiệu.');
      return;
    }
    setLoading(true);
    setMsg('');
    setResult(null);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, platform }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Không tạo được link chia sẻ');
        setLoading(false);
        return;
      }
      setResult({
        shareUrl: data.shareUrl,
        referCode: data.referCode,
        shareText: data.shareText,
        deepLinks: data.deepLinks,
        platform,
      });
      setMsg(data.message || 'Đã tạo link + mã refer');

      const text = data.shareText || data.shareUrl;
      if (data.deepLinks?.copy && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.deepLinks.copy || text).catch(() => null);
      }
      if (data.deepLinks?.open) {
        window.open(data.deepLinks.open, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setMsg('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
          setMsg('');
          setResult(null);
        }}
        className={
          compact
            ? 'text-[10px] font-bold px-2 py-1 rounded-full border'
            : 'w-full text-xs font-bold py-2 rounded-lg border'
        }
        style={{
          borderColor: '#D4C9B5',
          backgroundColor: '#1A1A1A',
          color: '#F5F0E6',
        }}
        aria-label="Chia sẻ sản phẩm"
      >
        {compact ? 'Chia sẻ' : 'Chia sẻ · nhận hoa hồng'}
      </button>

      {open && (
        <div
          className="absolute z-20 right-0 mt-1 w-64 rounded-xl border shadow-xl p-3 space-y-2"
          style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[11px] font-bold text-[#1A1A1A]">
            Chia sẻ {productName ? `“${productName.slice(0, 28)}”` : 'sản phẩm'} lên
          </p>
          <p className="text-[10px] text-black/55">
            Mỗi lần chọn sẽ tạo <strong>mã refer riêng</strong> của bạn. Người mua qua link → hoa
            hồng về tài khoản bạn.
          </p>

          {status !== 'authenticated' && (
            <p className="text-[11px] font-semibold text-red-700">
              Cần{' '}
              <Link href="/login" className="underline">
                đăng nhập
              </Link>{' '}
              trước khi chia sẻ.
            </p>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={loading || status !== 'authenticated'}
                onClick={() => share(p.id)}
                className="text-[11px] font-bold py-2 rounded-lg text-white disabled:opacity-40"
                style={{ backgroundColor: p.color }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {loading && <p className="text-[10px] text-black/50">Đang tạo link refer…</p>}
          {msg && <p className="text-[10px] font-semibold text-black/70">{msg}</p>}

          {result && (
            <div className="text-[10px] space-y-1 pt-1 border-t" style={{ borderColor: '#E8DFD0' }}>
              <p>
                Mã refer: <strong className="font-mono">{result.referCode}</strong>
              </p>
              <p className="break-all text-black/60">{result.shareUrl}</p>
              {result.deepLinks?.note && (
                <p className="text-black/50">{result.deepLinks.note} (đã copy nội dung)</p>
              )}
              <button
                type="button"
                className="underline font-bold"
                style={{ color: '#C41E3A' }}
                onClick={() => {
                  const t = result.shareText || result.shareUrl;
                  navigator.clipboard?.writeText(t);
                  setMsg('Đã copy lại link + nội dung');
                }}
              >
                Copy lại link
              </button>
            </div>
          )}

          <button
            type="button"
            className="text-[10px] text-black/40 w-full text-center"
            onClick={() => setOpen(false)}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
