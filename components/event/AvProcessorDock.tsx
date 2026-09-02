"use client";

import { useEffect, useState } from "react";
import {
  PROCESSOR_HINT,
  PROCESSOR_QUICK_STEPS,
  PROCESSOR_SLOTS,
  SLOT_APPS,
  SLOT_LABELS,
  loadSlots,
  saveSlots,
  type AvProcessor,
  type CatalogApp,
  type ProcessorKind,
} from "./av-processors";
import { HandheldMusicSlot } from "./HandheldMusicSlot";

export function AvProcessorDock({
  initial,
  onChange,
}: {
  initial?: AvProcessor[];
  onChange?: (slots: AvProcessor[]) => void;
}) {
  const [slots, setSlots] = useState<AvProcessor[]>(initial?.length ? initial : loadSlots());
  const [sheet, setSheet] = useState<{ slot: 1 | 2 | 3; app: CatalogApp } | null>(null);
  const [alts, setAlts] = useState<CatalogApp[]>([]);
  const [altsNote, setAltsNote] = useState("");

  useEffect(() => {
    if (!initial?.length) setSlots(loadSlots());
  }, [initial?.length]);

  function patch(i: number, p: Partial<AvProcessor>) {
    const next = slots.map((s, idx) => (idx === i ? { ...s, ...p } : s));
    setSlots(next);
    saveSlots(next);
    onChange?.(next);
  }

  function login(s: AvProcessor, i: number) {
    if (s.oauthUrl) {
      window.open(s.oauthUrl, "_blank", "noopener,width=480,height=720");
      patch(i, { status: "need-login" });
      return;
    }
    patch(i, { status: "need-login" });
  }

  return (
    <section
      className="ev-form"
      style={{
        background: "transparent",
        color: "var(--pl-text)",
        border: "2px solid var(--pl-frame)",
        boxShadow: "0 0 0 1px var(--pl-frame-soft)",
        borderRadius: 14,
        padding: 12,
      }}
    >
      <h3 style={{ marginTop: 0 }}>App xử lý ảnh + tiếng</h3>
      {slots.map((s, i) => (
        <fieldset key={s.slot} style={{ marginBottom: 10 }}>
          <legend>
            Khe {s.slot} · {SLOT_LABELS[s.slot]}
          </legend>
          {(s.slot === 1 || s.slot === 2 || s.slot === 3) && (
            <div style={{ marginBottom: 10 }}>
              {SLOT_APPS[s.slot].map((app: CatalogApp) => {
                const on = s.name === app.name;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      patch(i, {
                        name: app.name,
                        oauthUrl: app.loginUrl,
                        status: app.loginUrl ? "need-login" : "connected",
                        useAsVideo: app.useAsVideo,
                        useAsAudio: app.useAsAudio,
                      });
                      setSheet({ slot: s.slot as 1 | 2 | 3, app });
                    }}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderRadius: 12,
                      border: on
                        ? "1px solid var(--pl-text)"
                        : "1px dashed var(--pl-border)",
                      background: "transparent",
                      color: "inherit",
                      cursor: "pointer",
                      width: "48%",
                      marginRight: "2%",
                      marginBottom: 8,
                      verticalAlign: "top",
                    }}
                  >
                    <b style={{ display: "block", fontSize: 14 }}>{app.name}</b>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{app.blurb}</span>
                    <span style={{ display: "block", marginTop: 6, fontSize: 12, fontWeight: 700 }}>
                      {on ? "Đã chọn" : "Chọn"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <label>
            Loại
            <select
              value={s.kind}
              onChange={(e) => patch(i, { kind: e.target.value as ProcessorKind })}
            >
              <option value="image">Hình Ảnh</option>
              <option value="audio">Âm Thanh</option>
              <option value="both">Chỉnh sáng</option>
              <option value="handheld">Micro và Thiết bị cầm tay</option>
            </select>
          </label>
          <label>
            Tên app / dịch vụ
            <input
              value={s.name}
              onChange={(e) =>
                patch(i, { name: e.target.value, status: e.target.value.trim() ? "need-login" : "empty" })
              }
              placeholder="VD: Krisp, OBS Virtual Cam, CapCut"
            />
          </label>
          <label>
            Link đăng nhập (OAuth — boss dán sau)
            <input
              value={s.oauthUrl || ""}
              onChange={(e) => patch(i, { oauthUrl: e.target.value })}
              placeholder="https://…"
            />
          </label>
          <p style={{ fontSize: 12 }}>
            Trạng thái:{" "}
            {s.status === "empty"
              ? "Trống"
              : s.status === "connected"
                ? "Đã đăng nhập"
                : s.status === "error"
                  ? "Lỗi"
                  : "Cần đăng nhập"}
          </p>
          <label>
            <input
              type="checkbox"
              checked={!!s.useAsVideo}
              onChange={(e) => patch(i, { useAsVideo: e.target.checked })}
            />{" "}
            Dùng làm camera ảo
          </label>
          <label>
            <input
              type="checkbox"
              checked={!!s.useAsAudio}
              onChange={(e) => patch(i, { useAsAudio: e.target.checked })}
            />{" "}
            Dùng làm micro ảo
          </label>
          <button type="button" onClick={() => login(s, i)} disabled={!s.name.trim()}>
            Đăng nhập qua Long
          </button>
          {s.status === "need-login" && (
            <button type="button" onClick={() => patch(i, { status: "connected", accountHint: "btc" })}>
              Đã xong đăng nhập
            </button>
          )}
          {s.status === "connected" && s.slot !== 4 && (
            <button
              type="button"
              onClick={() =>
                patch(i, { status: "empty", useAsVideo: false, useAsAudio: false, name: s.slot === 4 ? s.name : s.name })
              }
            >
              Tắt app này trên Long
            </button>
          )}
          {(s.kind === "handheld" || s.slot === 4) && (
            <HandheldMusicSlot onReady={() => patch(i, { status: "connected", useAsAudio: true })} />
          )}
        </fieldset>
      ))}

      {sheet && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 40,
            display: "grid",
            alignItems: "end",
          }}
        >
          <div
            style={{
              background: "var(--pl-surface,#ffffff)",
              color: "var(--pl-text,#1d2951)",
              borderRadius: "16px 16px 0 0",
              padding: 16,
              paddingBottom: 96,
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>{sheet.app.name}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.45 }}>{sheet.app.blurb}</p>
            <p style={{ fontSize: 13, color: "var(--pl-muted)" }}>
              {sheet.app.loginUrl
                ? "Đăng nhập xong đóng tab/app ngoài, rồi bấm Quay lại bàn BTC. Phòng live Long vẫn mở phía dưới."
                : "Không cần mua đèn hay đăng nhập. Bật trên máy rồi quay lại bàn mix."}
            </p>
            {sheet.app.loginUrl ? (
              <button
                type="button"
                className="pl-btn pl-btn-cta"
                onClick={() => window.open(sheet.app.loginUrl, "_blank", "noopener")}
              >
                Mở trang đăng nhập
              </button>
            ) : null}
            <button
              type="button"
              className="pl-btn"
              style={{ marginLeft: 8 }}
              onClick={() => {
                const i = slots.findIndex((x) => x.slot === sheet.slot);
                if (i >= 0)
                  patch(i, {
                    status: "connected",
                    accountHint: "btc",
                    persistEffect: true,
                    lastLoginAt: new Date().toISOString(),
                  });
                setSheet(null);
              }}
            >
              Quay trở lại Long App
            </button>
            <button
              type="button"
              className="pl-btn"
              style={{ marginTop: 10 }}
              onClick={async () => {
                setAltsNote("Đang hỏi DeepSeek app miễn phí…");
                try {
                  const r = await fetch("/api/deepseek/apps", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slot: sheet.slot, failedApp: sheet.app.name }),
                  });
                  const d = await r.json();
                  setAlts(d.apps || []);
                  setAltsNote(d.source === "deepseek" ? "DeepSeek đề xuất:" : "Danh sách miễn phí dự phòng:");
                } catch {
                  setAltsNote("Không gọi được DeepSeek — dùng danh sách sẵn.");
                }
              }}
            >
              Không vào được? Đề xuất app miễn phí
            </button>
            {altsNote ? <p style={{ fontSize: 12, marginTop: 8 }}>{altsNote}</p> : null}
            {alts.map((a) => (
              <button
                key={a.id}
                type="button"
                className="pl-btn"
                style={{ display: "block", width: "100%", marginTop: 6, textAlign: "left" }}
                onClick={() => {
                  const i = slots.findIndex((x) => x.slot === sheet.slot);
                  if (i >= 0)
                    patch(i, {
                      name: a.name,
                      oauthUrl: a.loginUrl,
                      status: a.loginUrl ? "need-login" : "connected",
                      useAsVideo: a.useAsVideo,
                      useAsAudio: a.useAsAudio,
                    });
                  setSheet({ slot: sheet.slot, app: a });
                  if (a.loginUrl) window.open(a.loginUrl, "_blank", "noopener");
                }}
              >
                <b>{a.name}</b> — {a.blurb}
              </button>
            ))}
            <p style={{ fontSize: 12, marginTop: 10, opacity: 0.8 }}>
              Đóng app ngoài: Long vẫn dùng nguồn ảo đã gắn (camera/mic) cho đến khi bạn chọn app khác.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
