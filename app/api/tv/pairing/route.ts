import { NextResponse } from "next/server";

function pairingCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = pairingCode();
  return NextResponse.json({
    pairingCode: code,
    qrPayload: `longtv://pair?code=${code}`,
    webFallback: `https://1986.tv/connect?code=${code}`,
    quality: body.quality === "1080p" ? "1080p" : "720p",
    status: "waiting",
    expiresInSeconds: 300,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    status: "connected",
    role: body.role || "phone",
    message: "QR remote pairing scaffold accepted.",
  });
}
