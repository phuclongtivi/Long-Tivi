"use client";

import type { AppRole } from "./roles";
import type { CccdProfile, GiftTier } from "./gift-unlock";
import { UNLOCK_HINT, giftTiersFor, isCccdComplete } from "./gift-unlock";

const KINDS: { tier: GiftTier; title: string; how: string; color: string }[] = [
  { tier: 1, title: "Quà cấp 1 · Điểm 1", how: UNLOCK_HINT.needCccd, color: "linear-gradient(145deg,#ffd36a,#c47a10)" },
  { tier: 2, title: "Quà cấp 2 · Điểm 2", how: UNLOCK_HINT.tier2, color: "linear-gradient(145deg,#ff7eb3,#9b1b5a)" },
  { tier: 3, title: "Quà cấp 3 · Điểm 3", how: UNLOCK_HINT.tier3, color: "linear-gradient(145deg,#7d5cff,#2a1470)" },
];

type Props = {
  role: AppRole;
  cccd?: CccdProfile | null;
  items?: Partial<Record<GiftTier, string[]>>;
};

export function GiftVault({ role, cccd, items = {} }: Props) {
  const openTiers = giftTiersFor(role, cccd);
  const vaultOn = isCccdComplete(cccd);

  return (
    <section className="pl-vault-grid">
      <h3 style={{ margin: "0 0 8px", color: "var(--pl-text)" }}>Tủ đồ quà</h3>
      {KINDS.map((k) => {
        const on = openTiers.includes(k.tier);
        const list = items[k.tier] ?? [];
        const first = list.slice(0, 3);
        const rest = list.slice(3);
        return (
          <div
            key={k.tier}
            className="pl-vault-tier"
            style={{
              opacity: on ? 1 : 0.45,
              pointerEvents: on ? "auto" : "none",
              padding: 10,
              marginBottom: 10,
              color: "var(--pl-text)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>{k.title}</div>
            <div>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="pl-vault-cell"
                  style={{
                    display: "inline-block",
                    width: "31%",
                    marginRight: "2%",
                    marginBottom: 8,
                    verticalAlign: "top",
                    minHeight: 72,
                    background: first[i] ? k.color : "transparent",
                    color: first[i] ? "#fff" : "var(--pl-text)",
                    textAlign: "center",
                    paddingTop: 24,
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {first[i] ?? "Trống"}
                </div>
              ))}
              <div
                className="pl-vault-cell"
                style={{
                  display: "inline-block",
                  width: "31%",
                  marginBottom: 8,
                  verticalAlign: "top",
                  minHeight: 72,
                  background: "transparent",
                  padding: 6,
                }}
              >
                {(on ? (rest.length ? rest.slice(0, 4) : ["", ""]) : ["", ""]).map((x, i) => (
                  <div
                    key={i}
                    style={{
                      display: "inline-block",
                      width: "46%",
                      marginRight: "4%",
                      marginBottom: 4,
                      minHeight: 22,
                      borderRadius: 8,
                      border: "1px solid var(--pl-frame)",
                      background: x ? k.color : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            {!on && <p style={{ fontSize: 11, color: "#8a6a3b", margin: 0 }}>{k.how}</p>}
          </div>
        );
      })}
    </section>
  );
}
