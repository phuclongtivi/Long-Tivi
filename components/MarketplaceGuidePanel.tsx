'use client';

/**
 * Hướng dẫn gắn sản phẩm / tạo gian hàng trên Shopee, TikTok, Facebook
 * Chọn nền tảng → các bước cố định + mở chatbot Phúc hỏi có cần giúp không
 */

import { useState } from 'react';
import { openPhucChat } from './AdminAIChatbot';

type Platform = 'shopee' | 'tiktok' | 'facebook';

const PLATFORMS: {
  id: Platform;
  name: string;
  color: string;
  official: string;
}[] = [
  {
    id: 'shopee',
    name: 'Shopee',
    color: '#EE4D2D',
    official: 'https://banhang.shopee.vn/',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    color: '#010101',
    official: 'https://seller.tiktok.com/',
  },
  {
    id: 'facebook',
    name: 'Facebook / Instagram Shop',
    color: '#1877F2',
    official: 'https://www.facebook.com/business/tools/facebook-shops',
  },
];

const STEPS: Record<
  Platform,
  { title: string; steps: string[]; tips: string[] }
> = {
  shopee: {
    title: 'Tạo / gắn sản phẩm trên Shopee',
    steps: [
      'Đăng ký / đăng nhập Seller Centre: banhang.shopee.vn (tài khoản bán hàng đã xác minh CCCD/MST nếu cần).',
      'Vào mục Sản phẩm → Thêm sản phẩm mới (hoặc Công cụ → nhập hàng loạt bằng file Excel nếu có nhiều SP).',
      'Điền tên, mô tả, phân loại ngành hàng, giá, kho, cân nặng, ảnh (≥ 1 ảnh vuông rõ nét).',
      'Có thể mở song song app Long → superBUY™ / gian Nghệ sĩ để copy tên, mô tả, giá tốt nhất sang Shopee (không dán link vi phạm chính sách nếu sàn cấm).',
      'Bật vận chuyển (GHN, GHTK, Shopee Xpress…) và nộp sản phẩm chờ duyệt (nếu ngành hàng yêu cầu).',
      'Sau khi live trên Shopee: lưu link sản phẩm vào ghi chú / dashboard Long để theo dõi và chia sẻ kèm mã refer khi livestream.',
    ],
    tips: [
      'Ảnh và giá trên Shopee nên khớp cam kết khi livestream trên Long.',
      'Xuất CSV từ gian Long (khi có) giúp nhập hàng loạt nhanh hơn.',
      'Không dùng tool tự động đăng nhập hộ — dễ khóa shop.',
    ],
  },
  tiktok: {
    title: 'Tạo / gắn sản phẩm trên TikTok Shop',
    steps: [
      'Đăng ký Seller TikTok Shop (seller.tiktok.com hoặc app Seller) và hoàn tất KYC.',
      'Vào Quản lý sản phẩm → Thêm sản phẩm (hoặc liên kết kho nếu dùng đối tác).',
      'Nhập tên, mô tả ngắn phù hợp video, giá, tồn kho, ảnh/video minh họa.',
      'Gắn sản phẩm vào video / LIVE TikTok (giỏ vàng) khi phát sóng; trên app Long có thể livestream song song và nhắc link/shop.',
      'Đồng bộ thông tin khuyến mãi với chương trình trên Long (siêu sale, quà livestream) để tránh lệch giá.',
      'Theo dõi đơn trên Seller Center; với đơn phát sinh từ refer Long, ghi nhận hoa hồng theo chính sách app.',
    ],
    tips: [
      'Video ngắn + giỏ hàng TikTok thường chuyển đổi tốt hơn chỉ đăng ảnh.',
      'Nội dung LIVE cần tuân thủ cộng đồng TikTok (không claim sai sự thật).',
    ],
  },
  facebook: {
    title: 'Tạo / gắn sản phẩm trên Facebook & Instagram Shop',
    steps: [
      'Tạo Meta Business Suite + Trang Facebook (và Instagram chuyên nghiệp nếu bán IG).',
      'Bật Facebook Shops / Commerce Manager: tạo Catalog (danh mục sản phẩm).',
      'Thêm sản phẩm thủ công hoặc tải file CSV catalog (id, title, description, price, image_link, link…).',
      'Copy thông tin từ superBUY™ / gian Nghệ sĩ trên Long vào catalog (giá VND, ảnh đủ nét).',
      'Gắn Shop vào Trang / Instagram; có thể gắn sản phẩm vào bài viết hoặc livestream Facebook.',
      'Dùng link sản phẩm / catalog khi chia sẻ từ app Long để dễ đối soát đơn và refer.',
    ],
    tips: [
      'Commerce Manager cần xác minh doanh nghiệp ở một số quốc gia.',
      'Ảnh sản phẩm nên nền sạch, tỉ lệ theo gợi ý Meta.',
    ],
  },
};

export default function MarketplaceGuidePanel() {
  const [platform, setPlatform] = useState<Platform | null>(null);

  const openPhuc = (p: Platform) => {
    const name = PLATFORMS.find((x) => x.id === p)?.name || p;
    openPhucChat('marketplace', {
      platform: name,
      message: `[Hướng dẫn gian hàng ${name}] Tôi đã xem các bước trên Dashboard. Bạn (Phúc) hãy hỏi tôi cần giúp gì thêm không, rồi hướng dẫn chi tiết theo câu trả lời của tôi.`,
    });
  };

  return (
    <section
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
    >
      <div>
        <h2 className="font-bold text-[#1A1A1A]">
          Hướng dẫn gắn sản phẩm / tạo gian hàng
        </h2>
        <p className="text-xs text-black/60 mt-1">
          Chọn <strong>Shopee</strong>, <strong>TikTok Shop</strong> hoặc{' '}
          <strong>Facebook / Instagram Shop</strong> để xem từng bước. App Long
          không đăng hộ vào sàn — bạn thao tác trên Seller Centre của sàn; Phúc
          AI hỗ trợ khi bạn cần.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPlatform(p.id);
              // Mở Phúc hỏi có cần giúp không
              openPhuc(p.id);
            }}
            className="text-xs font-bold px-3 py-2 rounded-full text-white"
            style={{
              backgroundColor: platform === p.id ? p.color : '#1A1A1A',
              opacity: platform && platform !== p.id ? 0.7 : 1,
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {platform && (
        <div
          className="rounded-xl border bg-white p-3 space-y-2"
          style={{ borderColor: '#E8DFD0' }}
        >
          <h3 className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
            {STEPS[platform].title}
          </h3>
          <ol className="list-decimal pl-4 space-y-1.5 text-xs text-black/80">
            {STEPS[platform].steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="pt-2 border-t" style={{ borderColor: '#E8DFD0' }}>
            <p className="text-[11px] font-semibold mb-1">Gợi ý</p>
            <ul className="list-disc pl-4 text-[11px] text-black/60 space-y-0.5">
              {STEPS[platform].tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <a
            href={PLATFORMS.find((x) => x.id === platform)!.official}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-bold underline mt-1"
            style={{ color: '#C41E3A' }}
          >
            Mở trang bán hàng chính thức →
          </a>
          <button
            type="button"
            onClick={() => openPhuc(platform)}
            className="block w-full mt-2 text-sm font-bold py-2.5 rounded-xl text-white"
            style={{ backgroundColor: '#8B4513' }}
          >
            Hỏi Phúc — cần giúp thêm?
          </button>
        </div>
      )}
    </section>
  );
}
