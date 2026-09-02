export const LONG_LAB_BRAIN_VERSION = "1986-human-v0.1";

export const LONG_LAB_CORE_KEYWORDS = [
  "nang cap",
  "nâng cấp",
  "tai sao",
  "tại sao",
  "muon",
  "muốn",
  "co",
  "có",
  "duoc",
  "được",
  "phai",
  "phải",
] as const;

export type LongLabBrainObject =
  | "flashflow-image-operating-system"
  | "qr-growth-generative-ai";

export type LongLabBrainSignal = {
  version: typeof LONG_LAB_BRAIN_VERSION;
  sourceText: string;
  matchedKeywords: string[];
  targetBrains: LongLabBrainObject[];
  action: "learn-and-upgrade-proposal";
  requiresBossConfirm: boolean;
  storeReadyGuard: boolean;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function detectLongLabBrainSignal(sourceText: string): LongLabBrainSignal | null {
  const normalized = normalizeText(sourceText);
  const matchedKeywords = LONG_LAB_CORE_KEYWORDS.filter((keyword) =>
    normalized.includes(normalizeText(keyword))
  );

  if (!matchedKeywords.length) return null;

  return {
    version: LONG_LAB_BRAIN_VERSION,
    sourceText,
    matchedKeywords: Array.from(new Set(matchedKeywords)),
    targetBrains: ["flashflow-image-operating-system", "qr-growth-generative-ai"],
    action: "learn-and-upgrade-proposal",
    requiresBossConfirm: true,
    storeReadyGuard: true,
  };
}
