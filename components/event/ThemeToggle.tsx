"use client";

import { useEffect, useState } from "react";
import { nextTheme, readTheme, THEME_META, type AppTheme, writeTheme } from "./theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<AppTheme>("pearl");

  useEffect(() => {
    const current = readTheme();
    setTheme(current);
    writeTheme(current);
  }, []);

  const meta = THEME_META[theme];

  return (
    <button
      type="button"
      onClick={() => {
        const next = nextTheme(theme);
        setTheme(next);
        writeTheme(next);
      }}
      className="pl-v2-theme-toggle"
      title={`Đổi nền · hiện tại ${meta.label}`}
      aria-label={`Đổi nền, hiện tại ${meta.label}`}
    >
      <span className="pl-v2-theme-dot" style={{ background: meta.accent }} />
      <span>{meta.label}</span>
    </button>
  );
}
