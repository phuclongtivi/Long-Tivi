# 1986 — Button, CTA and Navigation Audit

Date: 2026-08-30  
Scope: refactor pass 1

## Outcome

The first refactor pass aligns the app's highest-frequency actions around one continuous navigation model:

- Home owns event notices and their water-drop chat rooms.
- The center LIVE action owns the single Mixer-first room creation flow.
- superBUY occupies the former Chat position in the bottom navigation.
- Menu exposes the user's latest saved Mixer preset.
- Quick biometric sign-in is the first and visually prioritized login choice.

## Route and Logic Fixes

- `/live` now redirects to `/?pane=create` so the old duplicate room-creation flow cannot compete with the Mixer flow.
- Dashboard “Bắt đầu Live” now opens `/?pane=create`.
- The old Favorites shortcut now opens `/home?inbox=open` instead of the retired standalone Chat destination.
- Chat-room back navigation now returns to `/home?inbox=open` and is labelled “Home Chat”.
- Live detail returns to `/home`; live map/vote/detail pages use the shared future shell and navigation treatment.
- Login callback, login and transition screens use the shared application shell.

## Button, Label and Icon Treatment

- Added shared focus-visible, hover, active/tap and disabled-safe interaction treatment.
- Normalized key CTA classes: `pl-holo-button`, `pl-mini-button`, `pl-auth-provider`, `pl-nav-back`, `pl-glass-bar`.
- Moved Face ID / Touch ID / Windows Hello login to the top of the login screen with a clear “Ưu tiên” badge.
- Kept other social and Boss email methods below a labelled separator.
- Added device icon metadata and regenerated favicon, Apple touch, 192px and 512px icons from the red Phúc Long dragon logo.

## Diamond Sci-fi Polish

- Added shared diamond edge, glint, violet reflection and metallic shadow tokens for light and dark themes.
- Applied the light metallic layer to headings, tab labels, controls, Mixer, store cards, inventory/locker slots, gift/menu surfaces and common cards.
- Added a very low-density global sparkle layer and a slow sheen only on the priority login panel.
- Preserved `prefers-reduced-motion` support.
- Kept the effect CSS-only to avoid extra image requests or video-frame work.

## Verification

- `npm run build`: passed.
- Next.js production compilation: passed.
- Static generation: 30/30 pages passed.
- Route output includes the new `/icon.png` and `/apple-icon.png` metadata assets.

## Pass 2 Backlog

- Add explicit `type="button"` to legacy non-submit buttons that still rely on browser defaults.
- Replace remaining low-frequency hard-coded labels with `vi/en/zh` dictionary keys.
- Replace remaining legacy inline palette literals directly in source after the migration CSS layer is no longer needed.
- Run authenticated browser tests for create LIVE, create chat room, checkout, gift transfer, moderation and Boss controls.
- Re-enable TypeScript and ESLint build validation after resolving the existing legacy warning set.

