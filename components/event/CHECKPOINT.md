# Checkpoint 0.9.28 — 2026-08-28 14:40 +07

## Mạch đã nối
1. Tạo sự kiện → trừ điểm khung khán giả/khách mời → `paidAudienceCap` = trần đã trả → Đăng lên Home không duyệt.
2. Tab LIVE → Xem nhanh / Mua vé / Góp vé → cinema fullscreen + ghế 3 hàng + Mua nhanh.
3. BTC: video fullscreen đến Kết thúc live; Full/Thu/Ẩn chỉ bàn nút; cảnh báo 90/93/95%.
4. CCCD xong → sinh AI → TermsGate tick đồng ý.
5. Dashboard: Hướng dẫn + Điều khoản (3 ngôn ngữ) + bản quyền v0.9.28 + www.phuclongtivi.com.
6. Điểm sticker 1 = 1.000đ; AI 0.5/1 điểm; quà 3 cấp.

## Copy lên GitHub
- `components/event/` ← toàn bộ thư mục này
- `components/DashboardClient.tsx`, `BottomNav.tsx` từ `long-pack/components/`
- `public/legal/*.pdf`
- `app/events/page.tsx` render `<EventsLiveScreen posts={...} />`
- `app/live/[id]/host/page.tsx` render `<OrganizerLiveDesk />`
