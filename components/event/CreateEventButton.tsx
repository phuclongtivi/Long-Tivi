"use client";

import { canCreateEvent, ROLE_HINT, type AppRole } from "./roles";
import "./event-feature.css";

type Props = {
  role: AppRole;
  onClick?: () => void;
};

export function CreateEventButton({ role, onClick }: Props) {
  const allowed = canCreateEvent(role);
  return (
    <div>
      <button
        type="button"
        className="create-event-btn"
        disabled={!allowed}
        aria-disabled={!allowed}
        title={ROLE_HINT[role]}
        onClick={() => allowed && onClick?.()}
      >
        Tạo Event
      </button>
      {!allowed && <p className="create-event-hint">{ROLE_HINT[role]}</p>}
    </div>
  );
}
