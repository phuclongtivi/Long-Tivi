import { detectProvider, embedUrl, type StreamProvider } from "./live-audio-sources";
import { canPlayFreeAudio, type LiveActor } from "./ai-live-permissions";

const PLAY = /(?:phát|mở|play)\s+(https?:\/\/\S+)/i;

export function parsePlayCommand(
  text: string,
  actor: LiveActor = "organizer"
): { url: string; provider: StreamProvider; embed: string | null } | null {
  if (!canPlayFreeAudio(actor)) return null;
  const m = text.match(PLAY) || text.match(/(https?:\/\/\S*(?:youtube|youtu\.be|zingmp3|soundcloud)\S*)/i);
  if (!m) return null;
  const url = m[1];
  return { url, provider: detectProvider(url), embed: embedUrl(url) };
}

const SONG = /(?:phát|mở|bật|chơi)\s+(?:bài|nhạc|đoạn)?\s*(.+)/i;

export function parseSongRequest(
  text: string,
  actor: LiveActor
): { query: string } | null {
  if (!canPlayFreeAudio(actor)) return null;
  const m = text.match(SONG);
  if (!m) return null;
  return { query: m[1].trim() };
}
