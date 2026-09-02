import {
  defaultGreeting,
  defaultWakePhrase,
  genderVoicePitch,
  type AiCompanion,
  type AiGender,
} from "./ai-companion";

export function livePreviewScript(
  userName: string,
  aiName: string,
  gender: AiGender = "neutral"
): string {
  const u = userName.trim() || "bạn";
  const a = aiName.trim() || "Phúc";
  const vui =
    gender === "female" ? "rất vui được đồng hành" :
    gender === "male" ? "rất vui được đồng hành" :
    "rất vui được đồng hành";
  return (
    `Xin chào ${u}, mình là ${a}. ` +
    `${a} ${vui} với ${u} để livestream. ` +
    `Hãy ra lệnh bằng giọng nói cho mình. ` +
    `Mình cũng có thể tương tác trên màn hình livestream để hỗ trợ bạn khi bạn cần. ` +
    `Vui lòng chạm vào vị trí mà bạn cần mình tương tác.`
  );
}

export function resolveGreeting(
  companion: AiCompanion,
  userName: string
): string {
  const custom = companion.greetingText?.trim();
  if (custom) {
    return custom
      .replace(/\[tên bạn\]/gi, userName.trim() || "bạn")
      .replace(/\[tên trợ lý\]/gi, companion.name);
  }
  return defaultGreeting(userName);
}

export function resolveWakePhrase(companion: AiCompanion): string {
  const w = companion.wakePhrase?.trim();
  return w || defaultWakePhrase(companion.name);
}

export function matchesWake(transcript: string, companion: AiCompanion): boolean {
  const w = resolveWakePhrase(companion).toLowerCase();
  return transcript.trim().toLowerCase().includes(w);
}

export const PREVIEW_VOICE_VOLUME = 0.55;

export function speakPreviewGreeting(
  companion: AiCompanion,
  userName: string
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(resolveGreeting(companion, userName));
  u.lang = "vi-VN";
  u.rate = 1;
  u.pitch = genderVoicePitch(companion.gender);
  u.volume = Math.max(0, Math.min(1, companion.volume || PREVIEW_VOICE_VOLUME));
  window.speechSynthesis.speak(u);
  return u;
}
