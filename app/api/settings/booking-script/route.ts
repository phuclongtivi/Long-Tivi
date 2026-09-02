import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss, isAppAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const KEY = 'booking_livestream_script';

const DEFAULT_SCRIPT = `Kịch bản tư vấn Đặt lịch Livestream / Biểu diễn (Phúc Long Center):

1. Chào khách, xưng là Phúc — trợ lý AI Admin.
2. Hỏi rõ nhu cầu: livestream online, biểu diễn sân khấu, workshop, hay sự kiện kết hợp.
3. Hỏi số lượng khách / người xem dự kiến.
4. Hỏi ngày giờ mong muốn (và phương án dự phòng).
5. Hỏi địa điểm (nếu offline) hoặc nền tảng (nếu chỉ online).
6. Hỏi ngân sách / gói quan tâm (nếu có).
7. Ghi nhận thông tin liên hệ (tên, SĐT, email) để Admin liên hệ xác nhận.
8. Tóm tắt lại nhu cầu và hướng dẫn bước tiếp theo trên app (đăng nhập, hạng Nghệ sĩ nếu muốn tự tổ chức, hoặc để Admin/Boss xếp lịch).
9. Hotline hỗ trợ: 0966 717 808 · phuclongtivi@gmail.com.

Giọng điệu: thân thiện, chuyên nghiệp, từng câu hỏi một — không hỏi dồn.`;

/** GET — mọi user đọc kịch bản (chatbot dùng) */
export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const row = await prisma.appSetting.findUnique({ where: { key: KEY } });
  return NextResponse.json({
    script: row?.value || DEFAULT_SCRIPT,
    isDefault: !row,
    updatedAt: row?.updatedAt || null,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

/** POST — Boss/Admin cập nhật kịch bản tư vấn */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const boss = await isBoss(session.user.id, session.user.email);
  const admin = await isAppAdmin(session.user.id, session.user.email);
  if (!boss && !admin) {
    return NextResponse.json({ error: 'Chỉ Boss/Admin được sửa kịch bản' }, { status: 403 });
  }

  const body = await req.json();
  const script = (body.script || '').trim();
  if (!script) {
    return NextResponse.json({ error: 'Thiếu nội dung kịch bản' }, { status: 400 });
  }

  const row = await prisma.appSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: script, updatedBy: session.user.id },
    update: { value: script, updatedBy: session.user.id },
  });

  return NextResponse.json({
    success: true,
    message: 'Đã lưu kịch bản Đặt lịch Livestream/Biểu diễn',
    script: row.value,
  });
}
