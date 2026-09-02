import type { EventPost } from "./types";

export function resolveJoinAccess(post: EventPost): "open" | "ticket" | "invite" {
  if (post.joinAccess) return post.joinAccess;
  if (post.ticketMode === "invite" || post.kind === "ticket" && post.ticketMode === "invite") return "invite";
  if (post.ticketMode === "fixed" || post.ticketMode === "flexible" || post.kind === "ticket") return "ticket";
  return "open";
}

export function joinButtonLabel(post: EventPost): string {
  const a = resolveJoinAccess(post);
  if (a === "ticket") return "Mua vé nhanh";
  if (a === "invite") return "Góp vé mời";
  return "Xem nhanh";
}
