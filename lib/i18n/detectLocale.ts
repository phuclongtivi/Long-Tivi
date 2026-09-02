import type { Locale } from './dictionaries';

/**
 * Map browser / region signals → app locale.
 * Priority: explicit user choice > navigator language > timezone heuristic > default vi
 */
const ZH_LANGS = ['zh', 'zh-cn', 'zh-tw', 'zh-hk', 'zh-sg'];
const EN_LANGS = ['en', 'en-us', 'en-gb', 'en-au', 'en-ca', 'en-nz', 'en-sg', 'en-in'];
const VI_LANGS = ['vi', 'vi-vn'];

/** Timezones that strongly suggest language */
const TZ_TO_LOCALE: Record<string, Locale> = {
  'Asia/Ho_Chi_Minh': 'vi',
  'Asia/Saigon': 'vi',
  'Asia/Bangkok': 'en', // Thailand often EN for apps; keep EN not VI
  'Asia/Shanghai': 'zh',
  'Asia/Chongqing': 'zh',
  'Asia/Harbin': 'zh',
  'Asia/Urumqi': 'zh',
  'Asia/Hong_Kong': 'zh',
  'Asia/Macau': 'zh',
  'Asia/Taipei': 'zh',
  'Asia/Singapore': 'en',
  'America/New_York': 'en',
  'America/Los_Angeles': 'en',
  'America/Chicago': 'en',
  'Europe/London': 'en',
  'Australia/Sydney': 'en',
};

export function localeFromLanguageTag(tag?: string | null): Locale | null {
  if (!tag) return null;
  const lower = tag.toLowerCase().replace('_', '-');
  const primary = lower.split('-')[0];
  if (VI_LANGS.includes(lower) || primary === 'vi') return 'vi';
  if (ZH_LANGS.includes(lower) || primary === 'zh') return 'zh';
  if (EN_LANGS.includes(lower) || primary === 'en') return 'en';
  return null;
}

export function localeFromTimezone(tz?: string | null): Locale | null {
  if (!tz) return null;
  if (TZ_TO_LOCALE[tz]) return TZ_TO_LOCALE[tz];
  if (tz.startsWith('Asia/') && /Shanghai|Chongqing|Harbin|Urumqi|Hong_Kong|Macau|Taipei|Beijing/.test(tz)) {
    return 'zh';
  }
  if (tz === 'Asia/Ho_Chi_Minh' || tz === 'Asia/Saigon') return 'vi';
  return null;
}

/**
 * Client-side: detect best locale from browser without user override.
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'vi';

  // navigator.languages (priority list)
  const langs = navigator.languages?.length
    ? Array.from(navigator.languages)
    : [navigator.language];

  for (const lang of langs) {
    const hit = localeFromLanguageTag(lang);
    if (hit) return hit;
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromTz = localeFromTimezone(tz);
    if (fromTz) return fromTz;
  } catch {
    // ignore
  }

  return 'vi';
}

/**
 * Server-side: from Accept-Language header
 */
export function detectLocaleFromAcceptLanguage(header?: string | null): Locale {
  if (!header) return 'vi';
  const parts = header.split(',').map((p) => p.trim().split(';')[0]);
  for (const p of parts) {
    const hit = localeFromLanguageTag(p);
    if (hit) return hit;
  }
  return 'vi';
}
