# Cập nhật Home, Chat, LIVE và Mixer

## User tạo thông báo tổ chức ở đâu?

Thông báo tổ chức được tạo trong tab **Home**:

1. Đăng nhập ứng dụng.
2. Mở tab **Home**.
3. Chọn nút **Thông báo** trên hàng công cụ phía trên.
4. Điền tiêu đề, thời gian, địa điểm, vé, quà, khách mời và nội dung giới thiệu.
5. Kiểm tra nội dung rồi hoàn tất. Thông báo mới xuất hiện trên Home.

Tạo thông báo không bật camera và không tạo phòng LIVE. Khi cần phát ngay, user mở tab
**LIVE** → **Tạo phòng LIVE** → chỉnh Mixer → **Phát LIVE**.

## Chat trong Home

Mỗi tiêu đề thông báo có nút **＋ Room** và giọt **💧**. User đã đăng nhập có thể tạo tối
đa 3 room cho một thông báo. Giọt nước mở danh sách room của đúng thông báo đó.

## Cấu hình Mixer

Mixer tự lưu sau khi thay đổi và đồng bộ theo tài khoản. Bản gần nhất xuất hiện tại
**Menu → Bàn Mixer của tôi**. Nếu thiết bị camera/micro cũ không còn, trình duyệt dùng
thiết bị mặc định và user có thể chọn lại.

## Cập nhật cơ sở dữ liệu

Phiên bản này thêm `UserMixerPreset` và hai trường của `EventChatRoom`. Trước khi deploy:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

Sao lưu database trước khi chạy `prisma db push` trên production. Không đưa `.env` hoặc
API key vào Git.
