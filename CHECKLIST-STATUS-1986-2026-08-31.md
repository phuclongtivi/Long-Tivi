# Checklist Status 1986

Legend: Implemented = visible code/UI included. Scaffold = code/API/spec prepared, production backend pending. Roadmap = documented for next phase.

Status of old checklist: closed for this delivery pass. Remaining deep production work has been moved to the new checklist.

| Area | Status | Result |
| --- | --- | --- |
| i18n 3 languages | Scaffold | Existing 3-language foundation kept; new LIVE TV/XR keys added. |
| App Store readiness | Docs | Readiness file included; native submission requires credentials/build device. |
| Android/Google Play | Docs | Release path documented for same release train. |
| longTV / TV Display Mode | Scaffold | QR remote, longTV naming, TV fallback, 720p/1080p selector in UI, `/api/tv/pairing`, `/tv-connect`. |
| AR/VR/MR | Scaffold | LIVE entry and Menu device panel prepared. |
| Personal AI level 2 | Scaffold | User Menu panel, Prisma models, `/api/agent/profile`, `/api/agent/action-log`, AI Router scaffold. |
| Boss Menu / Boss AI | Scaffold | Boss console panel, `/boss-login`, `/api/boss/policy`, policy/log guardrails. Real TOTP is not wired; checklist now fixes 2FA default to OFF and adds an explicit guided opt-in flow in Boss Menu. |
| User Security / User 2FA | Checklist | Apply the same optional Google Authenticator/TOTP model to normal users: default OFF, opt-in wizard in User Menu, recovery codes, audit, rate limiting, and independent enforcement per account across mobile/web/pro. |
| Sticker/ticker | Docs + related UI | Included in commerce/AI/checklist docs; deeper ledger integration remains backend work. |
| User Menu modernization | Implemented | New Menu sections added and styled. |
| Notifications animation | Implemented | Lightweight signal shell + shimmer, no heavy animation. |
| Event notice composer | Implemented | Impact hub added above existing form. |
| Cart/buying flow graphic | Implemented | Cart shell and checkout visual polish added. |
| Secondary controls | Implemented | Fixed dock component added in LIVE. |
| Final ZIP | Pending | Create after final build verification. |

## Latest update pass — 2026-09-01

| Area | Status | Result |
| --- | --- | --- |
| Responsive Frontend Fit | Implemented | Added production responsive override: mobile viewport baseline, no horizontal scroll guard, viewport-safe mobile sizing, laptop/tablet media queries, and video fit rules. |
| Theme Control | Implemented scaffold | Added shared tokens for `Long Aqua Glass`, `Long Red Glass X`, and `Long Pink Aura`; default is Aqua, Red/Pink remain Boss-unlocked themes. |
| Boss Theme Menu | Implemented scaffold | Boss Command Center now shows `Mở thêm chủ đề` with Aqua, Rực Rỡ, and Hồng Aura options. |
| Boss 2FA default | Corrected | Boss UI no longer says 2FA is required by default; it now states Google Authenticator/TOTP is optional until Boss completes setup. |
| User login priority | Corrected | Login screen now prioritizes face/biometric recognition before social quick login, then other methods. |
| LIVE volume controls | Corrected | Removed the floating mute/volume button from `LiveVideoPlayer`; audio control belongs to Mixer. |
| Build verification | Passed | `npm run build` completed successfully. Type/lint validation remains skipped by current Next config. |
| Final ZIP | Ready | Package updated source after this pass for browser download. |

## Version 1 update queue — added 2026-09-01

| Area | Status | Result |
| --- | --- | --- |
| Lavender theme | Checklist | Add `Long Lavender Glass` as a locked Boss-unlockable theme beside `Rực Rỡ` and `Hồng Aura`. |
| Completed event journal | Checklist | Create story-style rounded tiles for completed events; default tile shows AI flashback video only, title appears when opened. |
| AI flashback video | Checklist | Generate short event videos from selected random event images ranked by positive impression, humor, attention pull, clear subject, and spotlight quality; require user/Boss review if AI is unsure. |
| Home search composer | Checklist | Move/redesign the Home search entry into the "Bạn đang nghĩ gì?" position as profile image + `Bạn đang tìm gì vậy?`, with keyword results and optional AI-assisted search; keep it fixed/sticky at the top while only the content below scrolls. |
| Home/LIVE role split | Checklist | Move reel/live discovery into Home as a half-screen section below completed-event journal; redefine LIVE as the premium command center for starting and controlling major app workflows. |
| superBUY v1 layout | Checklist | Add Home-style search, product highlight story strip, marketplace task bars, buyer/seller inventory split, and compact product grids. |
| Single livestream QR hub | Checklist | One stable QR per livestream topic opens a dynamic hub for video/replay, child chats, products, referrals, orders, tickets, stickers, event journal, notifications, analytics, and AI summaries with permissions. |
| QR awareness and sharing | Checklist | Use `https://phuclong.xyz/l/topic/{liveTopicId}` as the canonical topic link; add scanner buttons, QR beside topic titles, expanded QR cards, Zalo/Facebook-first sharing, preview metadata, and QR conversion analytics. |
| Long EventFlash Commerce | Checklist | Add a proprietary lightweight video-flash layer for before/during/after livestream and sales status, using manual star ratings/comments to reduce AI usage while preserving optional AI summaries. |
| Long FlashFlow | Checklist | Brand the flash-video engine as `Long FlashFlow™` / `LFF-1986`; pre-live flash uses user-provided images, requires user confirmation before story-tile publishing, stays inside QR flow to avoid spam, and targets under 0.3 MB per video. |
| Long FlashFlow Player | Checklist | Build 50 FlashFlow scenarios/templates and a proprietary lightweight presentation layer `Long FlashFlow Player™` / `LFFP-1986` for story tiles, QR hub, LIVE, superBUY, post-live journal, and TV preview surfaces. |
| Native 3-language content | Checklist | Create edited Vietnamese, English, and Chinese content sets for the full Home page and related Home/QR/FlashFlow text; do not use runtime machine translation. |
| First install onboarding | Checklist | On first mobile install, ask for language, username, and email as personalization defaults only; protected app usage still requires quick login/account creation/registration. |
| Home quick tools | Checklist | Restore Home secondary actions below compact story tiles: create room, quick room entry, contribute ticket to invite artist, and browse ticketed rooms; keep reel layout unchanged. |
| FlashFlow/QR default surfaces | Checklist | Prioritize Long FlashFlow, FlashFlow Player, and TopicFlow QR for default previews across the app; legacy/live/detail flows open only after user interaction or confirmation. |
| Home main action entry | Checklist | Move/consolidate create actions, compact forms, room reels, quick joining, ticketed-room browsing, and available-room selection into Home as the main user-facing action surface. |
