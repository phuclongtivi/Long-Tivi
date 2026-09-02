# Thanh toán người mua + Boss gắn giao hàng

## Người mua hàng / vé
1. **COD** — trả khi nhận.
2. **Chuyển khoản** — mở NH theo STK hồ sơ người nhận; xác nhận đã/chưa trong app.
3. **Thẻ Visa / Mastercard** — cổng thẻ (credit/debit) kiểu Shopee.
4. **ZaloPay** — mở ví / QR.
5. **MoMo** — mở ví / QR.
6. **Điểm thưởng** — voucher; phần còn lại chọn một trong các cách trên.

Vé live: giá do BTC mặc định (cố định / từ 1.000đ / vé mời). Vé mời = 0đ, không CK.

## Boss gắn ĐVVC
Sau khi đơn `confirmed` + `shipStatus = preparing`:
- Vào `/boss/orders/{orderId}/ship`
- Chọn GHN / GHTK / Viettel Post / J&T / khác
- Dán mã vận đơn → hệ thống tạo **link tracking** gửi khách

Khách xem link ở nửa dưới màn giỏ (tình trạng giao hàng + ngày dự kiến).
EOF
