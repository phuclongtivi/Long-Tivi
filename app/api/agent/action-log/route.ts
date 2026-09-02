import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    logs: [
      { actor: "user-ai", action: "draft_event_notice", status: "proposed" },
      { actor: "user-ai", action: "prepare_live_mixer", status: "waiting_confirmation" },
      { actor: "boss-ai", action: "apply_safety_policy", status: "policy_active" },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    message: "Action log accepted as scaffold.",
    log: body,
  });
}
