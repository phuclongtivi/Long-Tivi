# Thiết lập vật phẩm và AI Vision cho livestream

Tính năng nằm tại trang **Phát Livestream** (`/live`). Người tổ chức có thể kéo vật phẩm,
đổi kích thước, xoay, ẩn/hiện và lưu bố cục theo phòng live. Lớp vật phẩm được vẽ vào
canvas stream nên người xem nhận được trong video đầu ra.

## Cấu hình AI

Đặt ít nhất một API key trong môi trường triển khai (không đưa key vào Git):

```env
LIVE_VISION_PROVIDER=auto
OPENAI_API_KEY=
OPENAI_VISION_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
```

`auto` ưu tiên OpenAI khi có key, sau đó dùng Gemini. Trong giao diện, người tổ chức có
thể chọn riêng OpenAI hoặc Gemini để kiểm tra.

## Cách dùng

1. Mở `/live`, cho phép camera và nhấn **Quét vật thể**.
2. Khung xanh hiển thị người/vật/sản phẩm AI tìm thấy.
3. Chạm một khung xanh để gắn thẻ sản phẩm vào vật thể đó.
4. Bật **Tự quét và bám theo mỗi 5 giây** nếu cần theo dõi liên tục.
5. Chạm vật phẩm để chỉnh nội dung, kích thước, góc xoay hoặc xóa.

Ảnh camera được thu nhỏ tối đa 960px và nén trước khi gửi. API yêu cầu phiên đăng nhập,
giới hạn kích thước ảnh và giữ API key ở server. Nên bổ sung rate limit tập trung trước
khi mở tính năng tự quét cho lượng người dùng lớn.
