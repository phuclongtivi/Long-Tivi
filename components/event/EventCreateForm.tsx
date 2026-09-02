"use client";

import { useState, type CSSProperties } from "react";
import type { AppRole } from "./roles";
import type { EventGuest, EventKind, EventPost, TicketMode } from "./types";
import { FLEXIBLE_TICKET_HINT } from "./types";
import { PaymentMethodPicker, type CashPayId } from "./PaymentMethodPicker";
import { POINT_TO_VND } from "./sticker-pay";
import {
  CAST_FORM_MAX,
  CAST_ROLE_LABEL,
  FREE_GUESTS,
  defaultLiveRoomPlan,
  liveRoomPointsDue,
  type CastMember,
  type CastRole,
} from "./live-room-cost";
import {
  MAX_NEGATIVE_EVENTS_IN_A_ROW,
  applyOrgFee,
  canCreateWhileNegative,
  needLine,
  type OrganizerPointWallet,
} from "./organizer-points";
import { StickerBuyReturn } from "./StickerBuyReturn";
import { PROGRAM_MAX_CHARS, guestNameOk, liveWindowOk } from "./event-announce";
import "./event-feature.css";
import { OrganizerNoticeAttach } from "./OrganizerNoticeAttach";
import type { EventNoticeFields } from "./event-notice";

type Props = {
  role: Extract<AppRole, "artist" | "journalist" | "admin" | "boss">;
  organizerName: string;
  organizerId: string;
  initial?: Partial<EventPost>;
  onPublish: (post: Omit<EventPost, "id" | "publishedAt">) => void;
  wallet?: OrganizerPointWallet;
  onWallet?: (w: OrganizerPointWallet) => void;
};

function mapOldRole(role: EventGuest["role"]): CastRole {
  if (role === "mc") return "mc";
  if (role === "ca-sy" || role === "dien-vien") return "nghe-sy";
  return "khach-moi";
}

export function EventCreateForm({
  role, organizerName, organizerId, initial, onPublish, wallet, onWallet,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [kind, setKind] = useState<EventKind>(initial?.kind ?? "live");
  const [joinAccess, setJoinAccess] = useState<NonNullable<EventPost["joinAccess"]>>(
    initial?.joinAccess ?? (initial?.kind === "ticket" ? "ticket" : "open")
  );
  const [gift, setGift] = useState(initial?.gift ?? "");
  const [shopQuickUrl, setShopQuickUrl] = useState(initial?.shopQuickUrl ?? "/store");
  const [ticketMode, setTicketMode] = useState<TicketMode>(initial?.ticketMode ?? "fixed");
  const [ticketPriceVnd, setTicketPriceVnd] = useState(
    initial?.ticketPriceVnd != null ? String(initial.ticketPriceVnd) : ""
  );
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? "");
  const [endsAt, setEndsAt] = useState(initial?.endsAt ?? "");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [organizerIdPhotoUrl, setOrganizerIdPhotoUrl] = useState(initial?.organizerIdPhotoUrl ?? "");
  const [organizerIdNumber, setOrganizerIdNumber] = useState(initial?.organizerIdNumber ?? "");
  const [organizerProofUrl, setOrganizerProofUrl] = useState(initial?.organizerProofUrl ?? "");
  const [acceptPointsDiscount, setAcceptPointsDiscount] = useState(!!initial?.acceptPointsDiscount);
  const [pointsDiscountVnd, setPointsDiscountVnd] = useState(initial?.pointsDiscountVnd != null ? String(initial.pointsDiscountVnd) : "");
  const [cashMethod, setCashMethod] = useState<CashPayId>(initial?.preferredCashPay ?? "apple-pay");
  const [voucher, setVoucher] = useState({
    apply: !!initial?.acceptStickerPay,
    voucherVnd: initial?.pointsDiscountVnd ?? 0,
    maxPoints: initial?.maxStickerPoints ?? 0,
  });
  const [cast, setCast] = useState<CastMember[]>(
    initial?.guests?.length
      ? initial.guests.slice(0, CAST_FORM_MAX).map((g) => ({
          name: g.name,
          role: mapOldRole(g.role),
        }))
      : [{ name: "", role: "khach-moi" }]
  );
  const [guestSeatCount, setGuestSeatCount] = useState(
    initial?.guestSeatCount != null ? String(initial.guestSeatCount) : ""
  );
  const [expectedAudience, setExpectedAudience] = useState(
    initial?.expectedAudience != null ? String(initial.expectedAudience) : ""
  );
  const [shopOpen, setShopOpen] = useState(false);
  const [feeMsg, setFeeMsg] = useState("");
  const [notice, setNotice] = useState<EventNoticeFields>({
    organizerNotice: initial?.description ?? "",
    organizerNoticeImageUrl: (initial as EventNoticeFields | undefined)?.organizerNoticeImageUrl,
    organizerNoticeImageKind: (initial as EventNoticeFields | undefined)?.organizerNoticeImageKind,
    organizerNoticeImageName: (initial as EventNoticeFields | undefined)?.organizerNoticeImageName,
    organizerNoticeInk: (initial as EventNoticeFields | undefined)?.organizerNoticeInk ?? "navy",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!notice.organizerNoticeImageUrl && description.length > PROGRAM_MAX_CHARS) {
      setFeeMsg(`Nội dung tối đa ${PROGRAM_MAX_CHARS} ký tự.`);
      return;
    }
    if (!notice.organizerNoticeImageUrl && !description.trim() && !notice.organizerNotice?.trim()) {
      setFeeMsg("Gắn ảnh thông báo hoặc nhập nội dung công bố.");
      return;
    }
    const win = liveWindowOk(startsAt);
    if (!win.ok) {
      setFeeMsg(win.reason || "Giờ live không hợp lệ.");
      return;
    }
    if (cast.some((g) => g.name.trim() && !guestNameOk(g.name))) {
      setFeeMsg("Mỗi tên khách mời tối đa 30 ký tự, không tính dấu.");
      return;
    }
    const resolvedKind: EventKind =
      ticketMode === "invite" ? "ticket" : kind;
    let price: number | null = null;
    if (ticketMode === "fixed" && ticketPriceVnd.trim()) {
      price = Number(ticketPriceVnd.replace(/\D/g, "")) || null;
    }
    const guestN = Math.max(0, Number(guestSeatCount.replace(/\D/g, "")) || 0);
    const audN = Math.max(0, Number(expectedAudience.replace(/\D/g, "")) || 0);
    const due = liveRoomPointsDue({ guestCount: guestN, audienceCap: audN });
    const plan = defaultLiveRoomPlan(audN, guestN);
    const startWallet: OrganizerPointWallet = wallet ?? {
      userId: organizerId,
      balance: 0,
      negativeEventStreak: 0,
    };
    const charged = applyOrgFee(startWallet, due.total);
    if (!charged.allowed) {
      setFeeMsg(charged.reason ?? "Không tạo được khi đang âm điểm.");
      return;
    }
    onWallet?.(charged.wallet);
    onPublish({
      organizerName, organizerRole: role, organizerId,
      title: title.trim(),
      description: notice.organizerNoticeImageUrl
        ? ""
        : (notice.organizerNotice || description).trim(),
      organizerNotice: notice.organizerNoticeImageUrl ? "" : (notice.organizerNotice || description).trim(),
      organizerNoticeImageUrl: notice.organizerNoticeImageUrl,
      organizerNoticeImageKind: notice.organizerNoticeImageKind,
      organizerNoticeInk: notice.organizerNoticeInk || "navy",
      organizerNoticeImageName: notice.organizerNoticeImageName,
      kind: resolvedKind, status: "upcoming",
      gift: gift.trim() || undefined,
      shopQuickUrl: shopQuickUrl.trim() || "/store",
      ticketMode, ticketPriceVnd: price,
      joinAccess,
      startsAt, endsAt: endsAt || undefined,
      venue: venue.trim(),
      guests: cast.filter((g) => g.name.trim()).map((g) => ({
        name: g.name,
        role: g.role === "nghe-sy" ? "ca-sy" : g.role === "phong-vien" ? "khac" : g.role === "mc" ? "mc" : "khach-moi",
      })),
      pinned: resolvedKind === "live",
      organizerIdPhotoUrl: organizerIdPhotoUrl.trim(),
      organizerIdNumber: organizerIdNumber.trim() || undefined,
      organizerProofUrl: organizerProofUrl.trim() || undefined,
      acceptPointsDiscount: voucher.apply,
      acceptStickerPay: voucher.apply,
      preferredCashPay: cashMethod,
      maxStickerPoints: voucher.apply ? voucher.maxPoints : undefined,
      pointsDiscountVnd: voucher.apply ? voucher.voucherVnd || voucher.maxPoints * POINT_TO_VND : undefined,
      expectedAudience: audN,
      paidAudienceCap: audN,
      guestSeatCount: guestN,
      liveGuestFeePoints: due.guests,
      liveAudienceFeePoints: due.audience,
      liveRoomMode: plan.mode,
    } as Omit<EventPost, "id" | "publishedAt">);
  }

  const guestN = Math.max(0, Number(guestSeatCount.replace(/\D/g, "")) || 0);
  const audN = Math.max(0, Number(expectedAudience.replace(/\D/g, "")) || 0);
  const due = liveRoomPointsDue({ guestCount: guestN, audienceCap: audN });

  const reqBox: CSSProperties = {
    background: "transparent",
    border: "2px solid var(--pl-frame)",
    boxShadow: "0 0 0 1px var(--pl-frame-soft)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  };

  return (
    <form className="ev-form" onSubmit={submit}>
      <section style={{ ...reqBox, padding: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Thông tin bắt buộc</div>
        <label style={reqBox}>
          Tên sự kiện
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="ev-row">
          <label style={reqBox}>
            Thời gian bắt đầu
            <input type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </label>
        </div>
        <label style={reqBox}>
          Địa điểm tổ chức
          <input required value={venue} onChange={(e) => setVenue(e.target.value)} />
        </label>
      </section>
      <OrganizerNoticeAttach
        value={notice}
        onChange={(v) => {
          setNotice(v);
          if (!v.organizerNoticeImageUrl) setDescription(v.organizerNotice || "");
          else setDescription("");
        }}
      />
      <label>Loại sự kiện (feed)
        <select value={kind} onChange={(e) => setKind(e.target.value as EventKind)}>
          <option value="live">Live</option>
          <option value="gift">Xem và nhận quà</option>
          <option value="ticket">Góp vé mời Nghệ sỹ</option>
        </select>
      </label>
      <label>Điều kiện tham gia
        <select value={joinAccess} onChange={(e) => setJoinAccess(e.target.value as NonNullable<EventPost["joinAccess"]>)}>
          <option value="open">Vào tự do — Xem nhanh</option>
          <option value="ticket">Cần mua vé — Mua vé nhanh</option>
          <option value="invite">Vé mời nghệ sỹ — Góp vé mời</option>
        </select>
      </label>
      <label>Người tổ chức<input value={organizerName} readOnly /></label>
      <label>Quà tặng là gì<input value={gift} onChange={(e) => setGift(e.target.value)} /></label>
      <label>Link mua nhanh (góc phải Reels)
        <input
          value={shopQuickUrl}
          onChange={(e) => setShopQuickUrl(e.target.value)}
          placeholder="/store hoặc https://…"
        />
      </label>

      <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
        <legend style={{ fontWeight: 700, fontSize: 13 }}>Giá vé vào cửa</legend>
        <label>Phương thức
          <select value={ticketMode} onChange={(e) => setTicketMode(e.target.value as TicketMode)}>
            <option value="fixed">Giá vé cố định</option>
            <option value="flexible">Giá vé từ 1.000đ (khách chọn)</option>
            <option value="invite">Vé mời Nghệ sỹ</option>
          </select>
        </label>
        {ticketMode === "fixed" && (
          <label style={reqBox}>
            Số tiền (VND)
            <input inputMode="numeric" required value={ticketPriceVnd}
              onChange={(e) => setTicketPriceVnd(e.target.value)} placeholder="VD: 100000" />
          </label>
        )}
        {ticketMode === "flexible" && (
          <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)", margin: "6px 0 0", lineHeight: 1.4 }}>{FLEXIBLE_TICKET_HINT}</p>
        )}
        {ticketMode === "invite" && (
          <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)", margin: "6px 0 0" }}>Phân loại tin Vé mời Nghệ sỹ trên feed.</p>
        )}
      </fieldset>

      <div className="ev-row">
        <label>Thời gian kết thúc<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></label>
      </div>

      <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
        <legend style={{ fontWeight: 700, fontSize: 13 }}>Bằng chứng công bố (sự kiện có vé)</legend>
        <label style={reqBox}>
          Ảnh CCCD người khởi tạo (bắt buộc — công bố cả ảnh, che 5 số giữa)
          <input required value={organizerIdPhotoUrl} onChange={(e) => setOrganizerIdPhotoUrl(e.target.value)} placeholder="URL ảnh CCCD" />
        </label>
        <label>Số CCCD (để che 5 số giữa trên ảnh công bố)
          <input value={organizerIdNumber} onChange={(e) => setOrganizerIdNumber(e.target.value)} placeholder="12 số — 5 số giữa sẽ hiện *****" />
        </label>
        <label>Ảnh xác nhận của nghệ sỹ (không bắt buộc)
          <input value={organizerProofUrl} onChange={(e) => setOrganizerProofUrl(e.target.value)} placeholder="URL ảnh chụp xác nhận chương trình sẽ diễn ra" />
        </label>
        <p style={{ fontSize: 12, color: "#666", margin: "6px 0 0" }}>
          2 ô này hiện dưới nội dung công bố trên phiếu mua vé, dạng ảnh tham chiếu.
        </p>
      </fieldset>

      <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
        <legend style={{ fontWeight: 700, fontSize: 13 }}>Ekip livestream (tối đa {CAST_FORM_MAX} dòng)</legend>
        <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)", marginTop: 0 }}>
          Nghệ sỹ, MC, phóng viên, khách mời — tối đa {CAST_FORM_MAX} dòng. Khách mời ≤ {FREE_GUESTS} người không mất điểm.
        </p>
        {cast.map((g, i) => (
          <div className="ev-row" key={i} style={{ marginBottom: 8 }}>
            <input placeholder="Tên" value={g.name} onChange={(e) => {
              const next = [...cast]; next[i] = { ...next[i], name: e.target.value }; setCast(next);
            }} />
            <select value={g.role} onChange={(e) => {
              const next = [...cast]; next[i] = { ...next[i], role: e.target.value as CastRole }; setCast(next);
            }}>
              {(Object.keys(CAST_ROLE_LABEL) as CastRole[]).map((r) => (
                <option key={r} value={r}>{CAST_ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
        ))}
        <button
          type="button"
          className="ev-publish"
          style={{ background: "#eee", color: "#111", height: 36 }}
          disabled={cast.length >= CAST_FORM_MAX}
          onClick={() => setCast((g) => g.length >= CAST_FORM_MAX ? g : [...g, { name: "", role: "khach-moi" }])}
        >
          + Thêm (tối đa {CAST_FORM_MAX})
        </button>
        <label style={{ marginTop: 10 }}>
          Số khách mời
          <input inputMode="numeric" value={guestSeatCount} onChange={(e) => setGuestSeatCount(e.target.value)} placeholder="Nhập số" />
        </label>
        {guestSeatCount.trim() !== "" && (
          <p style={{ fontSize: 13, fontWeight: 700 }}>{needLine(due.guests)}</p>
        )}
      </fieldset>

      <fieldset style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 12 }}>
        <legend style={{ fontWeight: 700, fontSize: 13 }}>Số khán giả dự kiến</legend>
        <label>
          Số lượng khán giả
          <input inputMode="numeric" value={expectedAudience} onChange={(e) => setExpectedAudience(e.target.value)} placeholder="Nhập số" />
        </label>
        {expectedAudience.trim() !== "" && (
          <p style={{ fontSize: 13, fontWeight: 700 }}>{needLine(due.audience)}</p>
        )}
        {guestSeatCount.trim() !== "" && expectedAudience.trim() !== "" && (
          <p style={{ fontSize: 13 }}>{needLine(due.total)} (tổng khách mời + khán giả)</p>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button type="button" className="ev-publish" style={{ height: 40 }}
            onClick={() => {
              const start: OrganizerPointWallet = wallet ?? { userId: organizerId, balance: 0, negativeEventStreak: 0 };
              const r = applyOrgFee(start, due.total);
              if (!r.allowed) { setFeeMsg(r.reason ?? ""); return; }
              onWallet?.(r.wallet);
              setFeeMsg(`Đã trừ ${due.total} điểm. Số dư: ${r.wallet.balance} (được âm).`);
            }}
          >
            Trừ điểm + sticker
          </button>
          <button type="button" className="ev-publish" style={{ height: 40, background: "#8B4513" }}
            onClick={() => setShopOpen(true)}
          >
            Mua điểm sticker
          </button>
        </div>
        {wallet && (
          <p style={{ fontSize: 12, color: wallet.balance < 0 ? "#8B0000" : "#555" }}>
            Số dư kho: {wallet.balance} điểm
            {wallet.balance < 0 ? ` · đang âm · sự kiện âm liên tiếp ${wallet.negativeEventStreak}/${MAX_NEGATIVE_EVENTS_IN_A_ROW}` : ""}
            {!canCreateWhileNegative(wallet) ? " · hết lượt tạo khi âm — cần mua sticker." : ""}
          </p>
        )}
        {feeMsg && <p style={{ fontSize: 12, color: "#8B0000" }}>{feeMsg}</p>}
      </fieldset>

      {shopOpen && (
        <StickerBuyReturn
          username={organizerName}
          returnToCreate={() => setShopOpen(false)}
        />
      )}

      <PaymentMethodPicker
        cashMethod={cashMethod}
        onCashMethod={setCashMethod}
        voucher={voucher}
        onVoucher={setVoucher}
      />
      <button className="ev-publish" type="submit">Đăng</button>
    </form>
  );
}
