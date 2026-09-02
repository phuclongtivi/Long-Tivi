"use client";

import { useRef, useState } from "react";
import {
  NOTICE_ACCEPT,
  NOTICE_MAX_BYTES,
  noticeColors,
  readNoticeFile,
  type EventNoticeFields,
  type NoticeInk,
} from "./event-notice";

type Props = {
  value: EventNoticeFields;
  onChange: (v: EventNoticeFields) => void;
};

export function OrganizerNoticeAttach({ value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  const ink: NoticeInk = value.organizerNoticeInk === "white" ? "white" : "navy";
  const paint = noticeColors(ink);
  const hasImg = Boolean(value.organizerNoticeImageUrl);
  const hasText = Boolean((value.organizerNotice || "").trim());
  const summary = hasImg
    ? (value.organizerNoticeImageName || "Đã gắn ảnh") +
      (value.organizerNoticeImageKind === "animated" ? " · động" : " · tĩnh")
    : hasText
      ? "Đã nhập nội dung"
      : "Chưa soạn";

  function setInk(next: NoticeInk) {
    onChange({ ...value, organizerNoticeInk: next });
  }

  return (
    <div style={{ background: "transparent", padding: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          height: 40,
          border: "none",
          background: "transparent",
          color: "var(--pl-text)",
          fontWeight: 800,
          fontSize: 14,
          textAlign: "left",
          padding: 0,
        }}
      >
        {open ? "▾ " : "▸ "}Thông báo tổ chức
        <span style={{ fontWeight: 600, fontSize: 12, opacity: 0.7, marginLeft: 8 }}>{summary}</span>
      </button>

      {open ? (
        <div style={{ marginTop: 8, background: "transparent" }}>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            style={{
              height: 36,
              padding: "0 12px",
              border: "none",
              background: "transparent",
              color: "var(--pl-text)",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            Gắn ảnh thông báo
          </button>
          <input
            ref={ref}
            type="file"
            accept={NOTICE_ACCEPT}
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setErr("");
              try {
                const next = await readNoticeFile(f);
                onChange({ ...value, ...next });
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "Không gắn được ảnh.");
              }
            }}
          />
          {err ? <p style={{ color: "#E11D48", fontSize: 12 }}>{err}</p> : null}

          {hasImg ? (
            <div style={{ marginTop: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.organizerNoticeImageUrl}
                alt=""
                style={{ width: "100%", maxHeight: 180, objectFit: "contain", background: "transparent" }}
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    organizerNoticeImageUrl: "",
                    organizerNoticeImageKind: undefined,
                    organizerNoticeImageName: "",
                  })
                }
                style={{
                  marginTop: 6,
                  height: 32,
                  border: "none",
                  background: "transparent",
                  color: "var(--pl-text)",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Gỡ ảnh
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Màu chữ</div>
              <button
                type="button"
                onClick={() => setInk("navy")}
                style={{
                  height: 32,
                  padding: "0 12px",
                  marginRight: 8,
                  border: ink === "navy" ? "2px solid #1D2951" : "none",
                  background: "transparent",
                  color: "#1D2951",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                Navy
              </button>
              <button
                type="button"
                onClick={() => setInk("white")}
                style={{
                  height: 32,
                  padding: "0 12px",
                  border: ink === "white" ? "2px solid var(--pl-frame)" : "none",
                  background: "#1D2951",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                Trắng
              </button>
              <label style={{ display: "block", marginTop: 10, fontSize: 13 }}>
                Tự nhập nội dung
                <textarea
                  value={value.organizerNotice || ""}
                  onChange={(e) => onChange({ ...value, organizerNotice: e.target.value })}
                  rows={5}
                  placeholder="Viết thông báo nếu không gắn ảnh…"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    color: paint.color,
                    background: paint.background,
                    border: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: 15,
                    lineHeight: 1.45,
                    padding: 10,
                  }}
                />
              </label>
              {null}
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 8,
              height: 32,
              border: "none",
              background: "transparent",
              color: "var(--pl-muted)",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            Thu gọn
          </button>
        </div>
      ) : null}
    </div>
  );
}
