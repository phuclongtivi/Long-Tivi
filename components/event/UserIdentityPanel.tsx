"use client";

import { useState } from "react";
import type { AiCompanion, AiGender, AiIdleShape } from "./ai-companion";
import { DEFAULT_COMPANION, GENDER_LABEL, IDLE_SHAPE_LABEL } from "./ai-companion";
import { NOTEPAD_FONT, notepadIdLine } from "./user-identity";
import { AiIdlePresence } from "./AiIdlePresence";

type Props = {
  displayName: string;
  legalFullName: string;
  idNumber: string;
  avatarUrl?: string;
  companion?: AiCompanion;
  onSave: (payload: {
    displayName: string;
    avatarUrl: string;
    companion: AiCompanion;
  }) => void;
};

export function UserIdentityPanel({
  displayName,
  legalFullName,
  idNumber,
  avatarUrl = "",
  companion = DEFAULT_COMPANION,
  onSave,
}: Props) {
  const [name, setName] = useState(displayName);
  const [photo, setPhoto] = useState(avatarUrl);
  const [ai, setAi] = useState<AiCompanion>(companion);

  return (
    <section
      style={{
        background: "var(--pl-surface,#24315C)",
        color: "var(--pl-text,#F4F7FB)",
        borderRadius: 16,
        padding: 16,
        border: "1px solid var(--pl-border,#2e3d6b)",
      }}
    >
      <h3 style={{ margin: "0 0 10px" }}>Hồ sơ hiển thị</h3>
      <label>
        Tên hiển thị
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div
        style={{
          marginTop: 6,
          color: "rgba(0,0,0,.42)",
          fontFamily: NOTEPAD_FONT,
          fontSize: 13,
          letterSpacing: 0.2,
        }}
      >
        {notepadIdLine(legalFullName, idNumber)}
      </div>

      <label style={{ display: "block", marginTop: 12 }}>
        Ảnh profile (URL)
        <input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://..." />
      </label>
      {photo && (
        <img
          src={photo}
          alt=""
          style={{
            width: 72,
            height: 72,
            objectFit: "cover",
            borderRadius: 10,
            marginTop: 8,
            boxShadow: "2px 3px 0 rgba(80,30,20,.25)",
          }}
        />
      )}

      <h3 style={{ margin: "18px 0 8px" }}>Trợ lý AI của bạn</h3>
      <label>
        Tên trợ lý
        <input
          value={ai.name}
          onChange={(e) => setAi({ ...ai, name: e.target.value })}
        />
      </label>
      <label style={{ display: "block", marginTop: 8 }}>
        Giới tính trợ lý (giọng + cách nói)
        <select
          value={ai.gender ?? "neutral"}
          onChange={(e) => setAi({ ...ai, gender: e.target.value as AiGender })}
        >
          {(Object.keys(GENDER_LABEL) as AiGender[]).map((g) => (
            <option key={g} value={g}>{GENDER_LABEL[g]}</option>
          ))}
        </select>
      </label>
      {ai.code && (
        <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)", fontFamily: "Consolas, 'Courier New', monospace" }}>
          Mã {ai.code} · Ngày sinh {ai.birthDate || "—"} (ngày hoàn tất CCCD)
        </p>
      )}
      <label style={{ display: "block", marginTop: 8 }}>
        Ảnh / hình dáng trợ lý (URL)
        <input
          value={ai.avatarUrl}
          onChange={(e) => setAi({ ...ai, avatarUrl: e.target.value })}
        />
      </label>
      <label style={{ display: "block", marginTop: 8 }}>
        Dáng khi không nhận lệnh (live + app)
        <select
          value={ai.idleShape}
          onChange={(e) => setAi({ ...ai, idleShape: e.target.value as AiIdleShape })}
        >
          {(Object.keys(IDLE_SHAPE_LABEL) as AiIdleShape[]).map((k) => (
            <option key={k} value={k}>{IDLE_SHAPE_LABEL[k]}</option>
          ))}
        </select>
      </label>
      <p style={{ fontSize: 12, color: "#666" }}>
        Khi đang chat / nhận lệnh ký tự: hiện khung hội thoại. Khi không nhận lệnh: hiện dáng đã chọn.
      </p>
      <div style={{ position: "relative", height: 88, margin: "8px 0 12px", background: "#111", borderRadius: 12 }}>
        <AiIdlePresence companion={{ ...ai, commandMode: false }} />
      </div>
      <button
        type="button"
        className="ev-publish"
        onClick={() => onSave({ displayName: name.trim(), avatarUrl: photo.trim(), companion: ai })}
      >
        Lưu hồ sơ
      </button>
    </section>
  );
}
