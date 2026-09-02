"use client";

export function LiveGiftGuide() {
  return (
    <section className="ev-form">
      <h3 style={{ margin: 0 }}>Hướng dẫn livestream — quà & điểm</h3>
      <ol style={{ fontSize: 13, lineHeight: 1.55, paddingLeft: 18 }}>
        <li>Trong live: nút <b>Tặng quà</b> trên từng người (BTC, người biểu diễn phiên, khách).</li>
        <li><b>Sticker:</b> trừ điểm người tặng (nếu dùng điểm), cộng điểm + vào kho người nhận, hiện trên màn live.</li>
        <li><b>Tiền mặt:</b> mở app ngân hàng theo STK hồ sơ người nhận → chỉ xác nhận đã/chưa xong. Xong mới thả sticker tiền trên live.</li>
        <li>Ngoài live: nút <b>Dùng điểm &amp; chuyển quà</b> (mua hàng / trừ vé / tặng nhau).</li>
        <li>Tab live có vé: feed ghi “Có thể trừ điểm vào vé” nếu BTC tick. Màn đặt vé trừ điểm như voucher.</li>
        <li>Kho quà: CCCD → cấp 1 (3 sticker, 1đ) · Phóng viên → cấp 2 (3 sticker, 2đ) · Nghệ sỹ → cấp 3 (5 sticker, 5đ).</li>
        <li>Sticker tặng nhau hiện góc dưới / hai bên live, diện tích vừa, <b>không che mặt</b> người biểu diễn.</li>
        <li>Chạm đồ trong khung live: Phúc cắt ô quanh điểm chạm, nhận món và trả lời (nút chat góc phải).</li>
        <li><b>Khách mời / khán giả:</b> BTC chỉ nhập số. Hệ thống hiện «Bạn cần có … điểm sticker». Nút Trừ điểm + sticker. Nút Mua điểm sticker → gian hàng superBUY™. Bill: @Username + số lượng + loại 1/2/3. Hoàn tất quay lại form tạo sự kiện.</li>
        <li>Điểm kho = hiện tại − phí tổ chức, được âm. Sticker Boss/Admin gửi sau sẽ trừ nợ trước. Đang âm chỉ tạo tối đa 2 sự kiện liên tiếp.</li>
        <li><b>Quyền khách mời:</b> ghế đầu; 720p khi lên sóng; AI Phúc bán hàng; tặng/nhận quà; tên overlay không che mặt.</li>
        <li>Phòng tiết kiệm phí: host 720p, khán giả xem HLS 480p, overlay vẽ trên máy xem, không ghi hình mặc định, Phúc chỉ khi chạm.</li>
        <li>Hết hạn mức trợ lý AI: hiện chat hướng dẫn mua sticker + điểm trên superBUY™. Không còn gói chatbot theo ngày. Bảng trừ điểm chờ quy tắc chi tiêu.</li>
      </ol>
    </section>
  );
}
