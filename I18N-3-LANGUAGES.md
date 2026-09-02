# i18n 3 Languages - Project 1986

Date: 2026-08-30

The app supports:

- Vietnamese: `vi`
- English: `en`
- Chinese: `zh`

Vietnamese remains the default language. The app detects browser language and keeps a manual user override in local storage through `LanguageProvider`.

## Implemented In This Update

- Expanded `lib/i18n/dictionaries.ts` with shared keys for Home, LIVE, superBUY, Menu, mixer, store, notifications, status, and common actions.
- Added `formatT()` for translated strings with variables.
- Added `tf()` to `LanguageProvider`.
- Connected visible high-traffic UI to i18n:
  - bottom navigation
  - Home search and create notice link
  - LIVE action bar
  - quick LIVE create flow
  - mixer autosave/AI Vision labels
  - superBUY locker header
  - Menu / Personal Vault sections and shortcuts

## Remaining QA Scope

Before App Store submission, continue moving hard-coded copy from lower-frequency screens into dictionary keys:

- Detailed checkout/payment flows.
- Ticket screens.
- Boss/admin panels.
- Report/block/moderation panels.
- Error messages returned from older API routes.
- Long legal copy.

Keep translations short to avoid mobile overflow.
