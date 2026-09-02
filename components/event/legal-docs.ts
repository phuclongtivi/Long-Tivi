export type LegalLang = "vi" | "en" | "zh";
export type LegalKind = "guide" | "terms";

export function detectLegalLang(): LegalLang {
  if (typeof window === "undefined") return "vi";
  const saved = localStorage.getItem("phuc-long-locale") || localStorage.getItem("pl-lang") || "";
  const nav = (navigator.language || "vi").toLowerCase();
  const raw = (saved || nav).slice(0, 2);
  if (raw === "zh" || raw === "cn") return "zh";
  if (raw === "en") return "en";
  return "vi";
}

export function pdfHref(kind: LegalKind, lang: LegalLang): string {
  return `/legal/${kind}-${lang}.pdf`;
}

export const GUIDE_TEXT: Record<LegalLang, { title: string; sections: { h: string; b: string }[] }> = {
  vi: {
    title: "Hướng dẫn sử dụng",
    sections: [
      { h: "App này làm gì", b: "Livestream, vé / nhận quà, superBUY™, trợ lý AI. 5 tab: Home, superBUY™, LIVE, Thông báo, Menu. Phong cách trẻ, gọn, tinh tế và sci-fi nhẹ." },
      { h: "Home", b: "Tường cuộn như Facebook. 6 nút: Tạo Live, Hot Live (quà/không vé), Khách mời (có vé/góp vé), Người nổi tiếng (nghệ sỹ, nhiều follow), Camera (bàn BTC), Vào Rạp. Like + chia sẻ FB/IG/Zalo/Messenger. Vào phòng nhanh khi đang live." },
      { h: "Tài khoản", b: "Email + mật khẩu, SĐT, hoặc đăng nhập nhanh. CCCD mở AI + kho quà. Đổi tên hiển thị / ảnh / trợ lý AI ở Menu → Dashboard." },
      { h: "LIVE", b: "Livestream = tạo thông báo + bàn BTC. Vào Rạp = reel. Ví Quà = giỏ + sticker. 4 khe app ngoài (hình/tiếng/đèn + USB/iPod). Mixer phòng. Kết thúc live mới đóng app ngoài, nhớ đăng nhập." },
      { h: "Trợ lý AI", b: "User thường: 0,5 điểm/câu chữ, 1 điểm/câu nói; âm điểm tối đa 10 câu. Boss: AI không giới hạn điểm, được làm việc thay boss (sự kiện, kho sticker, đơn, trần khán giả). Gọi: tên AI + ơi." },
      { h: "Thông báo", b: "Khoang trên: mới nhất. Khoang dưới: người đang follow (tham gia, mua, tặng quà, follow)." },
      { h: "Quà và điểm", b: "1 điểm = 1.000 đ. Mở khoá CCCD / phóng viên / nghệ sỹ. Boss có kho 1.000.000 mỗi loại." },
      { h: "superBUY™", b: "Xem không cần login. Thanh toán: Apple Pay, QR ngân hàng, thẻ, MoMo/ZaloPay, COD, điểm sticker. Cùng màu navy như Home." },
      { h: "An toàn", b: "Không nội dung cấm. phuclongtivi@gmail.com" },
    ],
  },
  en: {
    title: "User guide",
    sections: [
      { h: "What the app does", b: "Live, tickets/gifts, superBUY™, AI. Five tabs: Home, superBUY™, LIVE, Notifications, Menu. Youthful, clean, refined soft sci-fi style." },
      { h: "Home", b: "Facebook-style wall. Six shortcuts: Create Live, Hot Live, Guests, Famous, Camera, Cinema. Like + share. Join when live." },
      { h: "Account", b: "Email, phone or quick login. ID unlocks AI + vault. Edit profile/AI in Menu." },
      { h: "LIVE", b: "Create + host desk. Cinema reels. Gift wallet. Four AV slots + USB music. External apps stay until End live." },
      { h: "AI", b: "Users: 0.5 pt text, 1 pt voice. Boss AI: unlimited and may act with boss powers." },
      { h: "Alerts", b: "Latest on top. Followed users below." },
      { h: "Gifts", b: "1 pt = VND 1,000. Unlock by ID / journalist / artist." },
      { h: "Shop", b: "Browse logged-out. Apple Pay, bank QR, card, e-wallets, COD, points." },
      { h: "Safety", b: "No illegal content. phuclongtivi@gmail.com" },
    ],
  },
  zh: {
    title: "使用指南",
    sections: [
      { h: "应用简介", b: "直播、门票/送礼、superBUY™、AI。五个标签：首页、superBUY™、LIVE、通知、菜单。年轻、简洁、精致的轻科幻风格。" },
      { h: "首页", b: "信息流墙。六个快捷：开播、热门、嘉宾、名人、相机、进影院。" },
      { h: "账户", b: "邮箱/手机/快捷登录。证件解锁 AI。菜单可改资料与 AI。" },
      { h: "LIVE", b: "创建+导播台。影院 Reels。礼包钱包。四个外接槽+USB 音乐。" },
      { h: "AI", b: "普通用户按积分计费。Boss 的 AI 不限次数，可代行 Boss 权限。" },
      { h: "通知", b: "上方最新，下方关注对象动态。" },
      { h: "礼物", b: "1 分=1,000 盾。" },
      { h: "商店", b: "免登录浏览。多种支付。" },
      { h: "安全", b: "禁止违法内容。phuclongtivi@gmail.com" },
    ],
  },
};

export const TERMS_TEXT: Record<LegalLang, { title: string; sections: { h: string; b: string }[] }> = {
  vi: {
    title: "Điều khoản dịch vụ",
    sections: [
      { h: "Chấp nhận", b: "Tick đã đọc và Đồng ý mới được dùng app. Không đồng ý thì dừng sử dụng." },
      { h: "Tuổi và tài khoản", b: "Đủ tuổi luật định (VN: 16+ tự mở). CCCD để xác thực, không bán cho quảng cáo." },
      { h: "Nội dung của bạn", b: "Bạn giữ quyền, cấp phép không độc quyền cho Phúc Long hiển thị. Cấm nội dung trái pháp luật." },
      { h: "Livestream", b: "BTC chịu trách nhiệm buổi live. App có quyền cắt sóng / khóa tài khoản." },
      { h: "Thanh toán và điểm", b: "Điểm là vật phẩm app, không phải tiền mặt. 1 điểm = 1.000 đ khi được phép trừ." },
      { h: "Dữ liệu", b: "Theo NĐ 13/2023 và phuclongtivi.com. Yêu cầu xem/sửa/xóa qua email." },
      { h: "Chấm dứt", b: "Bạn xóa tài khoản được. Vi phạm nghiêm trọng thì bị khóa." },
      { h: "Trách nhiệm", b: "Dịch vụ nguyên trạng. Tranh chấp ưu tiên thương lượng; user VN: tòa có thẩm quyền tại Hưng Yên." },
    ],
  },
  en: {
    title: "Terms of Service",
    sections: [
      { h: "Acceptance", b: "You must tick “I have read and agree”. If not, stop using the app." },
      { h: "Age", b: "Meet local minimum age (16+ in Vietnam). ID is for verification, not ad sales." },
      { h: "Your content", b: "You keep rights and grant a non-exclusive host licence. No illegal content." },
      { h: "Live", b: "Hosts own their streams. We may cut or suspend." },
      { h: "Payments", b: "Points are in-app items, not cash. 1 pt = VND 1,000 when discounts apply." },
      { h: "Privacy", b: "See www.phuclongtivi.com. Email us to access, correct or delete data." },
      { h: "Termination", b: "You may delete the account. Serious breach may lead to suspension." },
      { h: "Liability", b: "Service as-is. Vietnam users: courts in Hung Yen unless mandatory law says otherwise." },
    ],
  },
  zh: {
    title: "服务条款",
    sections: [
      { h: "接受", b: "须勾选“我已阅读并同意”。不同意请停止使用。" },
      { h: "年龄", b: "须达当地最低年龄（越南单独开户一般为 16 岁）。证件用于核验，不出售广告。" },
      { h: "内容", b: "你保留权利并授予平台非独占展示许可。禁止违法内容。" },
      { h: "直播", b: "主办方对内容负责。平台可中断或封禁。" },
      { h: "支付", b: "积分为站内物品。1 分=1,000 盾（允许抵扣时）。" },
      { h: "隐私", b: "见 phuclongtivi.com。可通过邮件申请查阅或删除。" },
      { h: "终止", b: "可注销账户。严重违规将被暂停。" },
      { h: "责任", b: "按现状提供。越南用户争议可由兴安有管辖权法院处理。" },
    ],
  },
};

export const TERMS_CHECK: Record<LegalLang, { box: string; btn: string; must: string }> = {
  vi: {
    box: "Tôi đã đọc và đồng ý Điều khoản dịch vụ, Cam kết dùng app đúng pháp luật nơi tôi đang ở.",
    btn: "Đồng ý và tiếp tục",
    must: "Cần tick ô cam kết trước khi tiếp tục.",
  },
  en: {
    box: "I have read and agree to the Terms of Service and I will follow the laws of the country where I use this app.",
    btn: "Agree and continue",
    must: "Tick the box before continuing.",
  },
  zh: {
    box: "我已阅读并同意服务条款，承诺遵守使用地法律。",
    btn: "同意并继续",
    must: "请先勾选承诺后再继续。",
  },
};

export const BTN_LABEL: Record<LegalLang, { guide: string; terms: string; search: string }> = {
  vi: { guide: "Hướng dẫn", terms: "Điều khoản", search: "Tìm trong tài liệu…" },
  en: { guide: "Guide", terms: "Terms", search: "Search this document…" },
  zh: { guide: "指南", terms: "条款", search: "在文档中搜索…" },
};
