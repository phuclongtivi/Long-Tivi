/**
 * Điểm nối module Long App — checkpoint 2026-08-27 11:24
 */
export * from "./roles";
export * from "./types";
export * from "./shop-types";
export * from "./livestream-product";
export * from "./cart-order";
export * from "./gifting";
export * from "./points";
export * from "./gift-unlock";
export * from "./rewards-spend";
export * from "./live-sticker-overlay";
export * from "./live-tap-vision";
export { LiveTapChatOverlay } from "./LiveTapChatOverlay";
export * from "./wire-app";
export * from "./pay-ship";
export * from "./sticker-pay";
export * from "./auto-rank";
export * from "./live-room-cost";
export * from "./organizer-points";
export { StickerBuyReturn } from "./StickerBuyReturn";
export * from "./follow";
export * from "./notify-from-feed";
export { FollowButton, UsernameWithFollow } from "./FollowButton";
export { NotifyInbox } from "./NotifyInbox";
export type { NotifyItem } from "./NotifyInbox";
export { MenuTabAvatar } from "./MenuTabAvatar";
export * from "./user-identity";
export * from "./ai-companion";
export { UserIdentityPanel } from "./UserIdentityPanel";
export { AiIdlePresence } from "./AiIdlePresence";
export { LiveReelsTab } from "./LiveReelsTab";
export * from "./join-cta";
export { PhucMicControl } from "./PhucMicControl";
export { LivePreviewGreeting } from "./LivePreviewGreeting";
export { CccdAwakenAi } from "./CccdAwakenAi";
export { AiQuotaBuyGuide } from "./AiQuotaBuyGuide";
export { LiveAudioMixer } from "./LiveAudioMixer";
export { PhucVoiceListen } from "./PhucVoiceListen";
export { MicPermissionGate } from "./MicPermissionGate";
export * from "./mic-permission";
export * from "./phuc-speech";
export * from "./live-audio-sources";
export * from "./ai-play-stream";
export * from "./ai-live-permissions";
export * from "./theme";
export { ThemeToggle } from "./ThemeToggle";
export * from "./ai-caption";
export { AiCaptionOverlay } from "./AiCaptionOverlay";
export { BtcPreviewFont } from "./BtcPreviewFont";
export * from "./chat-grid";
export { ChatGridTab } from "./ChatGridTab";
export * from "./ai-sticker-quota";
export { AiCreditBar } from "./AiCreditBar";
export * from "./gemini";
export { GeminiLiveEye } from "./GeminiLiveEye";
export * from "./room-counts";
export { RoomCountsLabel } from "./RoomCountsLabel";
export { LiveAudienceCapControl } from "./LiveAudienceCapControl";
export * from "./audience-cap-alert";
export { LiveAudienceCapAlert } from "./LiveAudienceCapAlert";
export { ViewerCinemaScreen } from "./ViewerCinemaScreen";
export * from "./seat-rank";
export { AppCopyright } from "./AppCopyright";
export * from "./legal-docs";
export { LegalDocModal, LegalDocsBar } from "./LegalDocModal";
export { TermsGate, termsAccepted } from "./TermsGate";
export { DeviceBoot } from "./DeviceBoot";
export * from "./device";
export * from "./media-devices";
export { MediaDeviceDock } from "./MediaDeviceDock";
export * from "./av-processors";
export { AvProcessorDock } from "./AvProcessorDock";
export { BtcControlChrome } from "./BtcControlChrome";
export { OrganizerLiveDesk } from "./OrganizerLiveDesk";
export { EventsLiveScreen } from "./EventsLiveScreen";
export * from "./phuc-greeting";
export * from "./joined-lives";
export * from "./boss-vault";
export { RankStatusCard } from "./RankStatusCard";
export { PaymentMethodPicker } from "./PaymentMethodPicker";
export type { CashPayId } from "./PaymentMethodPicker";

export { canCreateEvent as canCreateShop } from "./roles";
export { canCreateEvent as canListProduct } from "./roles";

export { CreateEventButton } from "./CreateEventButton";
export { DashboardShopButtons } from "./DashboardShopButtons";
export { EventCreateForm } from "./EventCreateForm";
export { EventFeedCard } from "./EventFeedCard";
export { EventDetailSheet } from "./EventDetailSheet";
export { ProductCard } from "./ProductCard";
export { LiveProductForm } from "./LiveProductForm";
export { GiftPanel } from "./GiftPanel";
export { GiftWarehousePanel } from "./GiftWarehousePanel";
export { UseRewardsPanel } from "./UseRewardsPanel";
export { LiveGiftGuide } from "./LiveGiftGuide";
export { GiftVault } from "./GiftVault";
export { PhucChatbotAvatar, PHUC_AVATAR, PHUC_LOGO } from "./PhucChatbotAvatar";
export { BossVaultDashboard } from "./BossVaultDashboard";

export type FeedKind = "event" | "product";

export function sortFeed<T extends { pinned?: boolean; publishedAt?: string; liveRelated?: boolean }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const pin = Number(!!b.pinned) - Number(!!a.pinned);
    if (pin) return pin;
    const live = Number(!!b.liveRelated) - Number(!!a.liveRelated);
    if (live) return live;
    return String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? ""));
  });
}
