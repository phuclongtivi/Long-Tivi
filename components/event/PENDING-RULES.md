# Bảng nhớ — gắn code 1 lần khi user yêu cầu

Cập nhật 2026-08-28. Không merge vào app cho đến khi được bảo «cập nhật code».

## Âm điểm + livestream

- User được tiếp tục dùng app khi **điểm sticker âm**.
- Điều kiện: đã **hoàn tất thao tác mua sticker** để trả phí khởi tạo phiên livestream (form số khách mời / khán giả).
- Chưa mua sticker trả phí tạo live → không áp hạn mức âm này.
- Nợ điểm: sticker Boss/Admin gửi sau trừ nợ trước. Tối đa 2 sự kiện liên tiếp khi đang âm (rule cũ, giữ).

## Âm điểm + trợ lý AI

- Khi đang âm điểm (và đã mua sticker trả phí live như trên):
  - Được **thêm tối đa 10 câu** trả lời từ trợ lý (gõ **hoặc** giọng).
  - Hết 10 câu → màn hướng dẫn mua sticker + điểm superBUY™ (đã bỏ gói chatbot ngày).
- Bảng chi tiêu điểm → số giây giọng / số lượt lệnh: **chờ user gửi**.

## Chưa gắn (chờ 1 lần)

| Mục | Trạng thái |
|---|---|
| Âm điểm + đã mua sticker phí live → vẫn tạo / dùng | nhớ |
| +10 câu AI khi âm điểm | nhớ |
| Bảng hạn mức chi tiêu sticker cho AI | chờ số |
| Gỡ hẳn API gói 10k/20k/50k câu/ngày phía server | nhớ, làm cùng batch |
