import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Cấu hình DeepSeek + hạn mức chat Phúc (Boss) */
const DEEPSEEK_CFG_KEY = 'deepseek_chat_config';
const DAILY_LIMIT_KEY = 'ai_daily_reply_limit';

type DeepSeekCfg = {
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
};

function maskKey(k: string) {
  if (!k || k.length < 8) return k ? '***' : '';
  return k.slice(0, 4) + '***' + k.slice(-4);
}

async function requireBoss() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!(await isBoss(session.user.id, session.user.email))) {
    return { error: NextResponse.json({ error: 'Chỉ Boss' }, { status: 403 }) };
  }
  return { session };
}

async function loadCfg(): Promise<DeepSeekCfg> {
  const row = await prisma.appSetting.findUnique({ where: { key: DEEPSEEK_CFG_KEY } });
  if (row?.value) {
    try {
      const j = JSON.parse(row.value);
      return {
        apiKey: String(j.apiKey || ''),
        baseUrl: String(j.baseUrl || 'https://api.deepseek.com'),
        model: String(j.model || 'deepseek-chat'),
        enabled: j.enabled !== false,
      };
    } catch {
      /* fallthrough */
    }
  }
  // Fallback env (không trả key đầy đủ ra client)
  return {
    apiKey: process.env.DEEPSEEK_API_KEY ? 'env' : '',
    baseUrl: process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    enabled: true,
  };
}

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;

  const cfg = await loadCfg();
  const limitRow = await prisma.appSetting.findUnique({ where: { key: DAILY_LIMIT_KEY } });
  const dailyLimit = limitRow?.value
    ? parseInt(limitRow.value, 10)
    : parseInt(process.env.AI_DAILY_REPLY_LIMIT || '4', 10) || 4;

  return NextResponse.json({
    deepseek: {
      apiKey: cfg.apiKey === 'env' ? '***env***' : maskKey(cfg.apiKey),
      apiKeySet: !!(cfg.apiKey && cfg.apiKey !== ''),
      fromEnv: cfg.apiKey === 'env',
      baseUrl: cfg.baseUrl,
      model: cfg.model,
      enabled: cfg.enabled,
    },
    dailyLimit: Number.isFinite(dailyLimit) && dailyLimit > 0 ? dailyLimit : 4,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;

  const body = await req.json();
  const prev = await loadCfg();

  let apiKey = String(body.apiKey || '').trim();
  if (!apiKey || apiKey.includes('***')) {
    apiKey = prev.apiKey === 'env' ? '' : prev.apiKey;
  }

  const cfg: DeepSeekCfg = {
    apiKey,
    baseUrl: String(body.baseUrl || prev.baseUrl || 'https://api.deepseek.com')
      .replace(/\/$/, '')
      .slice(0, 200),
    model: String(body.model || prev.model || 'deepseek-chat').slice(0, 80),
    enabled: body.enabled !== false,
  };

  await prisma.appSetting.upsert({
    where: { key: DEEPSEEK_CFG_KEY },
    create: { key: DEEPSEEK_CFG_KEY, value: JSON.stringify(cfg) },
    update: { value: JSON.stringify(cfg) },
  });

  let dailyLimit = parseInt(String(body.dailyLimit ?? '4'), 10);
  if (!Number.isFinite(dailyLimit) || dailyLimit < 1) dailyLimit = 4;
  if (dailyLimit > 500) dailyLimit = 500;

  await prisma.appSetting.upsert({
    where: { key: DAILY_LIMIT_KEY },
    create: { key: DAILY_LIMIT_KEY, value: String(dailyLimit) },
    update: { value: String(dailyLimit) },
  });

  return NextResponse.json({
    success: true,
    message: 'Đã lưu DeepSeek + hạn mức chat Phúc',
    deepseek: {
      apiKey: maskKey(cfg.apiKey),
      apiKeySet: !!cfg.apiKey,
      baseUrl: cfg.baseUrl,
      model: cfg.model,
      enabled: cfg.enabled,
    },
    dailyLimit,
  });
}
