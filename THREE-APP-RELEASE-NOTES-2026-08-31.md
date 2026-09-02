# 1986 / Long Release Notes - 3 App Sources

This source package is prepared as a clean GitHub upload for three execution branches:

1. Mobile AppStore source
2. Mobile Android source
3. longTV Android TV source

## Source Map

| Version | Main source | Build notes |
| --- | --- | --- |
| Mobile AppStore | `app/`, `components/`, `lib/`, `public/`, `capacitor.config.ts` | Add/sync iOS with Capacitor when preparing App Store build. |
| Mobile Android | `android/` plus shared web source | Run web build, then Capacitor sync/open Android. |
| longTV | `android-tv/longTV` plus TV pairing routes in `app/tv-connect` and `app/api/tv` | Android TV shell/source is included for the TV app branch. |
| Long ProTivi Web/Desktop | `/`, `/protivi`, `desktop/long-protivi` | Included because it is the headquarter branch and controls linked behavior. |

## Applied UI Fixes

- Light sci-fi theme is the only visible theme for users in this stage.
- Dark/black theme tokens can stay as internal reserve, but theme switching is not exposed.
- Notification cards use bright glass surfaces with readable text.
- Chatbot panel uses bright header, readable message area and readable input.
- Floating live volume controls outside Mixer have been removed.
- AI mascot no longer carries a separate vertical volume slider.
- In `Vào Rạp`, mascot AI appears only in fullscreen.
- In `Vào Rạp`, chat appears only in fullscreen and uses a horizontal bar layout.
- Login modal prioritizes quick login.
- `/login` prioritizes social quick login and keeps biometric as a fast device login path.

## Mobile Checklist To Apply Across AppStore And Android

- Keep two background systems in the design architecture, but expose only the bright theme to users.
- Do not show theme switching until Boss approves user-facing theme control.
- Mobile login order: face recognition first, social quick login second, manual login methods last.
- If face recognition is unavailable, fall back to fingerprint/platform biometric, then social login.
- Social quick login group: Google/YouTube, Facebook, TikTok, Zalo as providers become available.
- Menu should become a minimal sci-fi light command list.
- Menu groups: Account, My AI, Wallet/Points/Stickers, Livestream/Mixer, Shop/Orders, Devices, Settings, Help.
- Each menu group should show one main line and one compact state line.
- Sticker vault should be simplified into three tabs: Owned, Store, Point History.
- Sticker vault first screen should show point balance, frequently used stickers, newly received stickers and add-points action.
- Avoid black panels, hidden text, clipped input, overlapping buttons and controls near safe areas.
- QA mobile portrait, mobile landscape fullscreen, AppStore build and Android build before release.

## TV Checklist

- longTV app uses the TV branch identity: `long.live TV`.
- TV app keeps mascot identity in the logo system.
- TV interaction should prefer QR pairing and phone remote control.
- TV screen should avoid dense mobile UI and prioritize display mode, live output, pairing state and lightweight controls.
- Default output quality remains 720p for cost and smoothness; 1080p is optional, not default.

## Build Verification

- `npm run build` completed successfully after these changes.
- GitHub upload should exclude `node_modules`, `.next`, generated release files and local cache.
