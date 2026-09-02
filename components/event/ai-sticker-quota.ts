/** Phí trợ lý AI bằng điểm sticker — sau khi hết quota ưu đãi user mới. */

export const NEW_USER_PROMO_TEXT = 20;
export const NEW_USER_PROMO_VOICE = 10;
export const NEGATIVE_GRACE_REPLIES = 10;

export const AI_COST = {
  chatbotReply: 0.5,
  voiceReply: 1,
} as const;

export type AiCredit = {
  points: number;
  promoTextLeft: number;
  promoVoiceLeft: number;
  graceUsed: number;
  promoDone: boolean;
};

export function defaultCredit(): AiCredit {
  return {
    points: 0,
    promoTextLeft: NEW_USER_PROMO_TEXT,
    promoVoiceLeft: NEW_USER_PROMO_VOICE,
    graceUsed: 0,
    promoDone: false,
  };
}

export function promoExhausted(c: AiCredit): boolean {
  return c.promoDone || (c.promoTextLeft <= 0 && c.promoVoiceLeft <= 0);
}

export type ChargeKind = "chatbot" | "voice";

export function costOf(kind: ChargeKind): number {
  return kind === "voice" ? AI_COST.voiceReply : AI_COST.chatbotReply;
}

export function isUnlimitedAiRole(role?: string | null): boolean {
  return role === "boss";
}

export function chargeAiReply(
  c: AiCredit,
  kind: ChargeKind,
  role?: string | null
): { ok: boolean; credit: AiCredit; charged: number; reason?: string } {
  if (isUnlimitedAiRole(role)) {
    return { ok: true, credit: c, charged: 0 };
  }
  const next = { ...c };
  if (kind === "voice" && next.promoVoiceLeft > 0) {
    next.promoVoiceLeft -= 1;
    if (next.promoTextLeft <= 0 && next.promoVoiceLeft <= 0) next.promoDone = true;
    return { ok: true, credit: next, charged: 0 };
  }
  if (kind === "chatbot" && next.promoTextLeft > 0) {
    next.promoTextLeft -= 1;
    if (next.promoTextLeft <= 0 && next.promoVoiceLeft <= 0) next.promoDone = true;
    return { ok: true, credit: next, charged: 0 };
  }

  const fee = costOf(kind);
  const after = +(next.points - fee).toFixed(2);

  if (after >= 0) {
    next.points = after;
    next.promoDone = true;
    return { ok: true, credit: next, charged: fee };
  }

  if (next.graceUsed < NEGATIVE_GRACE_REPLIES) {
    next.points = after;
    next.graceUsed += 1;
    next.promoDone = true;
    return { ok: true, credit: next, charged: fee };
  }

  return {
    ok: false,
    credit: next,
    charged: 0,
    reason: "Hết tín dụng AI. Trừ điểm sticker hoặc mua điểm để gia hạn.",
  };
}
