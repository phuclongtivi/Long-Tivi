import type { EventPost } from "./types";
import { frameById, type PosterFrame } from "./poster-frames";

const W = 1080;
const H = 1350;

export function renderAnnounceJpg(
  post: Pick<EventPost, "title" | "description" | "organizerName" | "kind" | "guests" | "expectedAudience" | "posterFrameId" | "discountVnd" | "discountCondition" | "referralReward" | "topic" | "hostLabel">,
  frame?: PosterFrame,
  qrImg?: HTMLImageElement | null
): string {
  if (typeof document === "undefined") return "";
  const fr = frame || frameById(post.posterFrameId);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return "";

  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, fr.bg);
  grad.addColorStop(1, fr.bg2);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  g.strokeStyle = fr.accent;
  g.lineWidth = 18;
  g.strokeRect(36, 36, W - 72, H - 72);
  g.lineWidth = 2;
  g.strokeRect(52, 52, W - 104, H - 104);

  const qrX = W - 52 - 16 - 168;
  const qrY = 52 + 16;
  if (qrImg) {
    g.fillStyle = "#fff";
    g.fillRect(qrX, qrY, 168, 168);
    g.drawImage(qrImg, qrX + 4, qrY + 4, 160, 160);
  }

  g.fillStyle = fr.accent;
  g.font = "bold 32px Inter, sans-serif";
  g.fillText("PHÚC LONG CENTER", 80, 120);
  g.font = "20px Inter, sans-serif";
  g.fillText(fr.name.toUpperCase() + " · " + fr.label, 80, 158);

  g.fillStyle = fr.ink;
  g.font = "bold 28px Inter, sans-serif";
  if (post.topic) g.fillText("Chủ đề: " + post.topic, 80, 210);
  g.font = "bold 54px Inter, sans-serif";
  wrap(g, post.title || "Sự kiện", 80, 270, W - 300, 64);
  if (post.discountVnd) {
    g.font = "26px Inter, sans-serif";
    g.fillStyle = fr.accent;
    g.fillText(
      "Ưu đãi " + new Intl.NumberFormat("vi-VN").format(post.discountVnd) + "đ" +
        (post.discountCondition ? " — " + post.discountCondition : ""),
      80,
      400
    );
  }

  g.font = "28px Inter, sans-serif";
  g.fillStyle = fr.accent;
  if (post.hostLabel) {
    g.fillStyle = fr.ink;
    g.font = "bold 28px Inter, sans-serif";
    g.fillText(post.hostLabel, 80, 448);
  }
  g.font = "22px Inter, sans-serif";
  g.fillStyle = "rgba(255,255,255,.45)";
  g.fillText("@" + String(post.organizerName || "").replace(/^@/, ""), 80, 480);

  const kind =
    post.kind === "gift" ? "Xem và nhận quà" : post.kind === "ticket" ? "Có vé / góp vé" : "LIVE";
  g.fillStyle = fr.ink;
  g.fillText(kind, 80, 510);
  if (post.expectedAudience) g.fillText("Khán giả dự kiến: " + post.expectedAudience, 80, 560);

  const names = (post.guests || []).map((x) => x.name).filter(Boolean).join(" · ");
  if (names) {
    g.fillText("Khách mời", 80, 640);
    wrap(g, names, 80, 690, W - 160, 40);
  }
  wrap(g, (post.description || "").slice(0, 360), 80, 860, W - 160, 36);

  g.fillStyle = fr.accent;
  g.font = "22px Inter, sans-serif";
  g.fillText("www.phuclongtivi.com", 80, H - 88);
  return c.toDataURL("image/jpeg", 0.92);
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(/\s+/);
  let line = "";
  let yy = y;
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (g.measureText(t).width > max) {
      g.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = t;
  }
  if (line) g.fillText(line, x, yy);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("img"));
    img.src = src;
  });
}

export function downloadJpg(dataUrl: string, name: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}
