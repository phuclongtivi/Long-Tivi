"use client";

import { useEffect, useState } from "react";
import { migrateLegacyTheme, THEME_META, THEMES, type AppTheme, writeTheme } from "./theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<AppTheme>("pearl");

  useEffect(() => {
    setTheme(migrateLegacyTheme());
  }, []);

  return (
    <div className="pl-v2-theme-picker" role="group" aria-label="Chọn màu nền Long 1986 V2">
      <div className="pl-v2-theme-title">Màu nền</div>
      <div className="pl-v2-theme-buttons">
        {THEMES.map((item) => {
          const meta = THEME_META[item];
          const active = theme === item;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={active}
              title={meta.label}
              className={active ? "pl-v2-theme-option active" : "pl-v2-theme-option"}
              onClick={() => {
                setTheme(item);
                writeTheme(item);
              }}
            >
              <span
                className="pl-v2-theme-swatch"
                style={{ background: meta.bg, borderColor: meta.accent }}
                aria-hidden="true"
              />
              <span className="pl-v2-theme-option-label">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
