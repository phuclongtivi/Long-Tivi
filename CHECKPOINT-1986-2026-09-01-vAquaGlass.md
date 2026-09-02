# CHECKPOINT 1986 — 2026-09-01 — Aqua Glass Production Prep

Project: 1986 / Long / Long ProTivi

## Version names

1. Mobile iOS + Android: `Long Mobile 1986 AquaGlass Preview 1`
2. Long ProTivi Web + Desktop: `Long ProTivi 1986 AquaGlass HQ Preview 1`
3. longTV Android TV: `longTV 1986 Fullscreen Preview 1`

## Current download packages

1. `Long-1986-Mobile-iOS-Android-source-20260901-010448.zip`
2. `Long-ProTivi-Web-Desktop-source-20260901-010448.zip`
3. `Long-longTV-Android-TV-source-20260901-010448.zip`

## Completed in this pass

1. Confirmed responsive request is already in checklist under `Responsive Frontend Fit`, items 47-56.
2. Added production responsive CSS override: mobile viewport baseline, no horizontal scroll guard, viewport-safe sizing, laptop/tablet media queries, and video fit rules.
3. Set default visual direction to light blue `Long Aqua Glass`.
4. Prepared locked theme tokens for `Long Red Glass X` and `Long Pink Aura`.
5. Added Boss theme unlock scaffold in Boss Command Center: Aqua default, `Rực Rỡ`, and `Hồng Aura`.
6. Corrected Boss 2FA wording: Google Authenticator/TOTP is OFF by default and optional until Boss completes setup.
7. Reordered login priority: biometric/face recognition first, social quick login second, other methods after.
8. Removed floating mute/volume button from LIVE video overlay because audio control belongs to Mixer.
9. Cleaned duplicated Capacitor dependency versions.
10. Updated checklist status with this pass.

## Black panel / old dark graphic fix status

The app now has a final CSS override that forces the default product surface to a light Aqua theme and overrides old dark-theme backgrounds for app shells, cards, panels, inputs, and common chat/AI surfaces. This directly addresses the previously reported black boxes / text-covered-by-dark-panel issue at source level.

Remaining visual QA still required after deployment: open the live Vercel/mobile preview and manually verify every screen that had a screenshot issue, especially Notifications, User Menu, AI chat popup, LIVE/Vào Rạp, superBUY, Boss Menu, and login.

## Verification

1. `npm run build` passed.
2. Zip integrity check passed for all three packages.
3. `npm run lint` did not complete because the repo does not yet have ESLint configured and Next.js prompts for interactive setup. This remains a setup item before final store release.

## Publish/store note

These packages are source packages for GitHub and next-stage build. When packaging/publishing app releases, include all required store/build files that are intentionally excluded from GitHub source zips: signing certificates, keystores, Apple/Google/Microsoft credentials, production environment variables, final app icons/splash assets, privacy/data-safety answers, and generated release binaries such as `.ipa`, `.aab`, `.apk`, `.exe`, or store upload artifacts.

