"use client";

import { canCreateEvent, ROLE_HINT, type AppRole } from "./roles";
import "./event-feature.css";

type Props = {
  role: AppRole;
  onCreateEvent?: () => void;
  onCreateShop?: () => void;
  onListProduct?: () => void;
};

export function DashboardShopButtons({
  role,
  onCreateEvent,
  onCreateShop,
  onListProduct,
}: Props) {
  const allowed = canCreateEvent(role);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <button className="create-event-btn" disabled={!allowed} onClick={() => allowed && onCreateEvent?.()}>
        Tạo Event
      </button>
      <button className="create-event-btn" disabled={!allowed} onClick={() => allowed && onCreateShop?.()}>
        Khởi tạo gian hàng
      </button>
      <button className="create-event-btn" disabled={!allowed} onClick={() => allowed && onListProduct?.()}>
        Niêm yết mặt hàng
      </button>
      {!allowed && <p className="create-event-hint">{ROLE_HINT[role]}</p>}
    </div>
  );
}
