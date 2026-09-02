"use client";

import { useMemo, useState } from "react";
import { sessionAccount } from "./account-links";
import {
  TITLE_COLORS,
  formatProfileUsername,
  saveUserChatRoom,
  type TitleColorId,
  type UserChatRoom,
} from "./chat-rooms";

export function CreateGroupChatForm({
  defaultLive,
  onCreated,
  onClose,
}: {
  defaultLive: boolean;
  onCreated: (row: UserChatRoom) => void;
  onClose: () => void;
}) {
  const acc = sessionAccount();
  const label = useMemo(
    () => formatProfileUsername({ username: acc?.displayName, cccd: acc?.cccd }),
    [acc]
  );
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [color, setColor] = useState<TitleColorId>("navy");
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    const name = title.trim();
    if (!name) {
      setErr("Nhập tên phòng Livestream.");
      return;
    }
    if (!when) {
      setErr("Chọn thời gian Livestream.");
      return;
    }
    const row: UserChatRoom = {
      id: "g-" + Date.now(),
      title: name,
      startsAt: new Date(when).toISOString(),
      creatorLabel: label,
      creatorId: acc?.id || "guest",
      isLive: defaultLive,
      createdAt: new Date().toISOString(),
      titleColor: color,
      btcIds: acc?.id ? [acc.id] : [],
      guestIds: [],
      insideCount: 0,
      watchingCount: 0,
      creatorRank: "user",
    };
    saveUserChatRoom(row);
    onCreated(row);
  }

  return (
    <div className="pl-auth-panel pl-group-form" role="dialog" aria-modal="true">
      <button type="button" className="pl-group-x" onClick={onClose} aria-label="Đóng">
        ×
      </button>
      <h3>Tạo Group Chat</h3>
      <p className="pl-group-hint">{defaultLive ? "Khoang phòng đang live" : "Khoang phòng đợi"}</p>
      <label>
        Tên phòng Livestream *
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Đêm nhạc · Talkshow…" />
      </label>
      <div className="pl-color-row">
        <span>Màu tiêu đề</span>
        <div className="pl-color-dots">
          {TITLE_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={color === c.id ? "pl-color-dot on" : "pl-color-dot"}
              style={{ background: c.hex }}
              aria-label={c.label}
              onClick={() => setColor(c.id)}
            />
          ))}
        </div>
      </div>
      <label>
        Thời gian Livestream *
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      </label>
      <div className="pl-group-creator">
        <span>Người khởi tạo</span>
        <b className="pl-username">{label}</b>
      </div>
      {err ? <p className="pl-auth-err">{err}</p> : null}
      <button type="button" className="ev-publish" onClick={submit}>
        Tạo phòng
      </button>
    </div>
  );
}
