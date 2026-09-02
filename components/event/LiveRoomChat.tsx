"use client";

import { useMemo, useState } from "react";
import { FollowButton } from "./FollowButton";
import { sortLiveChatLines, type LiveChatLine } from "./live-room-chat";
import type { FollowEdge } from "./follow";
import type { JoinedLive } from "./joined-lives";

const DEMO: LiveChatLine[] = [
  {
    id: "1",
    userId: "org-1",
    name: "Phúc Long Center",
    text: "Chào phòng live",
    at: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "u2",
    name: "Bạn A",
    text: "đã tặng Gấu trà sữa",
    stickerName: "Gấu trà sữa",
    stickerUrl: "/stickers/l1/01.webp",
    at: new Date(Date.now() - 60000).toISOString(),
  },
];

export function LiveRoomChat({
  roomId,
  layout = "floating",
  me = "me",
  joined = [],
  follows = [],
  followingIds = new Set<string>(),
  onFollow,
  onGift,
}: {
  roomId: string;
  layout?: "floating" | "fullscreen-bar";
  me?: string;
  joined?: JoinedLive[];
  follows?: FollowEdge[];
  followingIds?: Set<string>;
  onFollow?: (userId: string) => void;
  onGift?: (userId: string, name: string) => void;
}) {
  const [text, setText] = useState("");
  const [lines, setLines] = useState<LiveChatLine[]>(DEMO);
  const list = useMemo(
    () => sortLiveChatLines(lines, { me, roomId, joined, follows }),
    [lines, me, roomId, joined, follows]
  );

  function send() {
    const t = text.trim();
    if (!t) return;
    setLines((xs) => [
      {
        id: `m-${Date.now()}`,
        userId: me,
        name: "Bạn",
        text: t,
        at: new Date().toISOString(),
      },
      ...xs,
    ]);
    setText("");
  }

  const shellStyle =
    layout === "fullscreen-bar"
      ? {
          position: "absolute" as const,
          left: "50%",
          bottom: 18,
          transform: "translateX(-50%)",
          width: "min(760px, calc(100vw - 180px))",
          maxHeight: 112,
          zIndex: 5,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 210px",
          background: "rgba(255,255,255,.84)",
          border: "1px solid rgba(125,211,252,.42)",
          boxShadow: "0 16px 42px rgba(15,23,42,.18)",
          borderRadius: 8,
          overflow: "hidden",
          color: "var(--pl-text)",
          fontSize: 11,
          backdropFilter: "blur(18px) saturate(1.25)",
        }
      : {
          position: "absolute" as const,
          top: 52,
          right: 12,
          width: "min(220px, 42vw)",
          maxHeight: 168,
          zIndex: 5,
          display: "flex",
          flexDirection: "column" as const,
          background: "rgba(255,255,255,.76)",
          border: "1px solid rgba(125,211,252,.42)",
          boxShadow: "0 12px 28px rgba(15,23,42,.16)",
          borderRadius: 8,
          overflow: "hidden",
          color: "var(--pl-text)",
          fontSize: 11,
          backdropFilter: "blur(14px) saturate(1.2)",
        };

  return (
    <div className={layout === "fullscreen-bar" ? "pl-live-chat-bar" : "pl-live-chat-float"} style={shellStyle}>
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px", minHeight: layout === "fullscreen-bar" ? 64 : 72 }}>
        {list.map((m) => (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              <b style={{ fontSize: 11 }}>{m.name}</b>
              {m.userId !== me && (
                <>
                  <FollowButton
                    following={followingIds.has(m.userId)}
                    onToggle={() => onFollow?.(m.userId)}
                  />
                  <button
                    type="button"
                    onClick={() => onGift?.(m.userId, m.name)}
                    style={{
                      height: 22,
                      padding: "0 6px",
                      borderRadius: 999,
                      border: "1px solid rgba(37,99,235,.18)",
                      background: "rgba(255,255,255,.72)",
                      color: "var(--pl-text)",
                      fontSize: 10,
                    }}
                  >
                    Tặng quà
                  </button>
                </>
              )}
            </div>
            {m.stickerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.stickerUrl} alt={m.stickerName || "sticker"} width={40} height={40} style={{ marginTop: 4 }} />
            ) : null}
            {m.text ? <div style={{ opacity: 0.9, marginTop: 2 }}>{m.text}</div> : null}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", borderTop: "1px solid var(--pl-frame)" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhắn…"
          style={{
            flex: 1,
            background: "rgba(255,255,255,.9)",
            border: "none",
            color: "var(--pl-text)",
            padding: "6px 8px",
            fontSize: 12,
            outline: "none",
          }}
        />
        {layout === "fullscreen-bar" ? (
          <button
            type="submit"
            style={{
              border: "none",
              padding: "0 14px",
              background: "linear-gradient(135deg,#2563eb,#22d3ee)",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Gửi
          </button>
        ) : null}
      </form>
    </div>
  );
}
