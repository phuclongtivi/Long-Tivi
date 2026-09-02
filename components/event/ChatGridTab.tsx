"use client";

import { memo, useMemo, useState } from "react";
import { CreateGroupChatForm } from "./CreateGroupChatForm";
import { ChatRoomWindow } from "./ChatRoomWindow";
import {
  loadUserChatRooms,
  sortChatDrops,
  titleHex,
  type UserChatRoom,
} from "./chat-rooms";
import { sessionAccount } from "./account-links";
import type { ChatRoom } from "./chat-grid";
import type { FollowEdge } from "./follow";
import type { JoinedLive } from "./joined-lives";

function asUserRoom(r: ChatRoom): UserChatRoom {
  return {
    id: r.id,
    title: r.title,
    startsAt: r.updatedAt || new Date().toISOString(),
    creatorLabel: r.preview || "",
    creatorId: r.memberIds[0] || "sys",
    isLive: !!(r.isLive || r.liveSessionId),
    createdAt: r.updatedAt || new Date().toISOString(),
    titleColor: "navy",
    btcIds: r.memberIds,
    guestIds: [],
    insideCount: r.insideCount,
    watchingCount: r.watchingCount,
    creatorRank: "user",
  };
}

const Tile = memo(function Tile({
  room,
  onOpenTitle,
}: {
  room: UserChatRoom;
  onOpenTitle: (room: UserChatRoom) => void;
}) {
  const when = new Date(room.startsAt);
  const time = isNaN(+when)
    ? ""
    : when.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  return (
    <article className="pl-chat-drop">
      <button type="button" className="pl-chat-drop-title" onClick={() => onOpenTitle(room)}>
        <span style={{ color: titleHex(room.titleColor), fontWeight: 800 }}>{room.title}</span>
      </button>
      <div className="pl-chat-drop-rule" />
      <div className="pl-chat-drop-meta">
        <span>{time}</span>
        <span className="pl-username">{room.creatorLabel}</span>
      </div>
    </article>
  );
});

function Pane({
  title,
  rooms,
  onCreate,
  onOpenTitle,
}: {
  title: string;
  rooms: UserChatRoom[];
  onCreate: () => void;
  onOpenTitle: (room: UserChatRoom) => void;
}) {
  return (
    <section className="pl-chat-pane">
      <header className="pl-chat-pane-head">
        <h3>{title}</h3>
        <button type="button" className="pl-chat-create" onClick={onCreate}>
          Tạo Group Chat
        </button>
      </header>
      <div className="pl-chat-pane-body">
        {rooms.length === 0 ? <p className="pl-chat-empty">Chưa có phòng</p> : null}
        {rooms.map((r) => (
          <Tile key={r.id} room={r} onOpenTitle={onOpenTitle} />
        ))}
      </div>
    </section>
  );
}

function ChatGridTabInner({
  rooms = [],
}: {
  rooms?: ChatRoom[];
  me?: string;
  joined?: JoinedLive[];
  follows?: FollowEdge[];
  onOpen?: (room: ChatRoom) => void;
}) {
  const [extra, setExtra] = useState<UserChatRoom[]>(() => loadUserChatRooms());
  const [form, setForm] = useState<null | "live" | "wait">(null);
  const [open, setOpen] = useState<UserChatRoom | null>(null);

  const all = useMemo(() => {
    const mapped = rooms.map(asUserRoom);
    const ids = new Set(mapped.map((r) => r.id));
    return [...mapped, ...extra.filter((r) => !ids.has(r.id))];
  }, [rooms, extra]);

  const me = sessionAccount()?.id;
  const live = useMemo(() => sortChatDrops(all.filter((r) => r.isLive), me), [all, me]);
  const wait = useMemo(() => sortChatDrops(all.filter((r) => !r.isLive), me), [all, me]);

  if (open) return <ChatRoomWindow room={open} onClose={() => setOpen(null)} />;

  return (
    <div className="pl-page pl-chat-page">
      <h2>Chat</h2>
      <div className="pl-chat-split-col">
        <Pane title="Phòng đang live" rooms={live} onCreate={() => setForm("live")} onOpenTitle={setOpen} />
        <Pane title="Phòng đợi" rooms={wait} onCreate={() => setForm("wait")} onOpenTitle={setOpen} />
      </div>
      {form && (
        <div className="pl-group-mask" onClick={() => setForm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CreateGroupChatForm
              defaultLive={form === "live"}
              onClose={() => setForm(null)}
              onCreated={(row) => {
                setExtra((xs) => [row, ...xs]);
                setForm(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const ChatGridTab = memo(ChatGridTabInner);
