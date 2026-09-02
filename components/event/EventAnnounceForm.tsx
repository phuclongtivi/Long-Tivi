"use client";

import { useMemo, useState } from "react";
import type { EventPost } from "./types";
import {
  GUEST_NAME_MAX,
  PROGRAM_MAX_CHARS,
  guestNameOk,
  guestNameUnits,
  typeToKind,
  type EventTypeTick,
} from "./event-announce";
import { liveRoomPointsDue } from "./live-room-cost";
import { loadImage, renderAnnounceJpg } from "./announce-poster";
import { qrDataUrl, shopReferUrl } from "./event-refer";
import { StickerVoucherBox } from "./StickerVoucherBox";
import { framesForGender, pickFrame } from "./poster-frames";
import type { AiGender } from "./ai-companion";
import {
  MAX_PRODUCTS_PER_ANNOUNCE,
  MAX_PRODUCTS_PER_MONTH,
  PRODUCT_IMG_MAX,
  PRODUCT_IMG_MIN,
  canAddAnnounceProduct,
  fileToDataUrl,
  productIntroErrors,
  type EventProductIntro,
} from "./announce-product";
import "./event-feature.css";

const FONTS = ["Inter", "Times New Roman", "Georgia", "Arial", "Tahoma"];
const GUEST_SLOTS = 4;

export function requiredAnnounceGaps(opts: {
  startsAt: string;
  tick: EventTypeTick | null;
  audience: string;
  topic: string;
  hostLabel: string;
}): string[] {
  const miss: string[] = [];
  if (!opts.topic.trim()) miss.push("Chủ đề");
  if (!opts.hostLabel.trim()) miss.push("Công ty / Nghệ sỹ");
  if (!opts.startsAt.trim()) miss.push("Thời gian Livestream");
  if (!opts.tick) miss.push("Loại sự kiện (tick 1 ô)");
  if (!opts.audience.trim() || Number(opts.audience.replace(/\D/g, "")) < 0 || opts.audience.replace(/\D/g, "") === "") {
    miss.push("Số lượng khán giả (dự kiến)");
  }
  return miss;
}

export function EventAnnounceForm({
  organizerName,
  organizerId,
  organizerRole = "artist",
  gender = "neutral",
  listedThisMonth = 0,
  onComplete,
}: {
  organizerName: string;
  organizerId: string;
  organizerRole?: EventPost["organizerRole"];
  gender?: AiGender;
  listedThisMonth?: number;
  onComplete: (post: Omit<EventPost, "id"> & { posterJpg: string }) => void;
}) {
  const [topic, setTopic] = useState("");
  const [hostLabel, setHostLabel] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [font, setFont] = useState("Inter");
  const [color, setColor] = useState("#111111");
  const [bold, setBold] = useState(false);
  const [guests, setGuests] = useState<string[]>(["", "", "", ""]);
  const [startsAt, setStartsAt] = useState("");
  const [refUrl, setRefUrl] = useState("");
  const [tick, setTick] = useState<EventTypeTick | null>(null);
  const [audience, setAudience] = useState("");
  const [err, setErr] = useState("");
  const [gift, setGift] = useState("");
  const [venueAddr, setVenueAddr] = useState("");
  const [giftAsProduct, setGiftAsProduct] = useState(false);
  const [discountVnd, setDiscountVnd] = useState("");
  const [discountCond, setDiscountCond] = useState("");
  const [referralReward, setReferralReward] = useState("");
  const [voucher, setVoucher] = useState({ apply: false, voucherVnd: 0, maxPoints: 0 });
  const [introOn, setIntroOn] = useState(false);
  const [products, setProducts] = useState<EventProductIntro[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodYear, setProdYear] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodBrand, setProdBrand] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [disc1, setDisc1] = useState("");
  const [disc2, setDisc2] = useState("");
  const [disc3, setDisc3] = useState("");
  const [note1, setNote1] = useState("");
  const [note2, setNote2] = useState("");
  const [prodImgs, setProdImgs] = useState<string[]>([]);
  const [prodWarranty, setProdWarranty] = useState<string[]>([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const framePool = framesForGender(gender);
  const frame = pickFrame(gender, frameIdx);

  const guestN = guests.map((g) => g.trim()).filter(Boolean).length;
  const audN = Math.max(0, Number(audience.replace(/\D/g, "")) || 0);
  const due = useMemo(
    () => liveRoomPointsDue({ guestCount: guestN, audienceCap: audN }),
    [guestN, audN]
  );

  function clearEditor() {
    setEditId(null);
    setProdName("");
    setProdYear("");
    setProdPrice("");
    setProdBrand("");
    setProdDesc("");
    setDisc1("");
    setDisc2("");
    setDisc3("");
    setNote1("");
    setNote2("");
    setProdImgs([]);
    setProdWarranty([]);
  }

  function saveProduct() {
    const draft: EventProductIntro = {
      id: editId && editId !== "new" ? editId : "sp-" + Date.now(),
      name: prodName,
      yearMade: prodYear,
      priceVnd: Number(prodPrice.replace(/\D/g, "")) || 0,
      brand: prodBrand,
      description: prodDesc,
      discount1: disc1.trim() || undefined,
      discount2: disc2.trim() || undefined,
      discount3: disc3.trim() || undefined,
      note1: note1.trim() || undefined,
      note2: note2.trim() || undefined,
      warrantyUrls: prodWarranty.slice(0, 2),
      imageUrls: prodImgs,
    };
    const pe = productIntroErrors(draft);
    if (pe.length) {
      setErr("Điền đủ: " + pe.join(" · ") + ".");
      return;
    }
    const isNew = !products.some((p) => p.id === draft.id);
    if (isNew) {
      const gate = canAddAnnounceProduct({
        alreadyOnForm: products.length,
        listedThisMonth,
      });
      if (!gate.ok) {
        setErr(gate.reason || "");
        return;
      }
    }
    setProducts((list) => {
      const i = list.findIndex((p) => p.id === draft.id);
      if (i >= 0) {
        const n = [...list];
        n[i] = draft;
        return n;
      }
      return [...list, draft];
    });
    setIntroOn(true);
    clearEditor();
    setErr("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const miss = requiredAnnounceGaps({ startsAt, tick, audience, topic, hostLabel });
    if (miss.length) {
      setErr("Cần điền ô bắt buộc (viền đỏ): " + miss.join(" · ") + ".");
      return;
    }
    const bad = guests.find((g) => g.trim() && !guestNameOk(g));
    if (bad) {
      setErr(`Tên khách mời không quá ${GUEST_NAME_MAX} ký tự (không tính dấu).`);
      return;
    }
    if (body.length > PROGRAM_MAX_CHARS) {
      setErr(`Nội dung tối đa ${PROGRAM_MAX_CHARS} ký tự.`);
      return;
    }
    if (introOn && (prodName || prodPrice) && editId) {
      setErr("Bấm Lưu sản phẩm trước khi xác nhận form.");
      return;
    }
    const productIntros = products;
    const productIntro = productIntros[0];
    const mapped = typeToKind(tick!);
    const draft: Omit<EventPost, "id"> = {
      organizerName,
      organizerRole,
      organizerId,
      title: title.trim() || "Sự kiện live",
      description: body.trim(),
      contentFont: font,
      contentColor: color,
      contentBold: bold,
      referenceUrl: refUrl.trim() || undefined,
      kind: mapped.kind,
      ticketMode: mapped.ticketMode,
      joinAccess: mapped.joinAccess,
      status: "upcoming",
      startsAt,
      venue: venueAddr.trim(),
      giftAsProduct: tick === "gift" && giftAsProduct,
      guests: guests
        .map((g) => g.trim())
        .filter(Boolean)
        .map((name) => ({ name, role: "khach-moi" as const })),
      guestSeatCount: guestN,
      expectedAudience: audN,
      paidAudienceCap: audN,
      liveGuestFeePoints: due.guests,
      liveAudienceFeePoints: due.audience,
      publishedAt: new Date().toISOString(),
      posterFrameId: frame.id,
      topic: topic.trim(),
      hostLabel: hostLabel.trim(),
      gift: gift.trim() || undefined,
      introduceProduct: productIntros.length > 0,
      productIntro,
      productIntros,
      discountVnd: Number(discountVnd.replace(/\D/g, "")) || undefined,
      discountCondition: discountCond.trim() || undefined,
      referralReward: referralReward.trim() || undefined,
      acceptStickerPay: voucher.apply,
      acceptPointsDiscount: voucher.apply,
      maxStickerPoints: voucher.apply ? voucher.maxPoints : undefined,
      pointsDiscountVnd: voucher.apply ? voucher.voucherVnd : undefined,
    };
    const refer = shopReferUrl({
      productId: productIntro?.id,
      eventId: "pending",
      referrerId: organizerId,
      discountVnd: draft.discountVnd,
      discountCondition: draft.discountCondition,
      referralReward: draft.referralReward,
    });
    draft.shopReferUrl = refer;
    let qr: HTMLImageElement | null = null;
    try {
      const q = await qrDataUrl(refer, 200);
      qr = await loadImage(q);
    } catch {
      qr = null;
    }
    const posterJpg = renderAnnounceJpg(draft, frame, qr);
    onComplete({ ...draft, posterJpg, posterUrl: posterJpg });
  }

  return (
    <form className="ev-form" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Thông báo tổ chức sự kiện</h2>
      <p style={{ fontSize: 12, opacity: 0.75 }}>
        Bắt buộc: chủ đề, đơn vị/người tổ chức, thời gian, loại sự kiện, số khán giả dự kiến.
      </p>
      <div className="pl-device-panel" style={{ marginBottom: 12 }}>
        <div className="pl-section-head">
          <div>
            <span className="pl-future-kicker">Impact Notice</span>
            <h3>Một thông báo, nhiều điểm chạm</h3>
          </div>
          <span className="pl-status-pill">Preview trước khi đăng</span>
        </div>
        <div className="pl-device-actions">
          <article><strong>Home</strong><span>Đẩy lên tường sự kiện</span></article>
          <article><strong>Thông báo</strong><span>Gửi đúng nhóm quan tâm</span></article>
          <article><strong>Chat room</strong><span>Tạo room theo sự kiện</span></article>
          <article><strong>LIVE / Vào Rạp</strong><span>Gắn CTA tham gia</span></article>
          <article><strong>superBUY™</strong><span>Gắn sản phẩm, quà, ticker</span></article>
        </div>
      </div>
      <fieldset>
        <legend>Khung thông báo ({framePool.length} mẫu theo giới tính: {gender})</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {framePool.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFrameIdx(i)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                border: frame.id === f.id ? "2px solid #fff" : "1px solid #444",
                background: `linear-gradient(135deg,${f.bg},${f.accent})`,
              }}
              title={f.name}
            />
          ))}
        </div>
        <small>{frame.name}</small>
      </fieldset>

      <label className="ev-req">
        <span>Chủ đề *</span>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="VD: Acoustic, hội nghị, ra mắt SP" />
      </label>
      <label className="ev-req">
        <span>Công ty / Nghệ sỹ *</span>
        <input value={hostLabel} onChange={(e) => setHostLabel(e.target.value)} placeholder="Tên công ty hoặc cá nhân tổ chức" />
      </label>
      <div style={{ fontSize: 12, opacity: 0.55, marginTop: -8, marginBottom: 10 }}>
        User: @{organizerName.replace(/^@/, "")}
      </div>

      <label>
        Tiêu đề (không bắt buộc)
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <fieldset>
        <legend>Nội dung chương trình — không bắt buộc, tối đa {PROGRAM_MAX_CHARS} ký tự</legend>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <select value={font} onChange={(e) => setFont(e.target.value)}>
            {FONTS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <label>
            <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} /> Đậm
          </label>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, PROGRAM_MAX_CHARS))}
          rows={6}
          style={{ fontFamily: font, color, fontWeight: bold ? 700 : 400, width: "100%" }}
        />
        <small>
          {body.length}/{PROGRAM_MAX_CHARS}
        </small>
      </fieldset>

      <fieldset id="sticker-guest-fee">
        <legend>Khách mời — 4 ô, mỗi ô 1 tên, tối đa {GUEST_NAME_MAX} ký tự (không tính dấu)</legend>
        {Array.from({ length: GUEST_SLOTS }).map((_, i) => (
          <label key={i}>
            Khách {i + 1} · {guestNameUnits(guests[i] || "")}/{GUEST_NAME_MAX}
            <input
              value={guests[i] || ""}
              onChange={(e) => {
                const next = [...guests];
                next[i] = e.target.value;
                setGuests(next);
              }}
              placeholder="Tên hoặc @user"
            />
          </label>
        ))}
        <p style={{ fontSize: 12 }}>
          <a href="#sticker-guest-fee">Quy tắc phí khách mời (điểm sticker)</a>: {due.guests} điểm
          {due.guests === 0 ? " — miễn phí đến 5 người." : ""}.
        </p>
      </fieldset>

      <label className="ev-req">
        <span>Thời gian Livestream *</span>
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      </label>
      <p style={{ fontSize: 11, opacity: 0.65 }}>Chỉ để hoàn thành form, không dùng cho luồng xử lý khác.</p>

      <label>
        Địa chỉ tổ chức (không bắt buộc)
        <input
          value={venueAddr}
          onChange={(e) => setVenueAddr(e.target.value)}
          placeholder="Số nhà, đường, tỉnh/thành hoặc Online"
        />
      </label>

      <label>
        Tham chiếu (không bắt buộc)
        <input value={refUrl} onChange={(e) => setRefUrl(e.target.value)} placeholder="https://…" />
      </label>

      <fieldset className="ev-req">
        <legend>Loại sự kiện * — tick 1 ô</legend>
        {(
          [
            ["gift", "Xem và nhận quà"],
            ["ticket", "Có vé"],
            ["invite", "Góp vé"],
          ] as const
        ).map(([k, lab]) => (
          <label key={k}>
            <input type="radio" name="etype" checked={tick === k} onChange={() => setTick(k)} /> {lab}
          </label>
        ))}
      </fieldset>

      <label id="sticker-audience-fee" className="ev-req">
        <span>Số lượng khán giả dự kiến *</span>
        <input value={audience} onChange={(e) => setAudience(e.target.value)} inputMode="numeric" />
      </label>
      <p style={{ fontSize: 12 }}>
        <a href="#sticker-audience-fee">Quy tắc phí khán giả (điểm sticker)</a>: {due.audience} điểm
        {audN <= 200 ? " — miễn phí dưới 200." : ""}.
      </p>

      {tick === "gift" && (
        <fieldset>
          <legend>Quà tặng (không bắt buộc)</legend>
          <label>
            Mô tả quà
            <input value={gift} onChange={(e) => setGift(e.target.value)} placeholder="Quà cho người xem…" />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <input
              type="checkbox"
              checked={giftAsProduct}
              onChange={(e) => {
                setGiftAsProduct(e.target.checked);
                if (e.target.checked) setIntroOn(true);
              }}
            />
            Tặng sản phẩm (treo lên superBUY™ làm quà)
          </label>
          {giftAsProduct && (
            <button
              type="button"
              className="pl-btn pl-btn-cta"
              style={{ marginTop: 8 }}
              onClick={() => {
                setIntroOn(true);
                document.getElementById("pl-init-product")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Khởi tạo sản phẩm
            </button>
          )}
        </fieldset>
      )}
      <label>
        Ô ưu đãi / giảm giá — nhập số tiền (không bắt buộc)
        <input value={discountVnd} onChange={(e) => setDiscountVnd(e.target.value)} inputMode="numeric" placeholder="VD: 20000" />
      </label>
      <label>
        Điều kiện áp dụng ưu đãi
        <input value={discountCond} onChange={(e) => setDiscountCond(e.target.value)} placeholder="VD: đơn từ 100.000đ, 1 lần/user" />
      </label>
      <label>
        Thưởng giới thiệu sản phẩm
        <input value={referralReward} onChange={(e) => setReferralReward(e.target.value)} placeholder="VD: +1 sticker cấp 1 khi bạn bè mua" />
      </label>
      <StickerVoucherBox value={voucher} onChange={setVoucher} />

      <fieldset id="pl-init-product">
        <legend>Sản phẩm trong thông báo / quà tặng</legend>
        <p style={{ fontSize: 12, opacity: 0.75 }}>
          Tối đa {MAX_PRODUCTS_PER_ANNOUNCE}/thông báo · {MAX_PRODUCTS_PER_MONTH}/tháng (đã dùng {listedThisMonth}).
        </p>
        {products.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <span>
              {p.name} · {p.brand}
            </span>
            <span>
              <button
                type="button"
                onClick={() => {
                  setEditId(p.id);
                  setIntroOn(true);
                  setProdName(p.name);
                  setProdYear(p.yearMade);
                  setProdPrice(String(p.priceVnd));
                  setProdBrand(p.brand);
                  setProdDesc(p.description);
                  setDisc1(p.discount1 || "");
                  setDisc2(p.discount2 || "");
                  setDisc3(p.discount3 || "");
                  setNote1(p.note1 || "");
                  setNote2(p.note2 || "");
                  setProdImgs(p.imageUrls);
                  setProdWarranty(p.warrantyUrls);
                }}
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => {
                  setProducts((list) => list.filter((x) => x.id !== p.id));
                  if (editId === p.id) clearEditor();
                }}
              >
                Xoá
              </button>
            </span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const gate = canAddAnnounceProduct({
              alreadyOnForm: products.length,
              listedThisMonth,
            });
            if (!gate.ok) {
              setErr(gate.reason || "");
              return;
            }
            clearEditor();
            setEditId("new");
            setIntroOn(true);
          }}
        >
          + Giới thiệu sản phẩm
        </button>
        {introOn && (
          <div>
            <label>
              Tên sản phẩm *
              <input value={prodName} onChange={(e) => setProdName(e.target.value)} />
            </label>
            <label>
              Năm sản xuất *
              <input value={prodYear} onChange={(e) => setProdYear(e.target.value)} />
            </label>
            <label>
              Giá bán *
              <input value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} inputMode="numeric" />
            </label>
            <label>
              Hãng sản xuất *
              <input value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} />
            </label>
            <label>
              Mô tả sản phẩm *
              <textarea value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows={3} />
            </label>
            <label>
              Giảm giá 1
              <input value={disc1} onChange={(e) => setDisc1(e.target.value)} placeholder="VD: -20.000đ đơn từ 100k" />
            </label>
            <label>
              Giảm giá 2
              <input value={disc2} onChange={(e) => setDisc2(e.target.value)} placeholder="VD: tặng 1 sticker cấp 1" />
            </label>
            <label>
              Giảm giá 3
              <input value={disc3} onChange={(e) => setDisc3(e.target.value)} placeholder="VD: freeship nội thành" />
            </label>
            <label>
              Ghi chú 1
              <input value={note1} onChange={(e) => setNote1(e.target.value)} />
            </label>
            <label>
              Ghi chú 2
              <input value={note2} onChange={(e) => setNote2(e.target.value)} />
            </label>
            <label>
              Bảo hành / công bố chất lượng — tối đa 2 ảnh (không bắt buộc)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []).slice(0, 2);
                  try {
                    setProdWarranty(await Promise.all(files.map(fileToDataUrl)));
                  } catch (er) {
                    setErr(er instanceof Error ? er.message : "Ảnh bảo hành lỗi.");
                  }
                }}
              />
            </label>
            <label>
              Ảnh sản phẩm * — {PRODUCT_IMG_MIN}–{PRODUCT_IMG_MAX} ảnh, mỗi file ≤ 3MB
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []).slice(0, PRODUCT_IMG_MAX);
                  try {
                    setProdImgs(await Promise.all(files.map(fileToDataUrl)));
                  } catch (er) {
                    setErr(er instanceof Error ? er.message : "Ảnh sản phẩm lỗi.");
                  }
                }}
              />
            </label>
            <small>
              Đã chọn {prodImgs.length} ảnh SP, {prodWarranty.length} ảnh bảo hành.
            </small>
            <button type="button" onClick={saveProduct}>
              Lưu sản phẩm
            </button>
            <button type="button" onClick={() => { clearEditor(); setIntroOn(false); }}>
              Huỷ
            </button>
          </div>
        )}
      </fieldset>

      {err && <p style={{ color: "#b91c1c", fontWeight: 700 }}>{err}</p>}
      <button type="submit" className="ev-publish">
        Xác nhận hoàn tất thông báo
      </button>
    </form>
  );
}
