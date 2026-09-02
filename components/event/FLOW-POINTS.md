# Điểm sticker theo user (trong sự kiện)

Điểm gắn từng sticker, sổ theo **từng user**.

## Cộng điểm
Khi user **nhận sticker** lúc tham gia sự kiện / live:
`điểm += sticker.points × số lượng`

## Dùng điểm
- **Tặng sticker:** trừ đúng `sticker.points × qty` từ số dư người tặng (không đủ thì không gửi).
- **Đổi điểm** (`redeemPoints`): trừ số điểm user chọn.

Tiền mặt / xác nhận CK **không** cộng điểm sticker.

## Sổ
`UserPoints`: `balance` · `earned` · `spent` · `ledger`

Hiện `STICKERS` còn trống — khi có bộ ảnh sẽ gán `points` từng loại.
EOF


## Dùng điểm ngoài live
- Mua hàng / vé: BTC hoặc người bán **tick áp dụng điểm** + nhập số tiền trừ.
- Điểm = voucher. Trừ điểm user, gỡ quà tương ứng khỏi kho user, chuyển sang kho người nhận.
- Nút **Dùng điểm & chuyển quà** (`UseRewardsPanel`) dùng ngoài phiên livestream.
