# App Store Readiness - Project 1986

Date: 2026-08-30

This file tracks the iOS submission work needed before publishing Long / Phuc Long Center to the Apple App Store.

## Current Status

- The web app builds with Next.js.
- Capacitor config exists in `capacitor.config.ts`.
- Native `ios/` project is not included in this source package yet.
- `next.config.js` still allows TypeScript and ESLint errors during build. This is acceptable for fast iteration, but should be removed before final App Store submission.
- The app includes livestream, chat, AI moderation, camera/microphone, gifts, store, tickets, user-generated content, and notification flows. These need careful Apple review preparation.

## Recommended Packaging Path

Use Capacitor with a production web URL first, then move toward static export only if every dynamic route and API dependency is redesigned for native/offline packaging.

Recommended app path:

1. Deploy the Next.js app to production.
2. Set `server.url` in `capacitor.config.ts` to the production HTTPS URL.
3. Generate the iOS project with Capacitor.
4. Add iOS permission strings in Xcode.
5. Test on a real iPhone with camera, microphone, notifications, login, livestream, chat, and payment/gift flows.
6. Submit after privacy policy, terms, report/block, and payment policy review are complete.

## iOS Permission Strings Needed

Add these to `ios/App/App/Info.plist` after creating the native iOS project:

| Permission | Suggested text |
| --- | --- |
| `NSCameraUsageDescription` | Long uses the camera so you can host livestreams, scan visual content, and interact with items on screen. |
| `NSMicrophoneUsageDescription` | Long uses the microphone so you can speak during livestreams and use voice features. |
| `NSPhotoLibraryUsageDescription` | Long can access your photo library when you choose images or media to share. |
| `NSPhotoLibraryAddUsageDescription` | Long can save media that you choose to download or export. |
| `NSLocationWhenInUseUsageDescription` | Long uses location only when you choose to show viewer maps or delivery/location features. |
| `NSUserTrackingUsageDescription` | Long requests tracking permission only if advertising or cross-app tracking is enabled. Keep this disabled unless truly required. |

## Privacy Policy Requirements

The privacy policy should clearly explain:

- Account data collected during login.
- Camera and microphone usage for livestreams.
- Location usage for viewer maps and delivery/location features.
- Chat, livestream, event notice, gift, ticket, and store data.
- AI processing through OpenAI, Gemini, and DeepSeek where enabled.
- User-generated content moderation, reporting, blocking, and escalation.
- Payment, point, ticket, gift, and order handling.
- Data deletion/contact process.

## Terms Of Use Requirements

Terms should cover:

- User-generated content rules.
- Livestream conduct.
- AI assistant limitations.
- Ticket, gift, sticker, point, and store purchase rules.
- Refund and cancellation rules.
- Report/block/enforcement process.
- Age and account requirements.

## Apple Review Risk Areas

| Area | Risk | Required preparation |
| --- | --- | --- |
| Livestream + chat | UGC policy | Report, block, moderation, enforcement notes, and reviewer demo account. |
| AI moderation | Explainability | State that AI assists moderation, with human/admin escalation. |
| Gifts/stickers/points | In-App Purchase risk | If digital-only value is consumed in-app, review Apple IAP rules before submission. |
| Tickets | Payment classification | Clarify whether tickets are real-world events/services or digital access. |
| External stores | Store policy risk | Avoid bypassing Apple IAP for digital goods. |
| Camera/mic/location | Privacy | Use only after explicit user action and explain purpose. |

## Required User Safety Features

Before App Store submission, verify that the app has:

- Report user/content in livestream and chat.
- Block user from chat/live interactions.
- Admin moderation queue.
- AI moderation logs for livestream/chat.
- Clear way for users to contact support.
- Terms and privacy links visible before or during onboarding.

## Final Submission Checklist

- [ ] Production URL is stable and HTTPS.
- [ ] Capacitor iOS project generated and opens in Xcode.
- [ ] iOS permission strings added.
- [ ] Push notification entitlement configured if used.
- [ ] App icons and launch screen verified.
- [ ] `ignoreBuildErrors` removed or tracked with zero high-risk errors.
- [ ] `ignoreDuringBuilds` removed or lint issues reviewed.
- [ ] Privacy Policy URL ready.
- [ ] Terms of Use URL ready.
- [ ] Demo account prepared for Apple reviewer.
- [ ] Report/block/moderation flows tested.
- [ ] Payment/IAP risk reviewed.
- [ ] Tested on real iPhone, including iPhone 15 Pro Max layout.
