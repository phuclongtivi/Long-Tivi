import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * Lấy báo cáo điểm danh do AI Admin tổng hợp
 * Host xem trên Dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' });
    }

    const { searchParams } = new URL(req.url);
    const liveSessionId = searchParams.get('liveSessionId');

    if (!liveSessionId) {
      return NextResponse.json({ error: 'Thiếu liveSessionId' }, { status: 400 });
    }

    const live = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
    });

    if (!live || live.userId !== session.user.id) {
      return NextResponse.json({ error: 'Không có quyền xem báo cáo này' });
    }

    // Lấy danh sách attendance + thông tin CCCD của user tham gia
    const attendances = await prisma.liveAttendance.findMany({
      where: { liveSessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            fullName: true,
            dateOfBirth: true,
            idNumber: true,
            address: true,
            idCardImageUrl: true,
            idCardVerified: true,
            rank: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Định dạng báo cáo giống AI Admin tổng hợp
    const report = {
      liveSessionId,
      title: live.title,
      totalParticipants: attendances.length,
      generatedBy: 'AI Admin',
      generatedAt: new Date().toISOString(),
      participants: attendances.map((a) => ({
        userId: a.user.id,
        joinedAt: a.joinedAt,
        // Thông tin theo căn cước
        fullName: a.user.fullName || a.user.name,
        dateOfBirth: a.user.dateOfBirth,
        idNumber: a.user.idNumber,
        address: a.user.address,
        idCardVerified: a.user.idCardVerified,
        idCardImageUrl: a.user.idCardImageUrl,
        rank: a.user.rank,
      })),
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
