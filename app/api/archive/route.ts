import { NextResponse } from "next/server";
import { archiveMem, type ArchiveRow } from "./mem";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ArchiveRow;
    if (!body?.id || !body.title) {
      return NextResponse.json({ error: "Thiếu id hoặc tiêu đề" }, { status: 400 });
    }
    archiveMem[body.id] = {
      id: body.id,
      kind: body.kind || "photo-reel",
      title: String(body.title).slice(0, 200),
      description: String(body.description || "").slice(0, 4000),
      author: String(body.author || "user"),
      createdAt: body.createdAt || new Date().toISOString(),
      posterUrl: body.posterUrl || "/icon-512.png",
    };
    return NextResponse.json({ ok: true, id: body.id, path: "/p/" + body.id });
  } catch {
    return NextResponse.json({ error: "Không lưu permalink" }, { status: 500 });
  }
}
