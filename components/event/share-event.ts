/** Chỉ chia sẻ RA NGOÀI app từ bài feed Tab Home: Facebook, tường Zalo, Messenger. */

export const SHARE_PLATFORMS = [
  { key: "facebook", label: "Facebook" },
  { key: "zalo", label: "Tường Zalo" },
  { key: "messenger", label: "Messenger" },
  { key: "instagram", label: "Instagram (tải file)" },
] as const;

export function eventShareUrl(id: string): string {
  if (typeof window === "undefined") return `/p/${id}`;
  return `${window.location.origin}/p/${id}`;
}

export function eventShareText(title: string, organizer: string): string {
  return `${title} — @${organizer.replace(/^@/, "")} trên Phúc Long Center`;
}

export async function shareEventPlatform(
  platform: string,
  opts: { id: string; title: string; organizer: string; posterUrl?: string }
) {
  const raw = eventShareUrl(opts.id);
  const url = encodeURIComponent(raw);
  const text = encodeURIComponent(eventShareText(opts.title, opts.organizer));
  const map: Record<string, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    zalo: `https://zalo.me/share?url=${url}&title=${text}`,
    messenger: `https://www.facebook.com/dialog/send?link=${url}&redirect_uri=${url}`,
  };
  if (platform === "instagram") {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(decodeURIComponent(text) + "\n" + raw).catch(() => {});
    }
    return;
  }
  const href = map[platform];
  if (href && typeof window !== "undefined") window.open(href, "_blank", "noopener");
}
