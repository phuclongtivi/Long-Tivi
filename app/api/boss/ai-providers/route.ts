import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PROVIDERS_KEY = 'boss_ai_providers';
const MAX = 4;

type AIProvider = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
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

function parseProviders(raw?: string | null): AIProvider[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    const list = Array.isArray(p) ? p : p.providers || [];
    return list.slice(0, MAX).map((x: any, i: number) => ({
      id: String(x.id || i + 1),
      name: String(x.name || `Provider ${i + 1}`),
      baseUrl: String(x.baseUrl || ''),
      apiKey: String(x.apiKey || ''),
      model: String(x.model || 'gpt-4o-mini'),
      enabled: !!x.enabled,
    }));
  } catch {
    return [];
  }
}

/** GET — danh sách (che apiKey) */
export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;

  const row = await prisma.appSetting.findUnique({ where: { key: PROVIDERS_KEY } });
  const providers = parseProviders(row?.value).map((p) => ({
    ...p,
    apiKey: maskKey(p.apiKey),
    apiKeySet: !!p.apiKey,
  }));
  return NextResponse.json({ providers, max: MAX });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

/** POST — lưu tối đa 4 provider. apiKey rỗng = giữ key cũ */
export async function POST(req: NextRequest) {
  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;
  const session = gate.session!;

  const body = await req.json();
  const incoming = Array.isArray(body.providers) ? body.providers : [];
  const row = await prisma.appSetting.findUnique({ where: { key: PROVIDERS_KEY } });
  const prev = parseProviders(row?.value);
  const prevMap = new Map(prev.map((p) => [p.id, p]));

  const next: AIProvider[] = incoming.slice(0, MAX).map((x: any, i: number) => {
    const id = String(x.id || i + 1);
    const old = prevMap.get(id);
    let apiKey = String(x.apiKey || '').trim();
    // Không ghi đè bằng key đã mask
    if (!apiKey || apiKey.includes('***')) {
      apiKey = old?.apiKey || '';
    }
    return {
      id,
      name: String(x.name || `Provider ${i + 1}`).slice(0, 80),
      baseUrl: String(x.baseUrl || '').replace(/\/$/, '').slice(0, 200),
      apiKey,
      model: String(x.model || 'gpt-4o-mini').slice(0, 80),
      enabled: !!x.enabled,
    };
  });

  await prisma.appSetting.upsert({
    where: { key: PROVIDERS_KEY },
    create: {
      key: PROVIDERS_KEY,
      value: JSON.stringify({ providers: next }),
      updatedBy: session.user.id,
    },
    update: {
      value: JSON.stringify({ providers: next }),
      updatedBy: session.user.id,
    },
  });

  return NextResponse.json({
    success: true,
    providers: next.map((p) => ({
      ...p,
      apiKey: maskKey(p.apiKey),
      apiKeySet: !!p.apiKey,
    })),
  });
}
