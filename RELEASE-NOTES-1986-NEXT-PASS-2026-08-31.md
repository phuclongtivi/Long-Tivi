# Release Notes 1986 — Next Code Pass

Baseline: `Long-1986-button-audit-diamond-refactor-pass1-2026-08-30.zip`

## Included

- Added Personal AI level 2 entry in user Menu.
- Added Boss Menu/Boss AI command center scaffold with Google Authenticator/2FA direction.
- Added TV Display Mode/longTV/QR remote connection panel.
- Added AR/VR/MR entry next to TV connection in LIVE.
- Added 720p default with 1080p as a selectable, non-default quality.
- Added fixed secondary control dock for small controls like volume and AI.
- Polished Notifications with a lightweight signal-center shell.
- Polished Cart/commerce flow with 1986 sci-fi visual language.
- Added event notice impact panel showing one notice can push to Home, Notifications, Chat, LIVE, superBUY, and reminders.
- Added delivery docs for App Store, Google Play, longTV, AI Agent, Boss Menu, QA, and checklist status.
- Added Prisma scaffold models for PersonalAgent, AgentMemory, AgentSkill, AgentPermission, AgentTask, AgentConnector, AgentActionLog, BossAiPolicy, and TvPairingSession.
- Added API scaffolds for AI agent profile/action log, AI Router, Boss policy, and TV QR pairing.
- Added `/boss-login` and `/tv-connect` routes.
- Closed the old checklist for this delivery pass and opened a new production checklist.
- Added Capacitor Android source project in `android/`.
- Added Android TV source scaffold for `longTV` in `android-tv/longTV/`.
- Added Android/Google Play and longTV build notes.

## Not Yet Full Production

- Boss Google Authenticator is documented/scaffolded in UI, not wired to a real TOTP backend yet.
- Android, iOS native builds, and longTV app packages are scoped for the same release train but require store credentials/native build steps when requested.
- AI Router and external connectors are designed/scaffolded, not connected to production secrets in this package.
- Android native build was not completed in this runtime because Gradle distribution download was blocked.
