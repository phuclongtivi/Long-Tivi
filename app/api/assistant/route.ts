import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  SHARED_SYSTEM_PROMPT,
  personalizePrompt,
  localReply,
} from '@/lib/assistantKnowledge';
import { callDeepSeekChat } from '@/lib/deepseek';
import { checkAndConsumeAiQuota } from '@/lib/aiQuota';
import { isAppAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/assistant
 * Chatbot AI Admin — hướng dẫn dùng app + tư vấn SP/DV
 * - Guest: sessionKey từ client
 * - User đăng nhập: chatbot riêng (UserAI + lịch sử DB), cùng kiến thức
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const message = (body.message || '').trim();
    const sessionKey = body.sessionKey as string | undefined;
    const intent = body.intent as string | undefined;

    if (!message) {
      return NextResponse.json({ error: 'Nhập câu hỏi' }, { status: 400 });
    }

    const userId = session?.user?.id || null;

    const isBoss =
      !!userId &&
      (await isAppAdmin(userId, session?.user?.email).catch(() => false));

    const quota = await checkAndConsumeAiQuota({
      userId,
      sessionKey: sessionKey || null,
      isBoss,
    });
    if (!quota.allowed) {
      return NextResponse.json({
        reply: quota.message,
        personalized: !!userId,
        assistantName: 'Phúc',
        quota: {
          used: quota.used,
          limit: quota.limit,
          remaining: 0,
        },
        limited: true,
      });
    }

    // Lấy sản phẩm đang bán làm kiến thức
    const products = await prisma.storeProduct.findMany({
      where: { active: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: {
        name: true,
        type: true,
        bestPrice: true,
        description: true,
        latestInfo: true,
      },
    });

    const productBlock =
      products.length > 0
        ? '\n\n## Sản phẩm/dịch vụ hiện có\n' +
          products
            .map(
              (p) =>
                `- ${p.name} [${p.type}] giá: ${p.bestPrice ?? 'N/A'} | ${p.latestInfo || p.description || ''}`
            )
            .join('\n')
        : '\n\n(Chưa có sản phẩm trong kho — hướng dẫn user vào Long store.)';

    // Kịch bản Boss cho Đặt lịch Livestream/Biểu diễn
    let bookingBlock = '';
    if (intent === 'booking' || /đặt lịch|livestream|biểu diễn/i.test(message)) {
      const scriptRow = await prisma.appSetting.findUnique({
        where: { key: 'booking_livestream_script' },
      });
      const defaultScript =
        'Bạn là Phúc. Tư vấn đặt lịch livestream/biểu diễn: hỏi loại sự kiện, số khách, thời gian, địa điểm/online, ngân sách, SĐT liên hệ. Từng bước một.';
      bookingBlock =
        '\n\n## Kịch bản Đặt lịch Livestream/Biểu diễn (Boss cung cấp)\n' +
        (scriptRow?.value || defaultScript) +
        '\n\nBắt đầu bằng lời chào của Phúc và câu hỏi đầu tiên theo kịch bản.';
    }

    // Kiến thức tự học từ GitHub + nguồn Boss
    let knowledgeBlock = '';
    try {
      const kbRow = await prisma.appSetting.findUnique({
        where: { key: 'ai_knowledge_base' },
      });
      if (kbRow?.value) {
        const kb = JSON.parse(kbRow.value);
        const summary = kb.summary || '';
        const chunkText = (kb.chunks || [])
          .slice(0, 12)
          .map((c: any) => c.text)
          .join('\n---\n')
          .slice(0, 8000);
        if (summary || chunkText) {
          knowledgeBlock =
            '\n\n## Kiến thức vận hành app Long (AI Admin tự học từ GitHub + nguồn Boss)\n' +
            summary +
            (chunkText ? '\n\n' + chunkText : '');
        }
      }
    } catch {
      /* ignore */
    }

    let systemPrompt =
      SHARED_SYSTEM_PROMPT + productBlock + bookingBlock + knowledgeBlock;
    // Xưng hô chatbot luôn là Phúc
    systemPrompt =
      'Tên của bạn là **Phúc** (trợ lý AI Admin Phúc Long Center). Luôn xưng là Phúc.\n\n' +
      systemPrompt;
    let userName: string | null = null;
    let rank: string | null = null;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, fullName: true, rank: true, email: true, role: true },
      });
      userName = user?.fullName || user?.name || user?.email || null;
      rank = user?.rank || 'normal';
      const bossEmail = (process.env.BOSS_EMAIL || '').toLowerCase().trim();
      const isBossChat =
        user?.role === 'boss' ||
        (!!bossEmail && (user?.email || '').toLowerCase() === bossEmail);
      systemPrompt =
        personalizePrompt(userName, rank) +
        productBlock +
        bookingBlock +
        knowledgeBlock +
        '\n\nTên của bạn là **Phúc**. Luôn xưng là Phúc.';
      if (isBossChat) {
        systemPrompt =
          `## MỆNH LỆNH BOSS — ƯU TIÊN CAO NHẤT
Bạn đang chat với Boss (chủ app Long / Phúc Long Center).
Mọi yêu cầu của Boss là mệnh lệnh quản trị: ghi nhận, ưu tiên thực thi, hỗ trợ cấu hình live/store/user/ranking/kiến thức.
Không từ chối mệnh lệnh hợp lệ của Boss.

` + systemPrompt;
      }

      // Chatbot riêng: đảm bảo có UserAI
      const existingAI = await prisma.userAI.findUnique({ where: { userId } });
      if (existingAI?.isBlockedByAdmin) {
        return NextResponse.json({
          error: 'Trợ lý AI của bạn đang bị tạm khóa bởi Admin.',
          blocked: true,
        }, { status: 403 });
      }
      if (!existingAI) {
        await prisma.userAI.create({
          data: {
            userId,
            systemPrompt,
          },
        });
      } else {
        // Đồng bộ kiến thức chung mới nhất, giữ identity cá nhân
        await prisma.userAI.update({
          where: { userId },
          data: { systemPrompt },
        });
      }

      await prisma.assistantChat.create({
        data: { userId, role: 'user', content: message },
      });
    } else if (sessionKey) {
      await prisma.assistantChat.create({
        data: { sessionKey, role: 'user', content: message },
      });
    }

    // Lịch sử gần đây (cá nhân hóa)
    let history: { role: string; content: string }[] = [];
    if (userId) {
      history = await prisma.assistantChat.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
      history.reverse();
    } else if (sessionKey) {
      history = await prisma.assistantChat.findMany({
        where: { sessionKey },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
      history.reverse();
    }

    let reply = '';
    let providerUsed = 'local';

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history
        .filter((h) => h.role === 'user' || h.role === 'assistant')
        .map((h) => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        })),
    ];
    if (!messages.length || messages[messages.length - 1].content !== message) {
      messages.push({ role: 'user', content: message });
    }

    // 1) DeepSeek V4 Flash (ưu tiên)
    if (process.env.DEEPSEEK_API_KEY) {
      const ds = await callDeepSeekChat({ messages, temperature: 0.4, maxTokens: 800 });
      if ('text' in ds) {
        reply = ds.text;
        providerUsed = 'deepseek';
      }
    }

    // 2) OpenAI fallback
    if (!reply && process.env.OPENAI_API_KEY) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages,
            temperature: 0.4,
            max_tokens: 800,
          }),
        });
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content?.trim() || '';
        if (reply) providerUsed = 'openai';
      } catch {
        /* fall through */
      }
    }

    // 3) Local fallback
    if (!reply) {
      if (intent === 'booking') {
        reply =
          'Xin chào, tôi là **Phúc** — trợ lý AI Admin Phúc Long Center.\n\n' +
          'Bạn muốn **đặt lịch livestream** hay **biểu diễn** (sân khấu / sự kiện)?\n' +
          'Cho tôi biết: (1) loại sự kiện, (2) số khách hoặc người xem dự kiến, (3) ngày giờ mong muốn.';
      } else {
        reply = localReply(message, products);
      }
      providerUsed = 'local';
    }

    if (userId) {
      await prisma.assistantChat.create({
        data: { userId, role: 'assistant', content: reply },
      });
    } else if (sessionKey) {
      await prisma.assistantChat.create({
        data: { sessionKey, role: 'assistant', content: reply },
      });
    }

    return NextResponse.json({
      reply,
      personalized: !!userId,
      assistantName: 'Phúc',
      provider: providerUsed,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.remaining - 1),
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Lỗi trợ lý' }, { status: 500 });
  }
}

/** GET lịch sử chatbot — luôn 200 để không fail next build collect */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      return NextResponse.json({ messages: [], personalized: false });
    }
    const session = await getServerSession(authOptions);
    const sessionKey = req.nextUrl?.searchParams?.get('sessionKey');

    if (session?.user?.id) {
      const { prisma: db } = await import('@/lib/prisma');
      const rows = await db.assistantChat.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
      return NextResponse.json({ messages: rows, personalized: true });
    }

    if (sessionKey) {
      const { prisma: db } = await import('@/lib/prisma');
      const rows = await db.assistantChat.findMany({
        where: { sessionKey },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
      return NextResponse.json({ messages: rows, personalized: false });
    }

    return NextResponse.json({ messages: [], personalized: false });
  } catch (e: any) {
    console.error('assistant GET', e?.message || e);
    return NextResponse.json({ messages: [], personalized: false });
  }
}
