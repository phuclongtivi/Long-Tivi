import type { EventPost, TicketMode } from "./types";

/** Phân luồng thanh toán theo cách BTC mặc định lúc tạo sự kiện. */
export function routeTicketPayment(post: EventPost, amountVnd: number): {
  channel: "fixed-checkout" | "flexible-checkout" | "invite-pass";
  amountVnd: number;
  ticketMode: TicketMode;
} {
  const mode: TicketMode = post.ticketMode ?? "fixed";
  if (mode === "invite") {
    return { channel: "invite-pass", amountVnd: 0, ticketMode: mode };
  }
  if (mode === "flexible") {
    return { channel: "flexible-checkout", amountVnd, ticketMode: mode };
  }
  return { channel: "fixed-checkout", amountVnd: post.ticketPriceVnd ?? amountVnd, ticketMode: mode };
}
