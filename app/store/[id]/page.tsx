'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductShareButton from '@/components/ProductShareButton';
import { useParams } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  imageUrl?: string | null;
  bestPrice?: number | null;
  originalPrice?: number | null;
  latestInfo?: string | null;
  theme?: string | null;
  fromArchive?: boolean;
  videoUrl?: string | null;
  sourceLiveDate?: string | null;
};

export default function StoreProductDetailPage() {
  const params = useParams();
  const id = String(params.id || '');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyMsg, setBuyMsg] = useState('');
  const [referCode, setReferCode] = useState<string | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) setReferCode(ref);
      // Nếu vào từ QR share URL, giữ full href làm qrPayload
      if (params.get('qr') === '1' || window.location.pathname.includes('/u/')) {
        setQrPayload(window.location.href);
      }
      if (params.get('fromQr')) {
        setQrPayload(window.location.href);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/store/${id}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setProduct(null);
        } else {
          setProduct(data.product);
        }
      } catch {
        setError('Lỗi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);


  const handleBuy = async () => {
    if (!product) return;
    setBuyLoading(true);
    setBuyMsg('');
    try {
      const amount =
        product.bestPrice != null && product.bestPrice > 0
          ? product.bestPrice
          : 0;
      if (amount <= 0) {
        setBuyMsg('Sản phẩm chưa có giá. Liên hệ Admin để cập nhật giá trước khi đặt.');
        setBuyLoading(false);
        return;
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.fromArchive ? undefined : product.id,
          productName: product.name,
          amount,
          referCode: referCode || undefined,
          qrPayload: qrPayload || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setBuyMsg(data.error);
      } else {
        setBuyMsg(
          data.order?.note
            ? `Đặt hàng thành công. ${data.order.note} Hoa hồng: ${data.order.commissionAmount?.toLocaleString?.('vi-VN') ?? data.order.commissionAmount}₫`
            : 'Đặt hàng thành công.'
        );
      }
    } catch {
      setBuyMsg('Lỗi đặt hàng');
    } finally {
      setBuyLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E6' }}>
        <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Đang tải...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen p-6" style={{ backgroundColor: '#F5F0E6', color: '#1A1A1A' }}>
        <Link href="/store" className="text-sm font-semibold underline">← Gian hàng</Link>
        <p className="mt-6 font-bold">{error || 'Không tìm thấy'}</p>
      </main>
    );
  }

  const discount =
    product.originalPrice && product.bestPrice && product.originalPrice > product.bestPrice
      ? Math.round((1 - product.bestPrice / product.originalPrice) * 100)
      : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F5F0E6', color: '#1A1A1A' }}>
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <nav className="text-xs mb-4 flex flex-wrap gap-2" style={{ color: '#333' }}>
          <Link href="/" className="underline font-semibold">Trang chủ</Link>
          <span>/</span>
          <Link href="/store" className="underline font-semibold">Gian hàng</Link>
          <span>/</span>
          <span className="font-bold line-clamp-1" style={{ color: '#1A1A1A' }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ảnh */}
          <div
            className="rounded-xl border aspect-square flex items-center justify-center overflow-hidden relative"
            style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <span className="text-6xl">{product.type === 'service' ? '✨' : '📦'}</span>
            )}
            {discount != null && (
              <span
                className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded"
                style={{ backgroundColor: '#DC2626', color: '#fff' }}
              >
                Giảm {discount}%
              </span>
            )}
          </div>

          {/* Thông tin kiểu Amazon */}
          <div className="flex flex-col">
            <p className="text-xs font-semibold mb-1" style={{ color: '#666' }}>
              {product.type === 'service' ? 'Dịch vụ' : 'Sản phẩm'}
              {product.theme ? ` · ${product.theme}` : ''}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              {product.name}
            </h1>

            <div
              className="rounded-xl border p-4 mb-4"
              style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
            >
              {product.bestPrice != null ? (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
                    {product.bestPrice.toLocaleString('vi-VN')}
                    <span className="text-base">₫</span>
                  </span>
                  {product.originalPrice != null && product.originalPrice > product.bestPrice && (
                    <>
                      <span className="text-sm line-through" style={{ color: '#666' }}>
                        {product.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                      {discount != null && (
                        <span className="text-sm font-bold" style={{ color: '#DC2626' }}>
                          Tiết kiệm {discount}%
                        </span>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="font-bold" style={{ color: '#8B4513' }}>
                  Giá tốt nhất — cập nhật bởi AI Admin
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: '#333' }}>
                Chính sách giá tốt nhất theo thông tin livestream & AI Admin.
              </p>
            </div>

            {product.description && (
              <div className="mb-4">
                <h2 className="text-sm font-bold mb-1">Mô tả</h2>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#333' }}>
                  {product.description}
                </p>
              </div>
            )}

            {product.latestInfo && (
              <div
                className="rounded-xl p-4 mb-4 text-sm"
                style={{ backgroundColor: '#EDE6D9', color: '#1A1A1A' }}
              >
                <h2 className="font-bold text-xs mb-1">Thông tin mới nhất (AI Admin)</h2>
                <p className="whitespace-pre-wrap">{product.latestInfo}</p>
              </div>
            )}

            {product.sourceLiveDate && (
              <p className="text-xs mb-4" style={{ color: '#333' }}>
                Liên quan livestream:{' '}
                {new Date(product.sourceLiveDate).toLocaleString('vi-VN')}
              </p>
            )}

            {(referCode || qrPayload) && (
              <p className="text-xs mb-2 font-semibold" style={{ color: '#8B4513' }}>
                {referCode
                  ? `Mã giới thiệu (ref): ${referCode}`
                  : 'Đang gắn refer từ mã QR chia sẻ'}
              </p>
            )}

            <button
              type="button"
              onClick={handleBuy}
              disabled={buyLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-base font-bold mb-3 disabled:opacity-50"
              style={{ backgroundColor: '#DC2626', color: '#fff' }}
            >
              {buyLoading ? 'Đang xử lý...' : '🛒 Mua ngay'}
            </button>
            <div className="mb-3 max-w-xs">
              <ProductShareButton productId={product.id} productName={product.name} />
            </div>
            {buyMsg && (
              <p className="text-xs font-semibold mb-3 whitespace-pre-wrap" style={{ color: '#1A1A1A' }}>
                {buyMsg}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-auto">
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg text-sm font-bold"
                  style={{ backgroundColor: '#8B4513', color: '#FAF7F0' }}
                >
                  Xem video liên quan
                </a>
              )}
              <Link
                href="/store"
                className="px-4 py-2.5 rounded-lg text-sm font-bold border"
                style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
              >
                ← Về gian hàng
              </Link>
              <Link
                href={product.type === 'service' ? '/promo/DichVuMoi' : '/promo/SanPhamMoi'}
                className="px-4 py-2.5 rounded-lg text-sm font-bold"
                style={{ backgroundColor: '#1A1A1A', color: '#F5F0E6' }}
              >
                Thưởng & ưu đãi live
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
