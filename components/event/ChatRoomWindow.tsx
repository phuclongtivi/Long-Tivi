"use client";

import { useMemo, useState } from "react";
import { sessionAccount } from "./account-links";
import { AiMascot } from "./AiMascot";
import {
  formatProfileUsername,
  loadRoomMsgs,
  saveRoomMsg,
  sortPinnedFirst,
  titleHex,
  type RoomChatMsg,
  type UserChatRoom,
} from "./chat-rooms";

export function ChatRoomWindow({
  room,
  onClose,
}: {
  room: UserChatRoom;
  onClose: () => void;
}) {
  const acc = sessionAccount();
  const me = useMemo(
    () => formatProfileUsername({ username: acc?.displayName, cccd: acc?.cccd }),
    [acc]
  );
  const [joined, setJoined] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<RoomChatMsg[]>(() => loadRoomMsgs(room.id));
  const list = sortPinnedFirst(msgs);

  function send() {
    const t = text.trim();
    if (!t || !joined) return;
    const m: RoomChatMsg = {
      id: "m-" + Date.now(),
      roomId: room.id,
      text: t,
      at: new Date().toISOString(),
      fromLabel: me,
      pinned: acc?.id === room.creatorId,
    };
    saveRoomMsg(m);
    setMsgs((xs) => [...xs, m]);
    setText("");
  }

  return (
    <div className="pl-room-full">
      <header className="pl-room-bar">
        <button type="button" className="pl-room-back" onClick={onClose}>
          ←
        </button>
        <h2 style={{ color: titleHex(room.titleColor) }}>{room.title}</h2>
        {!joined ? (
          <button type="button" className="ev-publish pl-room-join" onClick={() => setJoined(true)}>
            Tham gia
          </button>
        ) : (
          <span className="pl-room-in">Đã vào</span>
        )}
      </header>
      <div className="pl-room-msgs" style={{ position: "relative", paddingRight: 92 }}>
        <div className="pl-ai-stand">
          <AiMascot kind="full" size={80} />
        </div>
        {list.length === 0 ? <p className="pl-chat-empty">Chưa có tin. Bấm Tham gia để chat.</p> : null}
        {list.map((m) => (
          <div key={m.id} className={m.pinned ? "pl-room-msg pin" : "pl-room-msg"}>
            <b className="pl-username">{m.fromLabel}</b>
            {m.pinned ? <span className="pl-pin">BTC</span> : null}
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      {joined ? (
        <form
          className="pl-room-input"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhắn…" />
          <button type="submit" className="ev-publish">
            Gửi
          </button>
        </form>
      ) : null}
    </div>
  );
}
