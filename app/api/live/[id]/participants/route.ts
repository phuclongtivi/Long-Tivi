import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET  /api/live/[id]/participants
 *   → danh sách user đang tham gia + lat/lng (nếu đã chia sẻ)
 *
 * POST /api/live/[id]/participants
 *   body: { lat, lng }
 *   → cập nhật vị trí của user hiện tại trong phiên live
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const liveSessionId = params.id;

  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id as string | undefined;

  try {
    const rows = await prisma.liveAttendance.findMany({
      where: { liveSessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            fullName: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 500,
    });

    const participants = rows
      .filter((r) => r.lat != null && r.lng != null)
      .map((r) => ({
        userId: r.userId,
        name: r.user.fullName || r.user.name || 'User',
        lat: r.lat as number,
        lng: r.lng as number,
        image: r.user.image,
        joinedAt: r.joinedAt.toISOString(),
        isMe: meId ? r.userId === meId : false,
      }));

    return NextResponse.json({
      liveSessionId,
      count: participants.length,
      participants,
    });
  } catch (e: any) {
    // Fallback mock when DB not ready – useful for UI preview
    return NextResponse.json({
      liveSessionId,
      count: 0,
      participants: [],
      warning: e?.message || 'db error',
    });
  }

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const liveSessionId = params.id;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const lat = Number(body.lat);
  const lng = Number(body.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Out of range' }, { status: 400 });
  }

  try {
    const attendance = await prisma.liveAttendance.upsert({
      where: {
        userId_liveSessionId: { userId, liveSessionId },
      },
      create: {
        userId,
        liveSessionId,
        lat,
        lng,
        locationSharedAt: new Date(),
      },
      update: {
        lat,
        lng,
        locationSharedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, attendanceId: attendance.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to save location' },
      { status: 500 }
    );
  }
}
