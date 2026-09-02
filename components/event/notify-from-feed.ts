import type { EventPost } from "./types";
import type { NotifyItem } from "./NotifyInbox";

export function giftFeedNotices(posts: EventPost[]): NotifyItem[] {
  return posts
    .filter((p) => p.kind === "gift" || !!p.gift)
    .map((p) => ({
      id: `gift-${p.id}`,
      title: p.title,
      body: p.gift ? `Quà: ${p.gift}` : "Sự kiện xem và nhận quà",
      at: p.startsAt,
      href: `/events/${p.id}`,
    }));
}

export function ticketFeedNotices(posts: EventPost[]): NotifyItem[] {
  return posts
    .filter((p) => p.kind === "ticket" || p.ticketMode)
    .map((p) => ({
      id: `ticket-${p.id}`,
      title: p.title,
      body: "Sự kiện xem có vé trên feed",
      at: p.startsAt,
      href: `/events/${p.id}`,
    }));
}
