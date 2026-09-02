"use client";

import { useState, type ReactNode } from "react";

export function MenuAccordion({
  title,
  hint,
  children,
  defaultOpen = false,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="pl-menu-module"
      style={{
        color: "var(--pl-text)",
        marginBottom: 10,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          minHeight: 44,
          border: "none",
          background: "transparent",
          color: "inherit",
          fontWeight: 800,
          fontSize: 14,
          textAlign: "left",
          padding: "10px 12px",
        }}
      >
        <span className={open ? "pl-menu-caret on" : "pl-menu-caret"}>{open ? "▾" : "▸"}</span>{" "}
        {title}
        {hint && !open ? (
          <span style={{ fontWeight: 600, fontSize: 12, opacity: 0.65, marginLeft: 8 }}>{hint}</span>
        ) : null}
      </button>
      {open ? <div style={{ padding: "0 12px 12px" }}>{children}</div> : null}
    </div>
  );
}
