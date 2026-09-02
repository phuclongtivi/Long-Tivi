import { NextResponse } from "next/server";
import { archiveMem } from "../mem";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const row = archiveMem[ctx.params.id];
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}
