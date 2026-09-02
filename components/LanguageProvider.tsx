'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, Locale, LOCALES, formatT, t as translate } from '@/lib/i18n/dictionaries';
import { detectBrowserLocale } from '@/lib/i18n/detectLocale';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isManual: boolean;
  clearManual: () => void;
  t: (key: string) => string;
  tf: (key: string, vars: Record<string, string | number>) => string;
  locales: typeof LOCALES;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'phuc-long-locale';
const MANUAL_KEY = 'phuc-long-locale-manual';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isManual, setIsManual] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const manual = localStorage.getItem(MANUAL_KEY) === '1';
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;

      if (manual && saved && LOCALES.some((l) => l.code === saved)) {
        setLocaleState(saved);
        setIsManual(true);
        document.documentElement.lang = saved === 'zh' ? 'zh-CN' : saved;
      } else {
        const detected = detectBrowserLocale();
        setLocaleState(detected);
        setIsManual(false);
        localStorage.setItem(STORAGE_KEY, detected);
        localStorage.removeItem(MANUAL_KEY);
        document.documentElement.lang = detected === 'zh' ? 'zh-CN' : detected;
      }
    } catch {
      setLocaleState(detectBrowserLocale());
    }
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setIsManual(true);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.setItem(MANUAL_KEY, '1');
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : next;
    } catch {
      // ignore
    }
  }, []);

  const clearManual = useCallback(() => {
    const detected = detectBrowserLocale();
    setLocaleState(detected);
    setIsManual(false);
    try {
      localStorage.setItem(STORAGE_KEY, detected);
      localStorage.removeItem(MANUAL_KEY);
      document.documentElement.lang = detected === 'zh' ? 'zh-CN' : detected;
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const tf = useCallback(
    (key: string, vars: Record<string, string | number>) => formatT(locale, key, vars),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, isManual, clearManual, t, tf, locales: LOCALES }),
    [locale, setLocale, isManual, clearManual, t, tf]
  );

  if (!ready) {
    return <div className="min-h-screen pl-future-shell" />;
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
