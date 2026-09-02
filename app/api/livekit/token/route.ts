import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function livekitJwt(opts: {
  apiKey: string;
  apiSecret: string;
  identity: string;
  room: string;
  canPublish: boolean;
  canSubscribe: boolean;
}) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: opts.apiKey,
      sub: opts.identity,
      name: opts.identity,
      nbf: now - 10,
      exp: now + 60 * 60 * 6,
      video: {
        room: opts.room,
        roomJoin: true,
        canPublish: opts.canPublish,
        canSubscribe: opts.canSubscribe,
        canPublishData: true,
      },
    })
  );
  const sig = createHmac("sha256", opts.apiSecret).update(`${header}.${payload}`).digest();
  return `${header}.${payload}.${b64url(sig)}`;
}

export async function POST(req: NextRequest) {
  const url = process.env.LIVEKIT_URL || "";
  const apiKey = process.env.LIVEKIT_API_KEY || "";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "";
  if (!url || !apiKey || !apiSecret) {
    return NextResponse.json(
      { ok: false, error: "Thiếu LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET trên server." },
      { status: 503 }
    );
  }

  let body: { room?: string; identity?: string; role?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const room = (body.room || "phuclong-lobby").replace(/[^\w.-]/g, "-").slice(0, 64);
  const identity = (body.identity || `user-${Date.now()}`).slice(0, 64);
  const role = body.role === "host" ? "host" : "viewer";
  const token = livekitJwt({
    apiKey,
    apiSecret,
    identity,
    room,
    canPublish: role === "host",
    canSubscribe: true,
  });

  return NextResponse.json({ ok: true, url, token, room, role });
}
