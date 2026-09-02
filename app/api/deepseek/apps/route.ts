import { SLOT_FREE_FALLBACK, type CatalogApp } from "@/components/event/av-processors";

export async function POST(req: Request) {
  const { slot, failedApp } = (await req.json()) as { slot: 1 | 2 | 3; failedApp?: string };
  const fallback = SLOT_FREE_FALLBACK[slot] || SLOT_FREE_FALLBACK[1];
  const key = process.env.DEEPSEEK_API_KEY || "";
  if (!key) {
    return Response.json({ ok: true, source: "fallback", apps: fallback });
  }
  try {
    const topic = slot === 1 ? "virtual webcam free" : slot === 2 ? "free noise suppression mic" : "free smart lighting app";
    const res = await fetch(process.env.DEEPSEEK_API_BASE || "https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Gợi ý đúng 2 phần mềm livestream MIỄN PHÍ. JSON: {\"apps\":[{\"name\":\"\",\"blurb\":\"\",\"loginUrl\":\"https://\"}]} tiếng Việt ngắn. Không bịa URL.",
          },
          {
            role: "user",
            content: `Khe ${slot}. User không vào được ${failedApp || "app trả phí"}. Chủ đề: ${topic}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 280,
      }),
    });
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content || "";
    const sliced = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(sliced) as { apps?: CatalogApp[] };
    const apps = (parsed.apps || []).slice(0, 2).map((a, i) => ({
      id: `ds-${slot}-${i}`,
      name: String(a.name || "App miễn phí"),
      blurb: String(a.blurb || "Miễn phí"),
      loginUrl: String(a.loginUrl || fallback[i]?.loginUrl || ""),
      useAsVideo: slot !== 2,
      useAsAudio: slot === 2,
    }));
    return Response.json({ ok: true, source: "deepseek", apps: apps.length ? apps : fallback });
  } catch {
    return Response.json({ ok: true, source: "fallback", apps: fallback });
  }
}
