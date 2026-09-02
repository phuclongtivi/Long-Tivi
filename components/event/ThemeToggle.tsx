"use client";

import { useEffect, useState } from "react";
import { migrateLegacyTheme, THEME_META, THEMES, type AppTheme, writeTheme } from "./theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<AppTheme>("pearl");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTheme(migrateLegacyTheme());
  }, []);

  return (
    <div className="pl-v2-theme-picker">
      <button
        type="button"
        className="pl-v2-theme-toggle"
        aria-expanded={open}
        aria-label="Chọn màu nền"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pl-v2-theme-dot" style={{ background: THEME_META[theme].accent }} />
        <span>{THEME_META[theme].label}</span>
      </button>

      {open && (
        <div className="pl-v2-theme-menu" role="menu" aria-label="4 màu nền Long 1986 V2">
          {THEMES.map((item) => {
            const meta = THEME_META[item];
            return (
              <button
                key={item}
                type="button"
                role="menuitemradio"
                aria-checked={theme === item}
                className={theme === item ? "pl-v2-theme-option active" : "pl-v2-theme-option"}
                onClick={() => {
                  setTheme(item);
                  writeTheme(item);
                  setOpen(false);
                }}
              >
                <span className="pl-v2-theme-swatch" style={{ background: meta.bg, borderColor: meta.accent }} />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
