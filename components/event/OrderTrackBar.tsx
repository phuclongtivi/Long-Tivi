"use client";

import { TRACK_STEPS, stepIndex, type OrderTrackStep } from "./order-track";

export function OrderTrackBar({ step }: { step: OrderTrackStep }) {
  const cur = stepIndex(step);
  return (
    <div
      style={{
        borderRadius: 16,
        padding: "14px 10px 10px",
        background: "linear-gradient(180deg,#1a1024 0%,#2a1538 100%)",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes pl-truck { 0%{transform:translateX(-8px)} 50%{transform:translateX(8px)} 100%{transform:translateX(-8px)} }
        @keyframes pl-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,.55)} 50%{box-shadow:0 0 0 8px rgba(244,63,94,0)} }
        @keyframes pl-flow { 0%{background-position:0 0} 100%{background-position:40px 0} }
      `}</style>
      <div style={{ fontSize: 12, fontWeight: 800, margin: "0 8px 10px", letterSpacing: 0.3 }}>
        Tình trạng đơn · {TRACK_STEPS[cur]?.icon} {TRACK_STEPS[cur]?.buyer}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", padding: "0 4px 6px" }}>
        {TRACK_STEPS.map((s, i) => {
          const done = i <= cur;
          const active = i === cur;
          return (
            <div key={s.id} style={{ flex: "1 0 52px", textAlign: "center", minWidth: 52 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 99,
                      background: done
                        ? "linear-gradient(90deg,#fb7185,#f43f5e,#fb7185)"
                        : "#3a2a48",
                      backgroundSize: "40px 3px",
                      animation: done ? "pl-flow 1s linear infinite" : undefined,
                    }}
                  />
                )}
                <div
                  style={{
                    width: active ? 28 : 22,
                    height: active ? 28 : 22,
                    borderRadius: "50%",
                    background: done ? "#f43f5e" : "#3a2a48",
                    display: "grid",
                    placeItems: "center",
                    fontSize: active ? 14 : 11,
                    animation: active ? "pl-pulse 1.4s ease-out infinite" : undefined,
                  }}
                >
                  {s.icon}
                </div>
                {i < TRACK_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      background: i < cur ? "#f43f5e" : "#3a2a48",
                    }}
                  />
                )}
              </div>
              <div style={{ fontSize: 9, marginTop: 6, opacity: done ? 1 : 0.45, lineHeight: 1.2 }}>
                {s.buyer}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 22,
          animation: "pl-truck 1.6s ease-in-out infinite",
          textAlign: step === "delivered" ? "right" : "left",
          padding: "0 8px",
        }}
      >
        {step === "delivered" ? "🏠" : "🚚"}
      </div>
    </div>
  );
}
