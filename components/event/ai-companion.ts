export type AiIdleShape = "mascot" | "orb" | "mini-avatar" | "corner-pin";
export type AiInputMode = "voice" | "keyboard";
export type AiGender = "male" | "female" | "neutral";

export type AiCompanion = {
  name: string;
  avatarUrl: string;
  idleShape: AiIdleShape;
  commandMode: boolean;
  inputMode: AiInputMode;
  voiceSecondsLeft: number;
  volume: number;
  gender: AiGender;
  code: string;
  birthDate: string;
  voiceListenOn: boolean;
  wakePhrase: string;
  greetingText: string;
};

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function randomAiCode(): string {
  const a = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const b = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const n = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${a}${b}${n}`;
}

export const GENDER_LABEL: Record<AiGender, string> = {
  male: "Nam",
  female: "Nữ",
  neutral: "Trung tính",
};

export function genderVoicePitch(g: AiGender): number {
  if (g === "female") return 1.15;
  if (g === "male") return 0.9;
  return 1;
}

export function genderSelf(_g: AiGender): string {
  return "mình";
}

export const DEFAULT_VOICE_SECONDS = 90;
export const AI_MASCOT_ROUND = "/ai-mascot-round-v2.webp";
export const AI_MASCOT_FULL = "/ai-mascot-full-v2.webp";

export const DEFAULT_COMPANION: AiCompanion = {
  name: "Phúc",
  avatarUrl: AI_MASCOT_ROUND,
  idleShape: "mascot",
  commandMode: false,
  inputMode: "voice",
  voiceSecondsLeft: DEFAULT_VOICE_SECONDS,
  volume: 0.8,
  gender: "neutral",
  code: "PL00",
  birthDate: "",
  voiceListenOn: true,
  wakePhrase: "",
  greetingText: "",
};

export function defaultWakePhrase(aiName: string): string {
  const n = (aiName || "Phúc").trim();
  return `${n} ơi`;
}

export function defaultGreeting(userName: string): string {
  return `Xin chào ${userName.trim() || "bạn"}`;
}

export const WAKE_PHRASE_EXAMPLE = "Phúc ơi";
export const GREETING_EXAMPLE = "Xin chào [tên bạn]";

export function spawnCompanionOnCccd(now = new Date()): AiCompanion {
  return {
    ...DEFAULT_COMPANION,
    code: randomAiCode(),
    birthDate: now.toISOString().slice(0, 10),
    inputMode: "voice",
    commandMode: false,
    volume: 0.55,
  };
}

export function consumeVoice(ai: AiCompanion, seconds: number): AiCompanion {
  const left = Math.max(0, ai.voiceSecondsLeft - Math.max(0, seconds));
  return {
    ...ai,
    voiceSecondsLeft: left,
    inputMode: left <= 0 ? "keyboard" : ai.inputMode,
  };
}

export const IDLE_SHAPE_LABEL: Record<AiIdleShape, string> = {
  mascot: "Linh vật đứng góc",
  orb: "Viên ngọc nhỏ",
  "mini-avatar": "Ảnh tròn mini",
  "corner-pin": "Ghim góc màn hình",
};
