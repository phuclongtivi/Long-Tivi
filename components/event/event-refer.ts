/** Link chia sẻ / QR: sản phẩm superBUY + refer + ưu đãi. */

export function shopReferUrl(opts: {
  productId?: string;
  eventId?: string;
  referrerId: string;
  discountVnd?: number;
  discountCondition?: string;
  referralReward?: string;
}): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.phuclong.xyz";
  const q = new URLSearchParams();
  q.set("ref", opts.referrerId);
  if (opts.productId) q.set("p", opts.productId);
  if (opts.eventId) q.set("e", opts.eventId);
  if (opts.discountVnd) q.set("off", String(opts.discountVnd));
  if (opts.discountCondition) q.set("cond", opts.discountCondition.slice(0, 80));
  if (opts.referralReward) q.set("bonus", opts.referralReward.slice(0, 80));
  return `${origin}/store?${q.toString()}`;
}

export async function qrDataUrl(text: string, size = 200): Promise<string> {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(text)}`;
  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("QR"));
    r.readAsDataURL(blob);
  });
}
