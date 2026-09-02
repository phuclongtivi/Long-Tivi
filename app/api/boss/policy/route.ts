import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    policies: [
      {
        version: 1,
        title: "AI user level 2 default",
        status: "draft",
        body: "AI prepares drafts and asks users to confirm important actions.",
      },
      {
        version: 1,
        title: "TV quality default",
        status: "draft",
        body: "Use 720p by default. 1080p remains selectable but not default.",
      },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    message: "Boss policy draft received. Production must require Boss 2FA session.",
    policy: body,
  });
}
