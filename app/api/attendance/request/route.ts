import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


/**
 * Host tick "Điểm danh theo căn cước"
 * → Hệ thống ghi nhận yêu cầu
 * → AI Admin sẽ thực hiện điểm danh hộ và tổng hợp danh sách gửi về dashboard host
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { liveSessionId } = await req.json();

    if (!liveSessionId) {
      return NextResponse.json({ error: 'Thiếu liveSessionId' }, { status: 400 });
    }

    // Kiểm tra quyền: chỉ host của buổi live mới được yêu cầu điểm danh
    const live = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
      include: { user: true },
    });

    if (!live) {
      return NextResponse.json({ error: 'Không tìm thấy phiên livestream' }, { status: 404 });
    }

    if (live.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bạn không phải chủ phiên live này' }, { status: 403 });
    }

    // Chỉ cho phép khi user được Admin cấp quyền tổ chức
    if (!live.user.canOrganizeLive) {
      return NextResponse.json(
        { error: 'Bạn chưa được Admin cấp quyền sử dụng bảng điều khiển' },
        { status: 403 }
      );
    }

    // Bật cờ điểm danh theo căn cước
    await prisma.liveSession.update({
      where: { id: liveSessionId },
      data: {
        requireIdCard: true,
        // Có thể thêm trạng thái: attendanceRequestedAt, attendanceStatus = 'pending'
      },
    });

    // TODO: Gửi job cho AI Admin xử lý điểm danh
    // Hiện tại đánh dấu yêu cầu đã được ghi nhận.
    // AI Admin sẽ:
    // 1. Lấy danh sách user đã tham dự (LiveAttendance)
    // 2. Lấy thông tin CCCD đầy đủ của từng user
    // 3. Tổng hợp thành báo cáo
    // 4. Gửi về dashboard của host (AttendanceReport)

    return NextResponse.json({
      success: true,
      message:
        'Đã gửi yêu cầu điểm danh. AI Admin sẽ thực hiện điểm danh hộ và gửi danh sách đầy đủ về Dashboard của bạn.',
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
