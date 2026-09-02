/** Ai được lệnh trợ lý trên phiên live. */

export type LiveActor = "organizer" | "assistant" | "guest" | "viewer";

export function canCommandAi(actor: LiveActor): boolean {
  return actor === "organizer" || actor === "assistant";
}

export function canPlayFreeAudio(actor: LiveActor): boolean {
  return actor === "organizer" || actor === "assistant";
}

export function canRunCaption(actor: LiveActor): boolean {
  return actor === "organizer" || actor === "assistant";
}

export const AI_PLAY_POLICY =
  "Chỉ BTC được yêu cầu bài hát / đoạn nhạc. Trợ lý được tự tìm nguồn miễn phí (YouTube, SoundCloud, Zing MP3, nguồn mở khác) để phát thay BTC. Khách mời và khán giả không được lệnh trợ lý làm bất kỳ việc gì.";
