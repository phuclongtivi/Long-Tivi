import { geminiCoachImage, geminiConfigured } from "@/components/event/gemini";

export async function GET() {
  return Response.json({ ok: geminiConfigured(), role: "image-coach" });
}

export async function POST(req: Request) {
  if (!geminiConfigured()) {
    return Response.json({ ok: false, error: "Chưa gắn GEMINI_API_KEY." }, { status: 501 });
  }
  const { imageBase64, mime, kind } = await req.json();
  if (!imageBase64) return Response.json({ ok: false }, { status: 400 });
  const coach = await geminiCoachImage({ imageBase64, mime, kind });
  return Response.json({ ok: true, ...coach });
}
