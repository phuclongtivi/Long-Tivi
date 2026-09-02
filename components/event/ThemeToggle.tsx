"use client";

import { useEffect } from "react";
import { writeTheme } from "./theme";

export function ThemeToggle() {
  useEffect(() => {
    writeTheme("light");
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        writeTheme("light");
      }}
      style={{
        height: 32,
        padding: "0 10px",
        borderRadius: 999,
        border: "1px solid var(--pl-border)",
        background: "transparent",
        color: "var(--pl-text)",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      Chủ đề sáng
    </button>
  );
}
