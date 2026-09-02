'use client';

import { useLanguage } from './LanguageProvider';
import type { Locale } from '@/lib/i18n/dictionaries';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, locales, t } = useLanguage();

  return (
    <div className="pl-language-switcher inline-flex items-center gap-1 rounded-full px-1 py-1">
      {!compact && (
        <span className="px-2 text-xs font-semibold">{t('language')}</span>
      )}
      {locales.map((l) => {
        const active = locale === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code as Locale)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
              active
                ? 'pl-lang-on'
                : 'pl-lang-off'
            }`}
            aria-pressed={active}
            title={l.native}
          >
            {l.code === 'vi' ? 'VI' : l.code === 'en' ? 'EN' : '中文'}
          </button>
        );
      })}
    </div>
  );
}
