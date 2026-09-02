'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const THEME_LABEL: Record<string, string> = {
  SanPhamMoi: 'Sản phẩm mới',
  DichVuMoi: 'Dịch vụ mới',
};

export default function PromoPage() {
  const params = useParams();
  const theme = String(params.theme || 'SanPhamMoi');
  const label = THEME_LABEL[theme] || theme;
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/promotions?theme=${encodeURIComponent(theme)}`);
        const data = await res.json();
        setPromotions(data.promotions || []);
      } catch {
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [theme]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F5F0E6', color: '#1A1A1A' }}>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <Link href="/" className="text-sm font-semibold underline">
          ← Về trang chủ
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-1">
          {theme === 'SanPhamMoi' ? '🔥' : '✨'} {label}
        </h1>
        <p className="text-sm mb-6" style={{ color: '#333' }}>
          Thông tin & chương trình <strong>thưởng</strong>, <strong>ưu đãi</strong> dành cho người
          tham gia buổi livestream.
        </p>

        {loading ? (
          <p className="text-sm">Đang tải...</p>
        ) : (
          <div className="space-y-4">
            {promotions.map((p) => (
              <article
                key={p.id}
                className="rounded-xl border p-4"
                style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
              >
                <h2 className="font-bold text-base mb-2">{p.title}</h2>
                {p.description && (
                  <p className="text-sm mb-3" style={{ color: '#333' }}>
                    {p.description}
                  </p>
                )}
                <div
                  className="rounded-lg p-3 mb-2 text-sm"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
                >
                  <p className="font-bold text-xs mb-1" style={{ color: '#DC2626' }}>
                    🎁 Chương trình thưởng
                  </p>
                  <p style={{ color: '#1A1A1A' }}>
                    {p.rewardProgram || 'Tham gia live để nhận thưởng theo quy định AI Admin.'}
                  </p>
                </div>
                <div
                  className="rounded-lg p-3 text-sm"
                  style={{ backgroundColor: '#FFF7ED', border: '1px solid #FDBA74' }}
                >
                  <p className="font-bold text-xs mb-1" style={{ color: '#8B4513' }}>
                    🏷️ Chương trình ưu đãi
                  </p>
                  <p style={{ color: '#1A1A1A' }}>
                    {p.discountProgram || 'Ưu đãi dành cho người xem livestream.'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <Link
          href="/store"
          className="inline-block mt-6 px-4 py-2 rounded-xl text-sm font-bold"
          style={{ backgroundColor: '#1A1A1A', color: '#F5F0E6' }}
        >
          Xem gian hàng →
        </Link>
      </div>
    </main>
  );
}
