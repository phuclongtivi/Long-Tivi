/**
 * Kiến thức dùng chung cho AI Admin chatbot
 * (hướng dẫn app + sản phẩm/dịch vụ)
 */

export const APP_GUIDE = `
Bạn là Trợ lý AI Admin của ứng dụng **Long** (Phúc Long Center) — nền tảng livestream, sự kiện và gian hàng.
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, từng bước rõ ràng.

## Tên app
- App Store / Google Play: **Long**
- Trong app: Phúc Long Center (logo rồng đỏ SINCE 2019)

## Cách dùng cơ bản
1. **Khách**: xem trang chủ, tab video, gian hàng không cần đăng nhập.
2. **Đăng nhập nhanh**: Facebook, TikTok, Google, YouTube, Zalo (hoặc X).
3. **5 lần đăng nhập đầu**: không bắt 2FA. Từ lần 6: CCCD + sinh trắc (mobile) / OTP email.
4. **Trang chủ**: 6 tab (Âm Nhạc, Phim Ảnh, Sản Phẩm mới, Dịch Vụ mới, Thể Thao, Hành Chính Công), tìm kiếm user, LIVE.
5. **Gian hàng (Long store)**: xem SP, **Thêm vào giỏ hàng**, thanh toán COD/CK/ví/thẻ, theo dõi đơn như Shopee.
6. **Giỏ hàng /cart**, **Đơn mua /orders**: hủy đơn, xác nhận đã nhận, tra cứu vận đơn.
7. **Livestream**: Nghệ sĩ / user được cấp quyền tổ chức; điểm danh CCCD; tặng quà; bản đồ người xem.
8. **Hạng**: Thường → Pro (tham dự 10 live) → Nghệ sĩ (tổ chức ≥3 live, trong đó ≥3 buổi ≥1000 view). Boss có thể nâng hạng trực tiếp.
9. **Nghệ sĩ**: tạo sản phẩm trong gian hàng, đăng bình chọn livestream (50 phiếu hoặc Admin duyệt), tổ chức live màn hình chính.
10. **Hoa hồng**: chia sẻ video SP/DV kèm mã refer / QR → tính commission khi có người mua.
11. **Ngôn ngữ**: VI / EN / 中文 (tự theo vùng).
12. **Thông báo**: bật trên Dashboard để nhận nhắc live (5 phút trước + 10 phút sau khi bắt đầu).

## Thanh toán & đơn hàng
- COD, chuyển khoản, ví điện tử, thẻ.
- Theo dõi: Chờ thanh toán → Đang xử lý → Đang giao → Hoàn thành.
- Boss cấu hình URL tra cứu vận chuyển cho Admin AI phản hồi khách.

## Quyền hạn
- Boss: chủ app, nâng hạng, cấp admin, cấu hình hệ thống.
- Admin: chỉnh nội dung hiển thị, duyệt live, cập nhật kho.
- Nghệ sĩ: tạo SP, tổ chức live (sau duyệt/phiếu).
- User thường: xem, mua, tham gia live, chat live.

Nếu không chắc, hướng dẫn user vào Dashboard hoặc liên hệ hotline Phúc Long Center: 0966 717 808 · phuclongtivi@gmail.com.
`.trim();

export const SHARED_SYSTEM_PROMPT = `${APP_GUIDE}

## Nguyên tắc
- Không bịa giá hoặc tồn kho nếu chưa có trong dữ liệu sản phẩm được cung cấp.
- Ưu tiên hướng dẫn thao tác trong app theo nhu cầu user (mua hàng, live, đăng ký, hạng…).
- Khi user đã đăng nhập: xưng hô theo tên họ, nhớ ngữ cảnh hội thoại gần đây.
- Admin AI có thể giám sát; không đưa thông tin nội bộ hệ thống (secret, env).
`;

export function personalizePrompt(userName?: string | null, rank?: string | null) {
  const name = userName?.trim() || 'bạn';
  const rankLabel =
    rank === 'artist' ? 'Nghệ sĩ' : rank === 'pro' ? 'Pro' : 'Thành viên';
  return `${SHARED_SYSTEM_PROMPT}

## Người dùng hiện tại
- Tên: ${name}
- Hạng: ${rankLabel}
Đây là chatbot riêng của ${name}, kiến thức tư vấn giống AI Admin chung.
`;
}

/** Trả lời rule-based khi không có OPENAI_API_KEY */
export function localReply(
  question: string,
  products: { name: string; type: string; bestPrice?: number | null; description?: string | null; latestInfo?: string | null }[]
): string {
  const q = question.toLowerCase();

  // Products
  if (/(sản phẩm|giá|mua|dịch vụ|store|gian hàng|ticket|gói)/i.test(q)) {
    if (products.length === 0) {
      return 'Hiện kho đang cập nhật. Bạn vào **Long store** (menu Gian hàng) để xem sản phẩm/dịch vụ mới nhất, bấm **Thêm vào giỏ hàng** rồi thanh toán như trên Shopee.';
    }
    const lines = products.slice(0, 8).map((p) => {
      const price =
        p.bestPrice != null ? `${p.bestPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ / xem store';
      return `• **${p.name}** (${p.type === 'service' ? 'Dịch vụ' : 'SP'}): ${price}${p.latestInfo ? ` — ${p.latestInfo.slice(0, 80)}` : ''}`;
    });
    return (
      `Một số sản phẩm/dịch vụ đang có trên **Long store**:\n\n${lines.join('\n')}\n\n` +
      `Cách mua: mở Gian hàng → Thêm vào giỏ → Mua hàng → chọn COD/CK/ví/thẻ → theo dõi tại **Đơn mua**.`
    );
  }

  if (/(đăng nhập|login|tài khoản|đăng ký)/i.test(q)) {
    return (
      'Bạn có thể dùng app với tư cách **khách**. Khi cần lưu dữ liệu, đăng nhập nhanh bằng **Facebook / TikTok / Google / YouTube / Zalo**.\n\n' +
      '• 5 lần đầu: không bắt xác thực thêm.\n' +
      '• Từ lần 6: bổ sung CCCD + khuôn mặt/vân tay (điện thoại) hoặc OTP email.\n' +
      'Sau khi hoàn tất, app không hỏi lại phương thức xác thực.'
    );
  }

  if (/(live|livestream|phát sóng|tổ chức)/i.test(q)) {
    return (
      '**Xem live:** vào trang chủ, thẻ LIVE NOW hoặc tab chủ đề.\n' +
      '**Tổ chức live:** cần quyền (Admin cấp) hoặc hạng **Nghệ sĩ**. Nghệ sĩ có thể mở bình chọn (50 phiếu) hoặc nhờ Admin duyệt.\n' +
      'Trong phiên: điểm danh CCCD, tặng quà, chat, bản đồ người xem.'
    );
  }

  if (/(hạng|nghệ sĩ|pro|xếp hạng|nâng cấp)/i.test(q)) {
    return (
      'Hạng: **Thường → Pro → Nghệ sĩ**.\n' +
      '• Pro: tham dự 10 buổi livestream.\n' +
      '• Nghệ sĩ: tổ chức ≥3 buổi và có ≥3 buổi ≥1000 người xem — hoặc **Boss nâng cấp trực tiếp**.\n' +
      'Nghệ sĩ được tạo sản phẩm trong gian hàng và tổ chức live màn hình chính.'
    );
  }

  if (/(giỏ|cart|đơn|order|thanh toán|cod|giao hàng)/i.test(q)) {
    return (
      '**Giỏ hàng (/cart):** chọn SP, chỉnh số lượng → Mua hàng.\n' +
      '**Thanh toán:** COD, chuyển khoản, ví điện tử, thẻ.\n' +
      '**Đơn mua (/orders):** theo dõi Chờ thanh toán / Đang xử lý / Đang giao / Hoàn thành; hủy đơn (khi chưa giao); xác nhận đã nhận; tra cứu vận đơn.'
    );
  }

  if (/(hoa hồng|refer|chia sẻ|qr)/i.test(q)) {
    return (
      'Chia sẻ video Sản phẩm mới / Dịch vụ mới lên Facebook, TikTok, Instagram, YouTube, Zalo. ' +
      'AI Admin gắn **mã refer / QR** của bạn. Khi có người mua qua link/QR, hoa hồng tính theo chính sách từng SP. ' +
      'Không xác định refer → hoa hồng về admin Boss chỉ định theo tháng.'
    );
  }

  return (
    'Tôi là **AI Admin** của app Long (Phúc Long Center). Bạn có thể hỏi về:\n' +
    '• Cách đăng nhập, hạng Pro/Nghệ sĩ\n' +
    '• Xem / tổ chức livestream\n' +
    '• Mua hàng, giỏ hàng, đơn hàng, thanh toán\n' +
    '• Sản phẩm & dịch vụ trên Long store\n' +
    '• Hoa hồng chia sẻ\n\n' +
    'Hãy nói rõ nhu cầu (ví dụ: “cách mua vé”, “làm sao lên Nghệ sĩ”).'
  );
}
