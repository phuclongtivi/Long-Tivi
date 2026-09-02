/** Nhận diện giọng nói → lệnh cho trợ lý. */

export type SpeechResult = {
  text: string;
  final: boolean;
};

export function canSpeechRecognize(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startPhucListen(opts: {
  lang?: string;
  onResult: (r: SpeechResult) => void;
  onError?: (msg: string) => void;
  onEnd?: () => void;
}): { stop: () => void } | null {
  if (!canSpeechRecognize()) {
    opts.onError?.("Trình duyệt không hỗ trợ nhận giọng.");
    return null;
  }
  const Ctor = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  const rec = new Ctor();
  rec.lang = opts.lang ?? "vi-VN";
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (ev: SpeechRecognitionEvent) => {
    const last = ev.results[ev.results.length - 1];
    if (!last) return;
    opts.onResult({ text: last[0].transcript.trim(), final: last.isFinal });
  };
  rec.onerror = (e: Event & { error?: string }) => {
    opts.onError?.(e.error || "speech-error");
  };
  rec.onend = () => opts.onEnd?.();
  try {
    rec.start();
  } catch {
    opts.onError?.("Không bật được micro.");
    return null;
  }
  return { stop: () => { try { rec.stop(); } catch { /* */ } } };
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}
