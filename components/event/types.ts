export type EventKind = "live" | "gift" | "ticket";
export type EventStatus = "upcoming" | "live" | "ended";

/** Cách tính vé khi kind = ticket (hoặc sự kiện có cửa) */
export type TicketMode =
  | "fixed" // giá cố định do người tạo ấn định
  | "flexible" // khách chọn 1.000đ → 1.000.000đ
  | "invite"; // Vé mời Nghệ sỹ

export type EventGuest = {
  name: string;
  role: "dien-vien" | "ca-sy" | "mc" | "khach-moi" | "cong-ty" | "khac";
};

export type EventPost = {
  id: string;
  organizerName: string;
  organizerRole: "artist" | "journalist" | "admin" | "boss";
  organizerId: string;
  title: string;
  description: string;
  kind: EventKind;
  status: EventStatus;
  gift?: string;
  /** fixed: số VND; flexible/invite: null */
  ticketMode?: TicketMode;
  ticketPriceVnd?: number | null;
  startsAt: string;
  endsAt?: string;
  venue: string;
  /** Quà tặng là sản phẩm superBUY khi kind gift */
  giftAsProduct?: boolean;
  guests: EventGuest[];
  coverUrl?: string;
  publishedAt: string;
  pinned?: boolean;
  /** Ảnh CCCD bắt buộc khi có vé — công bố cả ảnh, che 5 số giữa */
  organizerIdPhotoUrl?: string;
  organizerIdNumber?: string;
  /** Ảnh xác nhận của nghệ sỹ — không bắt buộc */
  organizerProofUrl?: string;
  /** BTC tick: khách được trừ điểm vào giá vé */
  acceptPointsDiscount?: boolean;
  pointsDiscountVnd?: number;
  /** Có/Không cho thanh toán bằng điểm + sticker (1 điểm = 1.000đ) */
  acceptStickerPay?: boolean;
  preferredCashPay?: "cod" | "bank-transfer" | "card-visa-master" | "zalopay" | "momo";
  /** Tổng điểm sticker tối đa BTC cho phép trừ vào đơn (1 điểm = 1.000đ) */
  maxStickerPoints?: number;
  /** BTC khai — app không trần số phòng / số xem */
  expectedAudience?: number;
  guestSeatCount?: number;
  liveGuestFeePoints?: number;
  liveAudienceFeePoints?: number;
  liveRoomMode?: "broadcast" | "interactive";
  /** Điều kiện tham gia do BTC cài */
  joinAccess?: "open" | "ticket" | "invite";
  insideCount?: number;
  watchingCount?: number;
  paidAudienceCap?: number;
  /** Link gian hàng / giỏ BTC — Mua nhanh góc phải Reels */
  shopQuickUrl?: string;
};

/** Che 5 số giữa CCCD khi công bố. */
export function redactCccdMiddle5(id?: string): string {
  const s = (id ?? "").replace(/\s/g, "");
  if (s.length < 8) return s ? s[0] + "*****" + s.slice(-1) : "—";
  const mid = Math.floor((s.length - 5) / 2);
  return s.slice(0, mid) + "*****" + s.slice(mid + 5);
}

export const PLC_TICKET_DISCLAIMER =
  "Phúc Long Center chỉ cung cấp nền tảng đặt vé. Việc tổ chức, nội dung, thời gian, địa điểm và rủi ro của sự kiện thuộc trách nhiệm người khởi tạo. Trung tâm không chịu trách nhiệm thay cho ban tổ chức.";

export function hasPaidTicket(post: Pick<EventPost, "ticketMode" | "kind">): boolean {
  return post.kind === "ticket" || post.ticketMode === "fixed" || post.ticketMode === "flexible" || post.ticketMode === "invite";
}

export const FLEXIBLE_TICKET_HINT =
  "Ai cũng có thể tham gia, giá vé chỉ từ 1.000đ do khách mời lựa chọn.";

export const FLEXIBLE_MIN = 1_000;
export const FLEXIBLE_MAX = 1_000_000;
