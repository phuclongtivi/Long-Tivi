import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAppEmail, getBossEmails } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/live/create
 * body: {
 *   title?, deviceId?,
 *   scheduledStartAt?: ISO string  // lịch phát → thông báo trước 5 phút
 *   isPublic?, requireIdCard?, hasReward?
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || `Live của ${session.user.name || session.user.id}`;
    const deviceId = body.deviceId || 'default';
    const scheduledStartAt = body.scheduledStartAt
      ? new Date(body.scheduledStartAt)
      : null;

    if (scheduledStartAt && Number.isNaN(scheduledStartAt.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledStartAt' }, { status: 400 });
    }

    let liveInputId = `local-${Date.now()}`;
    let webRTCUrl: string | null = null;
    let playbackUrl: string | null = null;
    let streamKey: string | null = null;

    // Cloudflare Stream (nếu có env)
    if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meta: {
              name: title,
              userId: session.user.id,
              deviceId,
            },
            recording: { mode: 'automatic' },
          }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.errors?.[0]?.message || 'Tạo live Cloudflare thất bại');
      }

      liveInputId = data.result.uid;
      webRTCUrl = data.result.webRTC?.url ?? null;
      playbackUrl = data.result.webRTCPlayback?.url || data.result.playback?.hls || null;
      streamKey = data.result.rtmps?.streamKey ?? null;
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        userId: session.user.id,
        liveInputId,
        title,
        deviceId,
        playbackUrl,
        isPublic: body.isPublic !== false,
        requireIdCard: Boolean(body.requireIdCard),
        hasReward: Boolean(body.hasReward),
        requiresTicket: Boolean(body.requiresTicket),
        ticketPriceMin: Math.max(
          5000,
          Math.min(20_000_000, Number(body.ticketPriceMin) || 5000)
        ),
        ticketPriceMax: Math.max(
          5000,
          Math.min(20_000_000, Number(body.ticketPriceMax) || 20_000_000)
        ),
        ticketHint: body.ticketHint ? String(body.ticketHint).slice(0, 200) : null,
        scheduledStartAt,
        // Nếu bắt đầu ngay (không có lịch) → startedAt = now (default schema)
        // Nếu có lịch tương lai → vẫn tạo session, host bấm Start sau
        startedAt: scheduledStartAt && scheduledStartAt > new Date()
          ? scheduledStartAt
          : new Date(),
        notifyBefore5Sent: false,
        notifyAfter10Sent: false,
        // Mọi live do Nghệ sĩ / Admin tổ chức → chờ Boss duyệt mới hiện trên app
        approvalStatus: 'pending_boss',
      },
    });

    // Thông báo Boss (dashboard + email)
    try {
      const organizer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, fullName: true, email: true, rank: true, role: true },
      });
      const who =
        organizer?.fullName || organizer?.name || session.user.email || session.user.id;
      const base = process.env.NEXTAUTH_URL || 'https://phuclong.app';
      const subject = `[Long] Duyệt livestream: ${title}`;
      const text = [
        `Có livestream mới cần Boss duyệt.`,
        `Tiêu đề: ${title}`,
        `Người tổ chức: ${who} (rank=${organizer?.rank}, role=${organizer?.role})`,
        `Live ID: ${liveSession.id}`,
        `Lịch: ${liveSession.scheduledStartAt?.toISOString() || 'bắt đầu ngay'}`,
        `Duyệt tại Dashboard Boss: ${base}/dashboard`,
      ].join('\n');
      const emails = await getBossEmails();
      for (const to of emails) {
        await sendAppEmail({ to, subject, text });
      }
    } catch (e) {
      console.error('notify boss live', e);
    }

    return NextResponse.json({
      liveSessionId: liveSession.id,
      approvalStatus: 'pending_boss',
      message: 'Đã gửi yêu cầu. Live chỉ hiện trên app sau khi Boss duyệt.',
      liveInputId,
      webRTCUrl,
      playbackUrl,
      streamKey,
      scheduledStartAt: liveSession.scheduledStartAt?.toISOString() ?? null,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
