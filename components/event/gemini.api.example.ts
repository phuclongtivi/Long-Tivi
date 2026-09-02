/** Sao chép thành app/api/gemini/frame/route.ts — key chỉ đọc process.env */

import { geminiDescribeFrame, geminiConfigured } from "./gemini";

export async function POST(req: Request) {
  if (!geminiConfigured()) {
    return Response.json({ ok: false, error: "Chưa gắn GEMINI_API_KEY" }, { status: 501 });
  }
  const { imageBase64, mime, tapNote } = await req.json();
  if (!imageBase64) return Response.json({ ok: false }, { status: 400 });
  const hint = await geminiDescribeFrame({ imageBase64, mime, tapNote });
  return Response.json({ ok: true, hint });
}
