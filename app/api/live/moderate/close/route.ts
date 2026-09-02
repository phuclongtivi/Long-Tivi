import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Đóng phòng + gửi bằng chứng cho Boss.
 * Ảnh bằng chứng chỉ gửi email nội bộ — không trả URL công khai.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    roomId?: string;
    by?: "user" | "ai-boss";
    case?: {
      organizerName?: string;
      verdict?: { reason?: string; rule?: string };
      evidenceUrl?: string;
    };
  };

  const roomId = body.roomId || "";
  const by = body.by || "ai-boss";
  const to = process.env.BOSS_EMAIL || "phuclongtivi@gmail.com";
  const evidenceUrl = body.case?.evidenceUrl;

  if (by === "ai-boss" && evidenceUrl) {
    const key = process.env.RESEND_API_KEY;
    const subject = `[Long] Đóng phòng bắt buộc — ${roomId}`;
    const html =
      `<p>AI admin đã đóng phòng <b>${roomId}</b> vì vi phạm nội quy.</p>` +
      `<p>Lý do (rút gọn): ${escapeHtml(body.case?.verdict?.reason || "")}</p>` +
      `<p>Bằng chứng đính kèm theo URL nội bộ (chỉ Boss mở): ${escapeHtml(evidenceUrl)}</p>`;

    if (key) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.MAIL_FROM || "Long <noreply@phuclong.xyz>",
            to,
            subject,
            html,
          }),
        });
      } catch (e) {
        console.error("[moderate/close] mail fail", e);
      }
    } else {
      console.log("[moderate/close] email Boss", { to, subject, roomId, hasEvidence: true });
    }
  }

  return NextResponse.json({
    ok: true,
    roomId,
    closedBy: by,
    emailedBoss: by === "ai-boss",
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
