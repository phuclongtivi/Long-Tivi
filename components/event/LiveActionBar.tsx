"use client";

import { memo } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export type LivePane = "lobby" | "create" | "cinema" | "wallet" | "devices" | "xr";

const BTN: { id: LivePane; labelKey: string; hintKey: string }[] = [
  { id: "create", labelKey: "create_live_room", hintKey: "start_live_hint" },
  { id: "cinema", labelKey: "enter_cinema", hintKey: "enter_cinema_hint" },
  { id: "devices", labelKey: "connect_tv", hintKey: "qr_remote_hint" },
  { id: "xr", labelKey: "connect_xr", hintKey: "xr_mode_hint" },
  { id: "wallet", labelKey: "gift_wallet", hintKey: "gift_wallet_hint" },
];

function LiveActionBarInner({
  active,
  onPick,
}: {
  active: LivePane;
  onPick: (p: LivePane) => void;
}) {
  const { t } = useLanguage();
  return (
    <div
      className="pl-grid-tabs pl-live-actionbar"
      style={{
        padding: "8px 16px",
        background: "transparent",
        position: "sticky",
        top: 40,
        zIndex: 15,
      }}
    >
      {BTN.map((b) => {
        const on = active === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b.id)}
            aria-pressed={on}
            className="pl-live-top-tab"
            style={{
              minHeight: 44,
              borderRadius: 14,
              border: on ? "1px solid rgba(34,211,238,.55)" : "1px solid var(--pl-frame)",
              background: "transparent",
              color: "var(--pl-text)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>{t(b.labelKey)}</span>
            <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>{t(b.hintKey)}</span>
          </button>
        );
      })}
    </div>
  );
}

export const LiveActionBar = memo(LiveActionBarInner);
