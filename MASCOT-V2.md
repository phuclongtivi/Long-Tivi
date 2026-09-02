# Mascot v2 - Project 1986

Date: 2026-08-30

Mascot v2 updates AI Phuc from the older placeholder visual style into a lighter sci-fi assistant that fits Graphic Optimization v2.

## New Assets

- `public/ai-mascot-full-v2.png`
- `public/ai-mascot-full-v2.webp`
- `public/ai-mascot-round-v2.png`
- `public/ai-mascot-round-v2.webp`
- `public/stickers/phuc-chatbot-avatar-v2.png`
- `public/stickers/phuc-chatbot-avatar-v2.webp`
- `public/stickers/phuc-chatbot-logo-v2.png`
- `public/stickers/phuc-chatbot-logo-v2.webp`

## Applied In Code

- `components/event/ai-companion.ts` now points the default full and round mascot to v2 WebP assets.
- `components/event/media.ts` now points chatbot avatar/logo constants to v2 WebP assets.
- `components/event/media.ts` maps old mascot URLs to v2 URLs through `optimizeAssetUrl()`.
- `components/event/PhucChatbotAvatar.tsx` uses the shared v2 logo/avatar constants.

## Compatibility

The original mascot files remain in `public/` as fallback assets. Existing references will keep working while new shared entry points use Mascot v2.
