"use client";

import { memo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { APP_PROFILE } from "@/components/core/app-profile";

export type LivePane = "lobby" | "create" | "cinema" | "wallet" | "devices" | "xr";

const ALL = [
  { id: "create" as const, labelKey: "create_live_room", hintKey: "start_live_hint" },
  { id: "cinema" as const, labelKey: "enter_cinema", hintKey: "enter_cinema_hint" },
  { id: "devices" as const, labelKey: "connect_tv", hintKey: "qr_remote_hint" },
  { id: "xr" as const, labelKey: "connect_xr", hintKey: "xr_mode_hint" },
  { id: "wallet" as const, labelKey: "gift_wallet", hintKey: "gift_wallet_hint" },
];

const BY_PROFILE: Record<typeof APP_PROFILE, LivePane[]> = {
  mobile: ["create", "cinema", "wallet"],
  pro: ["create", "cinema", "devices", "wallet"],
  tv: ["cinema", "devices"],
};

function LiveActionBarInner({
  active,
  onPick,
}: {
  active: LivePane;
  onPick: (p: LivePane) => void;
}) {
  const { t } = useLanguage();
  const allowed = BY_PROFILE[APP_PROFILE];
  const buttons = ALL.filter((b) => allowed.includes(b.id));

  return (
    <div className="pl-grid-tabs pl-live-actionbar pl-v2-actionbar">
      {buttons.map((b) => {
        const on = active === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b.id)}
            aria-pressed={on}
            className={on ? "pl-live-top-tab pl-v2-control active" : "pl-live-top-tab pl-v2-control"}
          >
            <span>{t(b.labelKey)}</span>
            <span className="pl-v2-control-hint">{t(b.hintKey)}</span>
          </button>
        );
      })}
    </div>
  );
}

export const LiveActionBar = memo(LiveActionBarInner);
