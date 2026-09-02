import { NextResponse } from "next/server";
import { callDeepSeekChat } from "@/lib/deepseek";

export const runtime = "nodejs";

type Body = {
  roomId: string;
  organizerName?: string;
  rules?: string[];
  caption?: string;
  evidenceUrl?: string;
};

function parseVerdict(text: string) {
  const t = (text || "").toLowerCase();
  const violate =
    t.includes("violate: yes") ||
    t.includes("vi phạm: có") ||
    t.includes('"violate": true') ||
    t.includes("porn") ||
    t.includes("khiêu dâm") ||
    t.includes("junk") ||
    t.includes("phòng rác") ||
    t.includes("chửi tục");
  const closeNow =
    t.includes("child") ||
    t.includes("trẻ em") ||
    t.includes("minor") ||
    t.includes("junk") ||
    t.includes("phòng rác");
  return {
    violate,
    reason: text.slice(0, 400),
    rule: violate ? "Nội quy phòng — nội dung khiêu dâm / cấm" : "",
    severity: closeNow ? "closeNow" : violate ? "close15" : "warn",
  } as const;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const rules = (body.rules || []).join("\n") || "Cấm video/ảnh khiêu dâm.";
  const caption = body.caption || "(không có mô tả khung hình)";

  const ds = await callDeepSeekChat({
    messages: [
      {
        role: "system",
        content:
          "Bạn là AI admin phòng livestream Long. Chỉ trả lời ngắn. VIOLATE: YES nếu khiêu dâm, chửi tục nặng, hoặc phòng rác (mở không người/không hoạt động). CLOSE_NOW nếu xâm hại trẻ em hoặc phòng rác. JUNK: YES nếu phòng rác. Không mô tả chi tiết cảnh. Không bịa bằng chứng.",
      },
      {
        role: "user",
        content: `Nội quy:\n${rules}\n\nMô tả khung / tín hiệu:\n${caption}\n\nRoom: ${body.roomId}`,
      },
    ],
    temperature: 0,
    maxTokens: 220,
  });

  const text = "text" in ds && ds.text ? ds.text : "VIOLATE: NO";
  const verdict = parseVerdict(text);

  return NextResponse.json({
    ok: true,
    roomId: body.roomId,
    verdict,
    model: "model" in ds ? ds.model : undefined,
    evidenceHeld: Boolean(body.evidenceUrl),
  });
}
