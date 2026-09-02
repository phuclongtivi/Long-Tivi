import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    agent: {
      displayName: "Long AI",
      level: 2,
      tone: "Tinh tế, nhanh, hỗ trợ live và mua bán",
      skills: ["live", "chat", "superbuy", "notice", "tv-display"],
      permissions: {
        default: "prepare-and-confirm",
        liveControl: "confirm-required",
        externalApps: "not-connected",
      },
      memory: ["mixer-latest", "draft-events", "store-preferences"],
    },
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    message: "Agent profile draft saved. Wire this route to PersonalAgent in production.",
    draft: body,
  });
}
