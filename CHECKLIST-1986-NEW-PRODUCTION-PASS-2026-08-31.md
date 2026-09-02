# CHECKLIST 1986 — New Production Pass

Status: new checklist opened after closing the previous 460-item checklist delivery pass.

## Production Wiring

1. Connect `PersonalAgent` Prisma models to authenticated user sessions.
2. Persist user AI name, tone, avatar, memory, skills, permissions, and action logs.
3. Add real permission checks before AI actions.
4. Connect `/api/ai/router` to real ChatGPT/Gemini/DeepSeek provider secrets.
5. Add cost, quota, latency, and fallback tracking for AI Router.

## Boss Security

6. Implement real Boss login as a separate flow from normal user login.
7. Keep Google Authenticator/TOTP **OFF by default** for the Boss account; do not auto-enrol or require it until Boss explicitly enables it.
8. Add a `Bật xác thực 2 yếu tố` switch/button inside `Boss Menu > Bảo mật`.
9. When Boss chooses to enable 2FA, open a guided setup wizard and show only the current step: confirm Boss password/session → install/open Google Authenticator → scan QR or enter setup key → enter the current 6-digit code → generate/save recovery codes → final confirmation.
10. Do not activate 2FA, change the next-login requirement, or mark setup complete until every setup step succeeds and Boss presses the final confirmation button.
11. If Boss closes or cancels the wizard before completion, discard the unfinished enrolment and keep 2FA OFF.
12. After successful activation, require the Google Authenticator code from the next Boss login onward; this requirement applies only to the Boss account that enabled it.
13. Show 2FA status (`Chưa bật`, `Đang thiết lập`, `Đã bật`) and last security update time in Boss Menu.
14. Provide a protected recovery flow using recovery codes and a Boss-only action to regenerate codes or disable 2FA after re-authentication.
15. Separate Boss sessions from normal user sessions.
16. Add Boss session timeout, login-history audit, suspicious-login alerts, rate limiting, and temporary lockout after repeated invalid codes.
17. Require a valid Boss session, and 2FA verification only when 2FA is enabled, for `/api/boss/*` policy writes.
18. Add Boss policy version history UI and rollback.

## User Security

19. Apply the same optional Google Authenticator/TOTP model to normal user accounts.
20. Keep 2FA **OFF by default** for every user; do not auto-enrol, force, or block users because 2FA is not enabled.
21. Add a `Bật xác thực 2 yếu tố` switch/button inside `User Menu > Bảo mật tài khoản`.
22. When a user chooses to enable 2FA, open a guided setup wizard and show only the current step: confirm current login/session → install/open Google Authenticator → scan QR or enter setup key → enter the current 6-digit code → generate/save recovery codes → final confirmation.
23. Do not activate user 2FA until every setup step succeeds and the user presses the final confirmation button.
24. If the user closes or cancels the wizard before completion, discard the unfinished enrolment and keep user 2FA OFF.
25. After successful activation, require Google Authenticator from that user's next login onward on mobile appstore, mobile android, web/pro, and TV-linked login flows where applicable.
26. Show user 2FA status (`Chưa bật`, `Đang thiết lập`, `Đã bật`) and last security update time in User Menu.
27. Provide user recovery codes, regeneration, and disable-2FA flow after re-authentication.
28. Add user login-history audit, suspicious-login alerts, rate limiting, and temporary lockout after repeated invalid codes.
29. Ensure Boss 2FA and user 2FA are stored and enforced independently, with no shared secret, no shared recovery codes, and no cross-account activation.

## TV / longTV

30. Persist `TvPairingSession` in database.
31. Generate real QR code images for pairing.
32. Add WebSocket/WebRTC/Data Channel sync between phone and TV.
33. Build `longTV` Android TV / Google TV `.aab` after Android SDK/Gradle/release keystore are available.
34. Replace placeholder TV icon with final `long.live TV` mascot logo assets before store submission.

## Store Release

35. Generate iOS native project/build when certificates and Apple account access are available.
36. Generate Android AAB when Google Play Console credentials, Android SDK, Gradle, and release keystore are available.
37. Generate TV app package when Android TV signing/release setup is available.
38. Fill App Store privacy and review answers.
39. Fill Google Play Data Safety form.

## QA

40. Re-enable TypeScript and lint validation before final store submission if feasible.
41. Test iPhone, Android phone, Android TV/Google TV, and browser TV fallback.
42. Test 720p default and 1080p optional video settings.
43. Test notification/event push destinations end to end.
44. Test cart/ticker/sticker/order flows with real backend data.
45. Test Boss login with 2FA OFF by default, incomplete enrolment, successful enrolment, next-login challenge, invalid/expired code, recovery code, regeneration, and protected disable flow.
46. Test normal user login with 2FA OFF by default, incomplete enrolment, successful enrolment, next-login challenge across mobile/web/pro, invalid/expired code, recovery code, regeneration, and protected disable flow.

## Responsive Frontend Fit

47. Add standard mobile viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
48. Refactor page shells so the interface automatically fits the full desktop browser viewport and fills mobile screens edge-to-edge where appropriate.
49. Use CSS Flexbox or CSS Grid as the default layout system for responsive resizing instead of fixed-position/fixed-width structures.
50. Replace avoidable fixed `px` sizing with proportional units such as `%`, `vw`, `vh`, `svh`, `dvh`, `rem`, `fr`, `min()`, `max()`, and `clamp()`.
51. Add mobile media queries for screens below `768px` to handle mobile portrait, mobile landscape, safe-area insets, bottom navigation, chat overlays, LIVE fullscreen, and superBUY flows.
52. Add laptop/tablet media queries for common widths such as `768px–1366px` to keep cards, menus, headers, and action bars balanced without crowding.
53. Ensure no horizontal scroll appears on mobile, laptop, or desktop by auditing `body`, app shell, modals, fixed docks, carousels, video containers, and long text.
54. Add global overflow protection with careful rules such as `box-sizing: border-box`, `max-width: 100%`, responsive media, and safe wrapping for labels/buttons.
55. Fit video/LIVE/Vào Rạp layouts to the active viewport with no black gaps, while preserving aspect ratio and smooth scrolling/swiping.
56. Test responsive behavior on 1920×1080 desktop, 1366×768 laptop, iPhone-sized portrait, Android portrait, and fullscreen landscape modes before packaging.

## Theme Control

57. Build shared design tokens for three prepared themes: `Long Aqua Glass` as the default blue theme, `Long Red Glass X` as the locked vivid red theme, and `Long Pink Aura` as the locked pink theme.
58. Keep the user-facing theme switcher UI prepared but do not expose unlocked theme choices to normal users by default.
59. Add `Boss Menu > Giao diện > Mở thêm chủ đề` as the control center for enabling extra themes.
60. Let Boss tick/unlock additional themes, for example `Rực Rỡ` (`Long Red Glass X`) or `Hồng Aura` (`Long Pink Aura`), so users then see those themes as available "thay áo" options.
61. Store theme availability globally from Boss settings and store each user's selected theme separately.
62. Ensure users can only choose from themes currently enabled by Boss; if Boss disables a theme later, fall back users on that theme to `Long Aqua Glass`.
63. Add `Long Pink Aura` into `Boss Menu > Giao diện > Mở thêm chủ đề` as a locked theme option, with the same 8-layer X-level glass treatment and no default exposure until Boss enables it.

## Version 1 Update

64. Add a fourth prepared theme: `Long Lavender Glass`, shown as `Lavender`, with the same Boss-controlled unlock mechanism as `Rực Rỡ` and `Hồng Aura`.
65. Add `Lavender` into `Boss Menu > Giao diện > Mở thêm chủ đề`; keep it locked by default and expose it to users only after Boss enables it.
66. Define the Lavender palette as a soft premium sci-fi theme: lavender background, white glass cards, violet/lilac accents, readable graphite text, and 8-layer X-level glass polish.
67. Add an event journal surface for completed events, displayed as compact rounded story tiles similar to the attached reference.
68. Store completed-event journal entries as video-first story items, not text-first posts.
69. Generate a short AI flashback video for each completed event from randomly captured event images.
70. Select source images for AI flashback videos using ranking rules: positive impression, humor, attention pull, clear subject, event spotlight, no blurry/unsafe/private frames.
71. Show only the video tile by default in the completed-event journal; reveal the event title above the video only when the user opens/selects the tile.
72. Add event journal metadata for AI creation: selected image ids, generation prompt, created time, event id, creator/organizer id, safety status, and publish status.
73. Add Boss/User review fallback: if AI is not confident the flashback video is appropriate, send it to user or Boss for approval before publishing.
74. Confirm Home has a search entry and redesign it into a social-style search composer placed where the current "Bạn đang nghĩ gì?" entry belongs.
75. Change the Home search composer content to: user profile image + input placeholder `Bạn đang tìm gì vậy?`.
76. Implement character-key search behavior: while user types, app shows matching results by keyword/key characters across events, live rooms, products, users, stickers, notifications, and completed-event journal.
77. Add an AI search option beside/inside the search composer, similar in spirit to Google Search AI choice: user can choose normal search or AI-assisted answer/result summary.
78. Keep AI search optional and visible as a simple control, not forced; normal keyword results should still work without AI.
79. Ensure the Home search composer is responsive, does not cover feed content, and does not create horizontal scroll on mobile/laptop.
80. Add QA for completed-event journal tiles, flashback video playback, title reveal behavior, search composer layout, keyword search, and AI-search toggle on mobile, laptop, and 1920×1080 desktop.
81. Keep the Home search composer fixed/sticky at the top of the Home tab; when the user scrolls, only the content area below the search composer scrolls up/down.
82. Move the live/reel discovery feed out of the primary LIVE tab and place it in the Home tab as a half-screen section below the completed-event summary/journal.
83. Redesign Home so most of the screen is dedicated to two jobs: showing standout events and letting users chat/interact with each other in a modern, refined activity surface.
84. Keep Home as the social/event showcase: event highlights, completed-event flashback stories, live/reel preview half-screen, event-linked chat droplets, and user conversation surfaces.
85. Redefine the LIVE tab as the app's command center, not a passive reel feed: it should showcase the app's strongest capabilities and let users simply start/control nearly every major workflow from one place.
86. Make LIVE the launch/control hub for creating livestreams, opening Mixer, connecting devices, enabling AI-object interaction, creating event notices, linking products, starting commerce tasks, connecting TV/XR, and sending users into related flows.
87. Design LIVE as "technical but not dry": a premium control desk that feels powerful, simple, and superior, with clear one-tap workflows rather than heavy setup forms.
88. Redesign superBUY top area with the same search composer pattern as Home: profile/search input at top, responsive, no horizontal scroll.
89. Under the superBUY search bar, add a highlighted story/tile strip summarizing products currently being bought the most, visually similar to the Home story tiles.
90. Below the superBUY highlight strip, add task bars for marketplace operations: quick product creation, purchase management, sales management, AI commerce settings, inventory management, and order management.
91. In superBUY, make inventory management a split tab with two modes: `Quản lý hàng mua` for buyers and `Quản lý hàng bán` for sellers.
92. Keep compact product grids below the superBUY action bars, optimized for quick scanning and lightweight scrolling.
93. Add a single QR code model for each livestream topic/session, where one QR code opens the complete information hub for that livestream topic before, during, and after the live.
94. The livestream QR hub must manage and link: livestream topic, latest video state/replay, child chat rooms, related product flows, referral rewards, order status, ticket/payment state, stickers/gifts, event journal, and follow-up notifications.
95. Make the QR code resolve to the latest state of the livestream topic, so users always see the current video, products, order/referral results, or post-event journal without needing a new QR.
96. Use a stable `LiveTopicHub` route/id behind the QR code, with dynamic server state, short links, deep links into mobile app when installed, and browser fallback when not installed.
97. Add QR analytics and attribution: scan source, user/referrer, product/event context, conversion, order status, and reward settlement.
98. Add permission rules for the QR hub: public view for allowed content, owner/Boss controls for management, buyer-only order details, and user-specific referral/reward state.
99. Add AI support for QR hub summarization: AI can explain the current livestream topic, products, order status, and next action, but must respect permissions and confidence escalation rules.
100. Add QA for the new Home/LIVE/superBUY split and the single-QR livestream hub on mobile, desktop web, TV handoff, and app deep-link fallback.
101. Implement the stable livestream topic URL pattern `https://phuclong.xyz/l/topic/{liveTopicId}` inside the app as the canonical entry for QR, deep link, browser fallback, and sharing.
102. Add a visible `Scan QR` / scanner button in Home search area, LIVE command center, superBUY search area, and TV/Device connection flow so users can enter a livestream topic by scanning its QR code.
103. Place each livestream topic QR code directly beside or near the topic/title block in relevant screens: event detail, live setup preview, live room header, product-linked live hub, completed-event journal detail, and Boss management view.
104. In compact mobile layouts, show a small QR icon beside the livestream topic title; tapping it opens the full QR card with save/share/copy actions.
105. Add an expanded QR card for each topic containing the QR image, short link, topic title, current status, and primary action such as `Vào live`, `Xem replay`, `Mua hàng`, or `Xem kết quả refer`.
106. Add QR sharing actions for Zalo, Facebook, Messenger, Instagram, TikTok, copy link, save image, and native system share; prioritize Zalo and Facebook in Vietnam-facing UI.
107. Add share preview metadata for QR topic links: title, event image/AI flashback thumbnail, live status, organizer name, and clear call-to-action to increase recognition and scan/click rate.
108. Track QR awareness metrics: QR views, scans, shares by platform, app opens, browser fallback opens, live joins, product clicks, orders, referral conversions, and post-event replay views.
109. Prioritize free/open-standard technology for QR Topic Hub v1: stable web route, QR image generation, browser fallback, native share sheet, app deep links, and first-party analytics.
110. Mark paid/usage-cost dependencies clearly before implementation: hosting, database, storage, video streaming/bandwidth, AI summary, AI flashback video generation, push/SMS/email, and third-party platform APIs.
111. Integrate QR Topic Hub directly into the app so users can scan, open, share, and follow the livestream topic without needing a separate external app.
112. Create a proprietary 1986 technology layer named `Long TopicFlow QR` for the app's own branded livestream-topic management model.
113. Define `Long TopicFlow QR` as the owned product structure combining one QR code, stable topic route, dynamic state, deep link/browser fallback, commerce/referral/order linkage, child chats, event journal, analytics, and AI summaries.
114. Add product/IP documentation for `Long TopicFlow QR`: feature definition, naming, UX rules, data model, API contract, permission model, analytics events, and release notes.
115. Add visible copyright/trademark wording in app docs and release notes for Long-owned technology names, while keeping third-party/open-source notices separate and accurate.
116. Make `Long TopicFlow QR` fully automatic for users: the app creates, signs, stores, updates, and attaches the QR code to each livestream topic without asking the user to confirm or perform any QR-specific action.
117. Do not interrupt user workflows with QR setup; show the generated QR only as an available share/access tool after the topic/live/event/product flow is created.

## Long EventFlash Commerce

118. Create a proprietary 1986 technology layer named `Long EventFlash Commerce` for lightweight video-flash storytelling across the full event/live commerce lifecycle.
119. Define `Long EventFlash Commerce` as a separate but linked layer to `Long TopicFlow QR`: it produces/organizes short event flash videos before livestream, during livestream, after livestream, and around product sales status.
120. Before livestream, generate or assemble a lightweight preview flash from approved event images, topic poster, organizer avatar, featured products, schedule, and QR topic entry.
121. During livestream, collect lightweight highlight moments from user reactions, product clicks, pinned comments, sticker/gift spikes, order milestones, and organizer-selected snapshots without forcing AI generation for every moment.
122. After livestream, create a compact recap flash using selected snapshots, replay timestamps, sales highlights, top comments, product ratings, and referral/order milestones.
123. For sales status, add flash/video cards that show product status such as `Đang bán chạy`, `Sắp hết`, `Đã bán`, `Có ưu đãi`, `Đang chờ duyệt bill`, and `Đã giao hàng`.
124. Add a manual product review module to reduce AI usage: users can rate products with star buttons `1–5` and add written comments.
125. Place the product rating/comment action near product cards, order completion screens, QR topic product hub, and post-live recap.
126. Use user ratings/comments as first-party content for product credibility, product flash cards, and event recap, with moderation/report controls.
127. Let AI summarize ratings/comments only when needed, not by default, to save cost and keep the early version lightweight.
128. Add basic anti-abuse rules for ratings/comments: one rating per purchased product/order when applicable, edit window, report button, spam filter, and Boss/user moderation path.
129. Add `Long EventFlash Commerce` documentation: product name, data model, lifecycle states, video assembly rules, rating/comment rules, QR integration, cost-saving principle, and ownership/copyright notes.
130. Add QA for EventFlash before/during/after live, sales-status flash cards, star ratings, written comments, moderation, QR-linked display, and AI-cost-saving fallback behavior.
131. Brand the flash-video technology as `Long FlashFlow™`, with the technical module/code name `LFF-1986`.
132. For pre-livestream flash videos, require the user to confirm the generated flash before it is posted/published as a story tile.
133. Put the pre-livestream flash confirmation inside the QR topic flow as an implicit/hidden update step, so the app does not create spam-like repeated public posts.
134. Use user-provided images as the primary input source for pre-livestream flash videos; the app automatically assembles the flash after images are uploaded/selected.
135. Publish confirmed pre-livestream flash videos as compact story tiles/boxes tied to the livestream topic, not as repeated feed posts.
136. Optimize every generated flash file to be smaller than `0.3 MB` per video whenever technically feasible.
137. Use lightweight flash-video settings for v1: very short duration, limited frames, compressed MP4/WebM, small preview resolution, reused still-image motion, and no heavy AI generation unless needed.
138. If the flash cannot stay under `0.3 MB`, fall back to an ultra-light animated poster/story card and mark the item for later quality upgrade.
139. Build a library of 50 ready-made `Long FlashFlow™` video scenarios/templates for pre-live, during-live, post-live, product sales status, fan/community moments, and QR awareness.
140. Tag each FlashFlow scenario with use case, mood, required inputs, optional inputs, duration target, file-size target, motion style, music/sound policy, text overlay rules, and publishing destination.
141. Let the app choose an appropriate FlashFlow scenario automatically from event type, product category, user-provided images, live status, sales status, and QR topic state.
142. Allow organizer/user to preview and switch FlashFlow scenarios before confirming pre-livestream publishing.
143. Create a proprietary lightweight playback/presentation layer named `Long FlashFlow Player™` with technical module/code name `LFFP-1986`.
144. Define `Long FlashFlow Player™` as Long's own presentation technology for showing flash videos/story tiles inside Home, QR topic hub, LIVE command center, superBUY, post-live journal, and TV idle/preview surfaces.
145. Optimize FlashFlow playback for low cost and smoothness: lazy load, poster-first rendering, muted autoplay where allowed, pause offscreen, reduced motion mode, small MP4/WebM assets, and fallback animated poster.
146. Add FlashFlow Player controls: tap to open, hold to pause, swipe between story tiles, progress ring/bar, mute state, share QR/topic, and open related product/live/order.
147. Add FlashFlow Player analytics: impressions, opens, completion rate, replays, shares, QR scans, product clicks, comments, ratings, and order conversions.
148. Document `Long FlashFlow™` and `Long FlashFlow Player™` as separate but connected proprietary technologies, including naming, module boundaries, UX rules, performance rules, data model, and copyright notices.

## Native 3-Language Content Pack

149. Create native Vietnamese, English, and Chinese content versions for the full Home page, not runtime machine translation.
150. Apply the same native 3-language content rule to Home search composer, event highlight tiles, completed-event journal tiles, FlashFlow reel captions, QR topic labels, share CTAs, AI-search choice, and empty/loading/error states.
151. Keep Vietnamese as the source market voice, English as the international product voice, and Chinese as a separately edited market voice; do not rely on direct literal translation where UX wording needs to feel natural.
152. Add i18n keys for all visible text in the Home page before code implementation, with stable keys that can also be reused by mobile iOS, mobile Android, Long ProTivi web/desktop, and longTV.
153. For the Home search composer, define native copy as: Vietnamese `Bạn đang tìm gì vậy?`, English `What are you looking for?`, Chinese `你想找什么？`.
154. For the optional AI-search choice, define native copy as: Vietnamese `Tìm với AI`, English `Search with AI`, Chinese `用 AI 搜索`.
155. For QR topic actions, define native copy for: scan QR, open topic, share QR, save QR, copy link, join live, watch replay, buy product, view referral result, and open latest update.
156. For FlashFlow reels, define native copy for: created by Long FlashFlow, preview before live, live highlight, post-live recap, product spotlight, waiting for approval, and approved to publish.
157. Add QA that checks Vietnamese, English, and Chinese text on mobile portrait, mobile landscape/fullscreen, laptop 1366×768, desktop 1920×1080, and TV fullscreen without clipping, overlap, dark blocked text, or horizontal scroll.
158. Update version naming so the next Ver1 package includes three language builds/content sets: `vi-VN`, `en-US`, and `zh-CN`.

## First Install Onboarding

159. After a user installs and opens the mobile app for the first time, show a lightweight onboarding flow before the main app surface.
160. First onboarding step: language selection with native options for Vietnamese, English, and Chinese; store the selected language as the user's default app language.
161. Second onboarding step: create a display username for personalization across Home, chat droplets, live topics, superBUY, sticker inventory, and AI assistant surfaces.
162. Third onboarding step: ask for email to save default preferences, restore personalization, and support continuity across devices.
163. Clearly explain that language, username, and email collected in onboarding are for user optimization/personalization only.
164. Do not treat onboarding language/username/email as full account registration or authentication for protected actions.
165. Keep quick login, user creation, registration, and other authentication methods required for deeper app usage such as purchases, seller tools, AI commerce tasks, Boss/user security, inventory, and paid services.
166. If the user skips onboarding email, allow app entry but keep a gentle reminder in User Menu to add email later for sync and recovery.
167. Store onboarding preferences per user/device and sync them to the account after the user completes quick login or registration.
168. Add QA for first install onboarding on iOS, Android, and web/PWA fallback: language selection, username validation, email format, skip path, saved defaults, and later account-link behavior.

## Home Quick Tools and Default FlashFlow Display

169. Restore/add the Home secondary quick-tool bar under the compact story/event tiles and above the reel discovery section.
170. Include Home quick-tool actions: `Tạo phòng room`, `Vào phòng nhanh`, `Góp vé mời nghệ sỹ`, and `Duyệt phòng có vé`.
171. `Tạo phòng room` opens a compact sheet for room details and then creates the room/topic with automatic QR and FlashFlow defaults.
172. `Vào phòng nhanh` sends the user to a random high-view room that does not require a ticket, with lightweight safety/ranking filters.
173. `Góp vé mời nghệ sỹ` opens a contribution flow tied to a topic/artist/event, using sticker points and QR topic attribution where relevant.
174. `Duyệt phòng có vé` opens a ticketed-room browser with status, price/sticker points, capacity, schedule, and AI/Boss review flags when needed.
175. Layout the Home quick-tool bar as one or two rows depending on screen width; keep one priority action larger than the other actions in the same row.
176. Recommended Home priority action: make `Tạo phòng room` the larger primary button, because it starts a user-owned interaction flow.
177. Reduce the size/height of the compact story/event tiles on Home so the quick-tool bar and reel discovery section fit without crowding.
178. Keep the current Home reel discovery layout direction, because the latest mockup matches the intended structure.
179. Across the full app, prioritize proprietary `Long FlashFlow™`, `Long FlashFlow Player™`, and `Long TopicFlow QR` for default visual surfaces and default topic/reel/event/product previews.
180. Use real livestream video, replay, product detail, chat room, ticket/payment flow, or legacy/manual flow only after the user taps, opens, confirms, or chooses that deeper interaction.
181. For default display states, if real event video is unavailable or not confirmed, automatically show FlashFlow generated from available topic-related images/content.
182. Ensure QR/FlashFlow default displays are lightweight, non-blocking, and do not interrupt user action; QR is auto-created and FlashFlow is auto-prepared, with confirmation only when publishing is required.
183. Add QA for Home quick tools, compact tile sizing, priority button layout, reel placement, QR/FlashFlow defaults, and old-flow handoff after user interaction.

## Home as Main Action Entry

184. Move/consolidate all user-facing action entry points for creating tasks, opening forms, browsing room reels, and selecting available rooms into the Home screen.
185. Home must contain the primary access for room creation, event creation, quick room entry, ticketed-room browsing, room discovery reels, available room selection, and related lightweight setup forms.
186. When a Home action needs more detail, open a compact bottom sheet or modal form directly from Home, then route the user to the relevant deeper surface only after confirmation.
187. Keep LIVE as the deeper technical/control surface for mixer, device setup, live preview, stream launch, TV/XR connection, AI object lock, and live operations after a room/live flow has been selected or created.
188. Do not duplicate primary room discovery between Home and LIVE; room reels and available-room browsing belong to Home by default.
189. Keep superBUY focused on commerce/product discovery and purchase/seller management, but allow Home topic/room cards to deep-link into related superBUY product flows.
190. Redesign the Home information hierarchy after consolidation: sticky search at top, compact story/event tiles, Home quick action rows, room/reel discovery, available-room list, then social chat/activity.
191. Add QA that verifies all room creation, form entry, quick room joining, ticketed-room browsing, reel browsing, and available-room selection can be started from Home without requiring users to hunt through LIVE.

## Home-to-LIVE Room Creation Flow

192. When the user taps `Tạo phòng nhanh` or `Tạo phòng room` on Home, open a compact form based on the app's standard room/event conventions.
193. The Home room form should collect only required setup fields first: topic/title, room type, ticket/no-ticket mode, schedule/start-now intent, visibility, optional products, and optional FlashFlow images.
194. After the user confirms the Home form, route the user to the LIVE tab for Mixer/device setup instead of creating/opening the room immediately.
195. The room/live topic remains in draft/pre-live state after the Home form; it must not become an active room until the user taps `Bắt đầu live`.
196. In the LIVE tab, show the draft room/topic context at the top of the Mixer workspace so the user knows which room they are preparing.
197. Let the user configure Mixer, devices, camera/source, audio, AI object lock, QR topic, TV/XR, and FlashFlow preview before the room opens.
198. Save the user's Mixer setup if they complete or explicitly save setup; reuse the latest saved Mixer for future sessions.
199. If the user does not configure Mixer and leaves the flow, keep the draft safely paused and let them continue using the app normally.
200. When the user returns to LIVE, show a lightweight `Tiếp tục chuẩn bị phòng` entry if a draft room/live topic is waiting.
201. Only when the user taps `Bắt đầu live` should the app create/open the active live room, attach the already-generated TopicFlow QR, and publish confirmed FlashFlow previews.
202. Move all owner/live-room configuration buttons that currently appear inside the live room into the LIVE tab's external Mixer/control desk.
203. Keep the active live room clean for viewing, interaction, chat, purchase, stickers, and fullscreen experience; owner setup controls should live outside in Mixer unless urgently needed.
204. Redesign the LIVE tab as a flexible live workspace/window that supports quick tab switching, minimize, maximize, hide, and resume states.
205. Add a YouTube-style mini-player/playing mode for LIVE so users can keep a live session preparing/playing while navigating Home, superBUY, Notifications, Menu, or external app tasks where supported.
206. The LIVE mini-player should show only essentials: live/draft status, topic title, tiny preview/poster, audio state, return-to-LIVE action, and stop/end action with confirmation.
207. When minimized, LIVE must not cover critical buttons, search bars, bottom navigation, QR actions, payment actions, or chat inputs.
208. Add flexible window states for LIVE: full workspace, compact floating panel, bottom mini-player, hidden-but-playing/background status, and fullscreen live mode.
209. Add QA for Home form to LIVE handoff, draft room state, no premature room creation, Mixer save/reuse, leaving without setup, returning to draft, start-live activation, config controls moved outside room, and LIVE mini-player behavior across tabs.

## AI Communication, Boss Approval, and Growth Suggestions

210. Merge `AI Developer/External` and `AI Flash` into one unified agent class named `AI Flash Developer(TM)`.
211. Define `AI Flash Developer(TM)` as the shared agent for broadcast quality, Flash operating rules, external app/API discovery, developer integration drafts, QR/FlashFlow support, and low-cost optimization suggestions.
212. Keep `AI Flash Developer(TM)` separate from `AI Thuong Mai`; commercial payment, bill review, inventory release, ticket checking, and seller/buyer trade execution remain under the AI commerce permission group.
213. Standardize AI communication into three execution channels: `Auto Safe`, `Report Only`, and `Boss Confirm`.
214. `Auto Safe` means the AI may run without user/Boss confirmation only when the task has no user cost, no external data sharing, no account change, no payment/inventory effect, no public publishing, and no user-visible interruption.
215. `Report Only` means the AI may analyze, compare, draft, score, detect errors, and write a short report into Boss mail plus Boss Notifications, but must not change production state.
216. `Boss Confirm` means the AI must create a structured approval card for Boss and wait for Boss click confirmation before applying any change that affects policy, fees, provider activation, user data, external integration, public content, payment, inventory, QR rules, or Flash/quality defaults.
217. Add a Boss control setting named `AI Work Mode` with options: `Auto Safe only`, `Report Only`, and `Require Boss Confirm for all changes`; default to `Auto Safe only`.
218. Add a Boss notification inbox category named `AI Bao cao he thong` for reports from AI Flash Developer(TM), AI Boss, AI Commerce, AI Room, and future app/external agents.
219. Send Boss email only for higher-value reports or required approvals; lightweight routine reports should stay in Boss Notifications to avoid noise.
220. Every AI report must include: agent name, reason, affected area, recommended action, expected benefit, risk level, cost impact, data touched, whether external apps/APIs are involved, and required decision.
221. Every Boss approval card must include buttons: `Approve`, `Reject`, `Ask AI to revise`, and `Apply once only`; for recurring policies add `Apply as rule` after Boss review.
222. Add an AI command envelope for all AI-to-app actions with fields: `agentId`, `agentClass`, `taskType`, `scope`, `targetId`, `riskLevel`, `costEstimate`, `dataClass`, `requiresBossConfirm`, `requiresUserConfirm`, `expiresAt`, `signature`, and `auditId`.
223. Reject any AI command that is missing scope, exceeds allowed budget, touches data outside the granted scope, uses an unapproved external provider, or attempts to bypass user/Boss confirmation.
224. Log every AI command, report, approval, rejection, revision request, and auto-safe action into Boss audit logs.
225. Add a daily Boss digest summarizing AI work completed, AI work waiting for confirmation, AI suggestions rejected, cost saved, external apps found, and app areas needing attention.
226. When AI is idle and has no user command, allow it to perform only background improvement work: UI/graphic QA, FlashFlow size checks, QR fallback checks, device-quality scoring, provider cost comparison, sticker quality suggestions, commerce fraud-pattern review, and developer documentation drafts.
227. Idle AI must not contact users directly, alter user accounts, spend sticker points, publish content, release goods, approve bills, change livestream state, or activate external integrations unless a prior Boss rule explicitly permits that exact action.
228. Add an AI suggestion system that recommends app usage to users across a wider scope based on declared interests, age band where available and permitted, language, previous app interactions, followed users, joined topics, product interests, and room/live behavior.
229. AI suggestions to users must focus on expanding meaningful app usage: join relevant rooms, create a room, follow users, scan topic QR, watch FlashFlow recaps, try superBUY, set up seller tools, use AI commerce, save events, or connect TV/ProTivi when useful.
230. AI user suggestions must be explainable in short native copy: why this is suggested, what action it opens, whether it costs sticker points, and how to hide similar suggestions.
231. Do not infer or expose sensitive categories for personalization; use broad interest clusters and user-controlled preferences instead.
232. Add user controls for recommendation personalization: turn suggestions on/off, reduce topic, hide user/product/room, reset interests, and choose whether AI suggestions may use age band.
233. Add Boss controls for AI suggestion policy: enable/disable suggestion classes, set safe categories, set daily suggestion limits, set protected age rules, and view performance logs.
234. Add analytics for AI suggestions: impression, click, dismiss, follow, room join, QR scan, purchase intent, seller setup start, and retention impact.
235. Add QA for the AI communication standard: auto-safe actions do not mutate risky state, report-only actions create Boss mail/notification entries, Boss-confirm actions cannot execute before click approval, and user suggestions respect privacy and display limits.

## AI Flash Event QR Mail and Notification Flow

236. Let `AI Flash Developer(TM)` prepare and send event-related email plus in-app notifications through the `Long TopicFlow QR` / event QR flow when a user has joined, scanned, followed, purchased, contributed, commented, or otherwise opted into that event/topic context.
237. Define the event QR notification audience from QR/topic state, including organizer, co-hosts, scanned users, followed users who joined the topic, ticket buyers, product buyers, contributors, referral participants, and users who explicitly saved the event.
238. Add Boss-level controls for AI Flash event messaging: enable/disable email, enable/disable in-app notifications, set audience classes, set quiet hours, set per-event frequency limits, and require approval for promotional or public-facing messages.
239. `AI Flash Developer(TM)` may auto-send operational event messages without Boss confirmation only when the message is low-risk, non-promotional, scoped to users already connected to the QR event, and does not change payment, inventory, ticket, policy, or user account state.
240. Operational auto-send examples: event starting soon, live started, replay available, ticket reminder, QR topic updated, product/order status visible in topic hub, FlashFlow recap ready for review, and room moved/resumed.
241. Promotional, sales-policy, pricing, campaign, mass audience, cross-platform share, or external app messages must create a Boss approval card before sending.
242. Every AI Flash event message must be generated from a structured template with native Vietnamese, English, and Chinese copy fields, short title, body, CTA, target route, QR/topic ID, reason, and unsubscribe/mute handling where applicable.
243. Email and notification delivery must share one message record so the Boss can see whether the same event update was delivered by app notification, email, QR topic hub, or later social share.
244. Add a per-user event notification preference: receive all updates, important only, mute this event, mute this organizer, and unsubscribe from event email while keeping in-app notifications where allowed.
245. If a user scans an event QR but has no app installed, route them to the correct install/download flow for their OS, then after login/quick setup attach them to the latest QR event state and ask for notification preference.
246. Add AI Flash delivery safeguards: deduplicate messages, avoid repeated sends for the same QR event state, rate-limit per event and per user, skip users who muted the event, and escalate ambiguous audiences to Boss approval.
247. Log all AI Flash event emails and notifications with audience size, send time, delivery channel, template version, Boss approval status, cost, QR/topic ID, and follow-up engagement.
248. Add QA for the event QR mail/notification flow: scan-to-follow, event opt-in, auto operational notice, Boss-confirm promotional notice, mute/unmute, reinstall/login recovery, delivery dedupe, and Boss log visibility.

## 1986 - Human / Long Lab Virtual Operating Objects

249. Add `1986 - Human` as the long-term research and product direction for Long Lab, focused on Real Presence Level 2, safe human-like visual output, consent, QR traceability, and controlled lab-to-product rollout.
250. Define virtual object 1: `FlashFlow Image Operating System`. This is the image operating layer for visuals born from real images, predicted visual states, structured image commands, and self-improving image instructions that imitate a disciplined human-like production workflow.
251. `FlashFlow Image Operating System` must not be described as AI creating every frame or every pixel. Its role is to coordinate source media, prediction models, device capability, rendering rules, compression, enhancement, and delivery instructions.
252. `FlashFlow Image Operating System` must treat images/video as structured objects with source, layer, mask, motion, color, typography, quality target, risk flag, device profile, and QR trace metadata.
253. `FlashFlow Image Operating System` becomes the internal operating layer for FlashFlow output, event recaps, waiting videos, live previews, product covers, TiviApp idle screens, Real Presence Lab previews, and future human-preview outputs.
254. Define virtual object 2: `QR-Growth Generative AI`. This is the AI-like user companion/persona generated from the user's growth QR identity, profile permissions, behavior signals, selected style, and user-approved personalization.
255. `QR-Growth Generative AI` must be framed as a personalized AI companion and interface object, not as an unrestricted human impersonation system.
256. Each `QR-Growth Generative AI` must have its own QR identity, owner history, permission scope, personality profile, visual style, interaction log, transfer/ownership rules, and revocation path.
257. The user's QR growth code becomes the seed for AI personalization: language, username, profile, interests, followed topics, allowed integrations, app usage, store-safe preferences, and user-controlled privacy settings.
258. If ownership transfer is supported later, AI ownership transfer must require both current-owner consent and receiving-owner acceptance, with Boss policy override only for safety, abuse, fraud, or account recovery.
259. Add `Long Lab` as the operating home for these two virtual objects: FlashFlow Image Operating System handles visual operation; QR-Growth Generative AI handles user/persona growth, commands, and ecosystem connection.
260. AI Boss governs Long Lab policy, safety, permissions, release stage, cost rules, and escalation. AI Flash governs visual quality, FlashFlow operation, device adaptation, and output readiness.
261. The two virtual objects must be visible in WebPro/Long Studio as major technology pillars, while MobiApp shows only simplified store-ready names such as `Tối ưu hiển thị` and `AI cá nhân`.
262. All user-facing text must remain app-store-safe: no claims of guaranteed real-human creation, no deception, no unmanaged identity cloning, no hidden automation, and no payment or sensitive decision without the required confirmation rule.
263. Add QR trace and risk review to every human-like visual output: source consent, output ID, QR Flow ID, watermark status, risk class, reviewer status, and takedown/revocation ability.
264. Long Lab must keep `1986 - Human` in research/controlled-preview mode until consent, moderation, watermarking, fraud prevention, and store policy review are complete.
265. Add QA for Long Lab pillars: virtual objects appear in WebPro, mobile uses simplified wording, QR identity exists per AI/persona, visual outputs carry trace metadata, and unsafe human-like output is blocked or escalated.

## 1986 - Human Brain Trigger v0.1

266. Promote the two Long Lab virtual objects into the central “brain” layer for the project's upgrade language: `FlashFlow Image Operating System` and `QR-Growth Generative AI`.
267. Define core upgrade keywords for the first trigger set: `nâng cấp`, `tại sao`, `muốn`, `có`, `được`, `phải`, plus normalized Vietnamese text without accents for robust matching.
268. Whenever app commands, Boss notes, user intent, AI reports, checklist items, QR topic notes, or Long Lab logs contain the core upgrade keywords, both brain objects must receive a `learn-and-upgrade-proposal` signal.
269. Brain keyword triggers must create learning/proposal tasks, not uncontrolled production changes. Any change touching policy, cost, user data, identity, public output, or provider activation still requires the existing Boss/user confirmation rule.
270. Add `LONG_LAB_BRAIN_VERSION = 1986-human-v0.1` as the first measurable version for keyword-triggered learning and upgrade logic.
271. Add the first FlashFlow OS manifest: `flashflow-image-os-1986-human-v0.1`, with visual object schema for source, layers, commands, risk flags, device profile, quality target, and QR trace metadata.
272. Add the first QR-Growth AI manifest: `qr-growth-generative-ai-1986-human-v0.1`, with QR seed, owner history, persona profile, visual style, permission scope, and revocation path.
273. Use iOS/iPhone as a design reference only for first-version clarity: calm hierarchy, glass layers, rounded controls, strong privacy framing, and responsive touch-first interaction; do not copy Apple assets, icons, proprietary UI, or protected trade dress.
274. Add the first QR-Growth AI visual milestone asset at `/long-lab/qr-growth-ai-v01.svg` so future versions can compare visual evolution, output quality, identity trace, and style consistency.
275. Add QA for the brain trigger layer: keyword detection with accented and non-accented Vietnamese, both brain objects receive the same signal, risky changes remain blocked, v0.1 manifests load, and the first QR-Growth AI image renders without external assets.

## FlashFlow OS Open Core Governance

276. Revise `FlashFlow Image Operating System` as an open-source-style operating core inside Long Lab, designed for transparent improvement, versioned proposals, and controlled Boss-approved releases.
277. Allow every AI present in the app ecosystem to send structured edit/improvement signals into FlashFlow OS, including AI Boss, AI Flash, AI Commerce, AI User, AI Room/Live, AI QR/TopicFlow, AI Moderation/Identity Guard, and future approved AI agents.
278. AI edit signals must include agent name, target module, problem observed, proposed change, expected visual/quality/cost benefit, risk level, data touched, external tool use, rollback path, and test evidence where available.
279. AI Flash is the technical aggregator for FlashFlow OS: it receives all AI signals, deduplicates them, scores quality/cost/risk, merges compatible proposals, rejects unsafe proposals, and forms the best candidate upgrade package.
280. AI Flash may technically approve a candidate upgrade package only as a proposal package; it must not publish production FlashFlow OS changes without Boss approval.
281. Create a weekly FlashFlow OS upgrade review cycle at `Sunday 08:00 GMT`.
282. Each weekly review must send Boss one concise upgrade card containing: version candidate, top changes, before/after quality expectation, cost impact, store-policy impact, affected app surfaces, rollback plan, and AI agents that contributed.
283. Boss can approve, reject, ask AI Flash to revise, approve selected items, or defer the weekly FlashFlow OS upgrade package.
284. Approved weekly upgrades become the next versioned FlashFlow OS release and must be logged with version number, approval time, Boss decision, changed modules, and QA checklist.
285. Rejected or deferred signals remain in the research queue unless Boss deletes them or AI Flash marks them obsolete.
286. Add QA for FlashFlow OS open-core governance: all AI agents can submit signals, AI Flash aggregates without mutating production, Sunday 08:00 GMT review is created, Boss approval is required, selected approval works, and rollback metadata is present.

## FlashFlow Runtime Autonomy and Store-Ready Upgrade Boundary

287. Revise FlashFlow OS upgrade governance from weekly Boss approval to runtime autonomy inside a preapproved safe boundary, with Boss true performing ownership-level review once every 3 months.
288. FlashFlow OS and QR-Growth Generative AI may self-upgrade in the runtime environment without immediate Boss approval only for recipe/config/preset/model-policy changes that stay inside the stable mobile runtime capability boundary.
289. Runtime self-upgrades must not change native mobile code, app-store-visible capability, OS permissions, payment policy, privacy boundary, authentication/security rule, identity-sensitive output, public publishing rule, or external provider cost policy.
290. AI Flash receives signals from all lower AI groups and runtime telemetry, then deduplicates, scores, simulates, risk-checks, and technically approves safe runtime recipe upgrades.
291. AI Flash may also propose and approve its own safe runtime improvements when no lower AI signal exists, provided the change is reversible, logged, zero-cost or within approved zero-cost policy, and inside the safe boundary.
292. Every runtime upgrade must produce a versioned recipe/config record with source signals, before/after expectation, affected surfaces, rollback path, risk score, cost estimate, and AI Flash approval signature.
293. Boss true receives a quarterly FlashFlow/QR-Growth upgrade package every 3 months with all runtime changes, rejected signals, quality gains, cost impact, store-policy impact, and next recommended direction.
294. Boss true remains the owner and final authority over FlashFlow OS, QR-Growth DNA QR, AI Flash orchestration, runtime recipes, visual command schema, trace metadata, and Long Lab operating workflow.
295. Redefine QR-Growth Generative AI identity seed as `Long User Growth DNA QR`: the QR is designed like a digital DNA growth code for AI personalization, but it is not biological data and not a legal identity replacement.
296. Build the full FlashFlow OS operating process as owned Long technology: source intake, object schema, command plan, device profile, recipe execution, QR trace, visual QA, runtime learning, AI Flash approval, rollback, and quarterly Boss review.
297. Build the full QR-Growth Generative AI creation process as owned Long technology: user quick setup, QR DNA seed, permission scope, persona profile, visual style, AI companion state, owner history, transfer/revocation path, and store-safe presentation.
298. Standardize code for mobile store approval: keep runtime stable, distribute frequent improvements through server-side recipes/configs, avoid hidden automation, keep Device Assist opt-in, keep sensitive lab features gated, and use cautious AI-support wording.
299. Add QA for runtime autonomy: safe recipe can update without store release, unsafe native/payment/privacy change is blocked, AI Flash logs approval, rollback works, quarterly Boss package is generated, and mobile review wording remains compliant.

## Pixel QA and FlashFlow Living Skin Pass

300. Apply `FlashFlow Living Skin` as the first visible runtime recipe for WebPro/webapp: continuous soft color shift, glass sheen, breathing light field, and reduced-motion fallback.
301. `FlashFlow Living Skin` must be CSS/recipe-first, not heavy video-first, so it improves the app's living visual identity without increasing app size or store risk.
302. Add global no-horizontal-scroll safeguards: `overflow-x` protection, `min-width: 0` for layout children, responsive card grids, and safe mobile media sizing.
303. Replace remaining low-contrast Boss note text that can become unreadable on light surfaces.
304. Re-add visible `Long Studio Apps` to the user/Boss dashboard so WebPro exposes the app children instead of hiding the technology in docs only.
305. Add visible first milestone image for `QR-Growth Generative AI v0.1` inside Long Studio.
306. Expand FlashFlow OS v0.1 manifest with Living Skin recipe, visual layers, commands, runtime version, recipe version, compatibility targets, and quality metrics.
307. Expand QR-Growth Generative AI v0.1 manifest with iOS surface checklist, human-like trait model, persona version, visual version, DNA QR version, and safety metrics.
308. Keep the iOS/iPhone reference as design principles only: clarity, safe area, touch-first controls, privacy-first flows, and calm glass hierarchy; no copied Apple proprietary UI.
309. Add mobile store QA: AI wording, Device Assist opt-in, 2FA default-off, sensitive lab gating, no hidden background processing, no native capability change through runtime recipe, and no misleading 4K/native-human claims.
310. Add visual QA scope for the next build: Home, superBUY, LIVE, Menu, Boss Console, Long Studio Apps, Login, Notifications, TiviApp fullscreen, and ProApp 1920x1080.
