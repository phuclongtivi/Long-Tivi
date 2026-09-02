"use client";

import { useState } from "react";
import type { AiCredit } from "./ai-sticker-quota";
import { AI_COST, promoExhausted } from "./ai-sticker-quota";
import {
  DEFAULT_COMPANION,
  GREETING_EXAMPLE,
  defaultWakePhrase,
  type AiCompanion,
} from "./ai-companion";

function Battery({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(100, pct));
  const fill = p > 40 ? "#22c55e" : p > 15 ? "#eab308" : "#ef4444";
  return (
    <svg width="28" height="14" viewBox="0 0 28 14" aria-hidden>
      <rect x="0.5" y="2" width="24" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="25.2" y="5" width="2.2" height="4" rx="0.6" fill="currentColor" />
      <rect x="2" y="3.6" width={(20 * p) / 100} height="6.8" rx="1" fill={fill} />
    </svg>
  );
}

export function AiCreditBar({
  credit,
  companion = DEFAULT_COMPANION,
  onCompanion,
  role,
}: {
  credit: AiCredit;
  companion?: AiCompanion;
  onCompanion?: (c: AiCompanion) => void;
  role?: string | null;
}) {
  const unlimited = role === "boss";
  const shown = Math.max(0, credit.points);
  const pct = unlimited ? 100 : credit.points <= 0 ? 4 : Math.min(100, (credit.points / 20) * 100);
  const [wakeFocus, setWakeFocus] = useState(false);
  const [greetFocus, setGreetFocus] = useState(false);

  function patch(p: Partial<AiCompanion>) {
    onCompanion?.({ ...companion, ...p });
  }

  const wakeShown =
    wakeFocus || companion.wakePhrase ? companion.wakePhrase : "";
  const greetShown =
    greetFocus || companion.greetingText ? companion.greetingText : "";

  return (
    <section
      style={{
        background: "var(--pl-surface, #101826)",
        color: "var(--pl-text, #F4F7FB)",
        border: "1px solid var(--pl-border, #243044)",
        borderRadius: 14,
        padding: "10px 12px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, flexWrap: "wrap" }}>
        <Battery pct={pct} />
        <span>Tín dụng AI</span>
        <span style={{ fontSize: 16 }}>{unlimited ? "Không giới hạn (Boss)" : `${shown.toFixed(1)} điểm`}</span>
        <button
          type="button"
          onClick={() => patch({ voiceListenOn: !companion.voiceListenOn, inputMode: companion.voiceListenOn ? "keyboard" : "voice" })}
          style={{
            marginLeft: "auto",
            height: 32,
            padding: "0 12px",
            border: "none",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 12,
            background: companion.voiceListenOn ? "#22c55e" : "#444",
            color: "#fff",
          }}
        >
          {companion.voiceListenOn ? "Giọng: Bật" : "Giọng: Tắt"}
        </button>
      </div>
      <p style={{ fontSize: 11, opacity: 0.75, margin: "6px 0 8px" }}>
        {unlimited
          ? "AI Boss không trừ điểm. Được xử lý việc thay boss: sự kiện, kho sticker, đơn, trần khán giả."
          : `Chatbot 1 câu = ${AI_COST.chatbotReply} điểm · Giọng nói 1 câu = ${AI_COST.voiceReply} điểm${
              promoExhausted(credit) ? " · Đã hết ưu đãi user mới" : " · Đang dùng quota ưu đãi"
            }${credit.points < 0 ? ` · Âm ${Math.abs(credit.points).toFixed(1)} · ân hạn ${credit.graceUsed}/10` : ""}`}
      </p>

      <label style={{ display: "block", fontSize: 12, fontWeight: 700 }}>
        Khẩu lệnh gọi AI
        <input
          value={wakeShown}
          placeholder={defaultWakePhrase(companion.name)}
          onFocus={() => setWakeFocus(true)}
          onBlur={() => setWakeFocus(false)}
          onChange={(e) => patch({ wakePhrase: e.target.value })}
          style={{ width: "100%", marginTop: 4, color: "#111" }}
        />
      </label>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginTop: 8 }}>
        Câu chào khi AI được gọi
        <textarea
          value={greetShown}
          placeholder={GREETING_EXAMPLE}
          onFocus={() => setGreetFocus(true)}
          onBlur={() => setGreetFocus(false)}
          onChange={(e) => patch({ greetingText: e.target.value })}
          rows={3}
          style={{ width: "100%", marginTop: 4, color: "#111" }}
        />
      </label>
    </section>
  );
}
