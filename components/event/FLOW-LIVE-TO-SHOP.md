# Luồng: tạo phiên live → thông tin SP → lên gian hàng

## Ai được làm
Nghệ sỹ / Phóng viên (và Admin/Boss nếu dùng cùng form).

## Bước
1. User mở **Khởi tạo livestream giới thiệu sản phẩm**.
2. Điền thông tin phiên live (tiêu đề, giờ…).
3. Trong cùng màn, thêm tối đa **5 sản phẩm**:
   - Tên SP + các trường kiểu Shopee (mô tả, danh mục, giá, tồn, 2 dòng ưu đãi, ảnh…).
4. Bấm **Xác nhận** từng SP (hoặc xác nhận phiên).
5. Hệ thống (nội bộ):
   - Sinh `productCode` (`PLSB-xxxxxx-01` … `-05`)
   - Gắn mác **Đã thực kiểm + huy hiệu PREMIUM QUALITY**
   - Niêm yết ngay lên **Phúc Long superBUY™**
   - Không hiện chữ AI Admin trên UI
6. Feed gian hàng: ưu tiên giống feed sự kiện (mới / gắn live pin).

## Sau khi đã xác nhận
- Field **đã nhập** = khóa (`lockedKeys`). User **không sửa** được.
- User **chỉ bổ sung** field còn trống (ví dụ trước chưa có cân nặng → được thêm; đã có giá → không đổi giá).
- Không xóa / không đổi mã SP / không gỡ mác thực kiểm.

## Mua hàng
- Khách xem gian + thêm giỏ: không login.
- Xác nhận đơn: mới bắt login / tạo TK.
