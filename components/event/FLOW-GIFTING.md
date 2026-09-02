# Luồng tặng quà trong livestream / sự kiện

Áp dụng **mọi** sự kiện có phiên live (Live, Có quà, Vé).

## Role trong phiên (không phải hạng app)
- Người khởi tạo = **organizer** của phiên.
- BTC gắn 1+ user thành **performer** (nghệ sỹ / người biểu diễn) **chỉ trong phiên đó**.
- Còn lại = **guest**.
- Hạng app (User / Nghệ sỹ / Phóng viên…) **không** quyết định ai được nhận quà.

## Ai tặng ai
Ai cũng tặng được ai trong phiên:
- BTC → khách / performer
- Khách → BTC / performer
- Khách ↔ khách
Không tự tặng mình.

## 2 loại quà
1. **Tiền mặt**
   - Mở app ngân hàng theo STK người nhận đã kê khai lúc đăng ký user.
   - Chuyển khoản ngoài app. App không theo dõi giao dịch ngân hàng.
   - Quay lại: chỉ xác nhận **Đã hoàn tất** / **Chưa hoàn tất**.
   - Hoàn tất → thả sticker tiền trên live + cộng kho.
   - Chưa hoàn tất → không hiện sticker trên live.
2. **Sticker** (điểm từng loại) → kho sticker + điểm người nhận.

Bộ sticker + điểm: chờ file bạn gửi, `STICKERS` hiện để trống.

## Sau khi tặng
`sendGift` → `GiftRecord` → `applyGift` cập nhật **Kho quà** trên dashboard user nhận.

## UI
- Trong live: nút Tặng quà trên từng người (BTC / performer / khách).
- Dashboard user: `GiftWarehousePanel` (tiền + sticker + tổng điểm).
EOF


## Mở khoá kho quà — 3 đợt
1. User mới + điền **họ tên + số CCCD** (khớp căn cước) → mở kho + **quà cấp 1**.
2. Hạng **Phóng viên** → **quà cấp 2**.
3. Hạng **Nghệ sỹ** → **quà cấp 3**.
Chưa đủ CCCD: kho đóng, không dùng quà.
Sticker/điểm từng loại: chờ quy tắc + bộ ảnh.


## Gắn vào luồng khác
- Hướng dẫn live: `LiveGiftGuide`
- Feed sự kiện có vé + BTC tick điểm: dòng “Có thể trừ điểm vào vé”
- Màn đặt vé: trừ điểm như voucher rồi xác nhận
- Ngoài live: `UseRewardsPanel`
