import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss } from '@/lib/admin';
import {
  KNOWLEDGE_SOURCES_KEY,
  KNOWLEDGE_BASE_KEY,
  EMPTY_SOURCES,
  normalizeSources,
  type KnowledgeSources,
  type KnowledgeBase,
} from '@/lib/bossKnowledge';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOKEN_KEY = 'ai_github_token';

async function requireBoss() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const boss = await isBoss(session.user.id, session.user.email);
  if (!boss) return { error: NextResponse.json({ error: 'Chỉ Boss' }, { status: 403 }) };
  return { session };
}

/** GET — nguồn + trạng thái + summary (không trả token) */
export async function GET() {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [] });
    }

  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;

  const [srcRow, baseRow, tokenRow] = await Promise.all([
    prisma.appSetting.findUnique({ where: { key: KNOWLEDGE_SOURCES_KEY } }),
    prisma.appSetting.findUnique({ where: { key: KNOWLEDGE_BASE_KEY } }),
    prisma.appSetting.findUnique({ where: { key: TOKEN_KEY } }),
  ]);

  let sources: KnowledgeSources = EMPTY_SOURCES;
  if (srcRow?.value) {
    try {
      sources = normalizeSources(JSON.parse(srcRow.value));
    } catch {
      sources = EMPTY_SOURCES;
    }
  }
  sources.githubTokenSet = !!(tokenRow?.value && tokenRow.value.length > 0);

  let base: KnowledgeBase | null = null;
  if (baseRow?.value) {
    try {
      base = JSON.parse(baseRow.value);
    } catch {
      base = null;
    }
  }

  return NextResponse.json({
    sources,
    knowledge: base
      ? {
          updatedAt: base.updatedAt,
          summary: base.summary,
          chunkCount: base.chunks?.length || 0,
        }
      : null,
  });

  } catch (e: any) {
    console.error('GET route', e?.message || e);
    return NextResponse.json({ ok: true, items: [], messages: [], providers: [], list: [], error: 'db_unavailable' });
  }
}

/** POST — Boss lưu githubUrl + links (+ optional githubToken) */
export async function POST(req: NextRequest) {
  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;
  const session = gate.session!;

  const body = await req.json();
  const existingRow = await prisma.appSetting.findUnique({
    where: { key: KNOWLEDGE_SOURCES_KEY },
  });
  let prev: KnowledgeSources = EMPTY_SOURCES;
  if (existingRow?.value) {
    try {
      prev = normalizeSources(JSON.parse(existingRow.value));
    } catch {
      /* */
    }
  }

  const next = normalizeSources({
    ...prev,
    githubUrl: body.githubUrl ?? prev.githubUrl,
    links: body.links ?? prev.links,
    lastRunAt: prev.lastRunAt,
    status: prev.status,
    lastError: prev.lastError,
    summary: prev.summary,
  });

  await prisma.appSetting.upsert({
    where: { key: KNOWLEDGE_SOURCES_KEY },
    create: {
      key: KNOWLEDGE_SOURCES_KEY,
      value: JSON.stringify(next),
      updatedBy: session.user.id,
    },
    update: {
      value: JSON.stringify(next),
      updatedBy: session.user.id,
    },
  });

  if (typeof body.githubToken === 'string') {
    const tok = body.githubToken.trim();
    if (tok === '') {
      await prisma.appSetting.deleteMany({ where: { key: TOKEN_KEY } });
    } else {
      await prisma.appSetting.upsert({
        where: { key: TOKEN_KEY },
        create: { key: TOKEN_KEY, value: tok, updatedBy: session.user.id },
        update: { value: tok, updatedBy: session.user.id },
      });
    }
  }

  return NextResponse.json({
    success: true,
    sources: { ...next, githubTokenSet: !!(body.githubToken || prev.githubTokenSet) },
  });
}
