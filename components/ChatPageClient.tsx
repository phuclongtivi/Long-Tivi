"use client";

import { ChatGridTab } from "@/components/event/ChatGridTab";
import type { ChatRoom } from "@/components/event/chat-grid";
import BottomNav from "@/components/BottomNav";

const SEED: ChatRoom[] = [
  {
    id: "r-live-1",
    title: "Live tối nay · Phúc Long",
    preview: "",
    memberIds: ["org"],
    isLive: true,
    liveSessionId: "live-open",
    insideCount: 12,
    watchingCount: 40,
    updatedAt: new Date(Date.now() + 3600_000).toISOString(),
  },
  {
    id: "r-wait-1",
    title: "Talkshow tuần sau",
    preview: "",
    memberIds: ["org"],
    isLive: false,
    insideCount: 2,
    watchingCount: 5,
    updatedAt: new Date(Date.now() + 86400_000 * 3).toISOString(),
  },
];

export default function ChatPageClient() {
  return (
    <main className="pl-page" style={{ minHeight: "100dvh", background: "transparent", color: "var(--pl-text)" }}>
      <ChatGridTab rooms={SEED} />
      <BottomNav activeHref="/chat" />
    </main>
  );
}
