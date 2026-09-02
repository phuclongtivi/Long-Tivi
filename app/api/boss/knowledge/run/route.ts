import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBoss } from '@/lib/admin';
import {
  KNOWLEDGE_SOURCES_KEY,
  KNOWLEDGE_BASE_KEY,
  EMPTY_SOURCES,
  normalizeSources,
  githubKnowledgeUrls,
  fetchUrlText,
  buildKnowledgeBase,
  knowledgeSummaryPrompt,
  type KnowledgeSources,
} from '@/lib/bossKnowledge';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOKEN_KEY = 'ai_github_token';
const PROVIDERS_KEY = 'boss_ai_providers';

async function requireBoss() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const boss = await isBoss(session.user.id, session.user.email);
  if (!boss) {
    return { error: NextResponse.json({ error: 'Chỉ Boss' }, { status: 403 }) };
  }
  return { session };
}

/** Gọi provider đầu tiên Boss đã bật (OpenAI-compatible) */
async function summarizeWithBossAI(prompt: string): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key: PROVIDERS_KEY } });
  if (!row?.value) return null;
  let providers: any[] = [];
  try {
    const parsed = JSON.parse(row.value);
    providers = Array.isArray(parsed) ? parsed : parsed.providers || [];
  } catch {
    return null;
  }
  const enabled = providers.filter((p) => p.enabled && p.apiKey && p.baseUrl);
  for (const p of enabled.slice(0, 4)) {
    try {
      const base = String(p.baseUrl).replace(/\/$/, '');
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${p.apiKey}`,
        },
        body: JSON.stringify({
          model: p.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Bạn là AI Admin Phúc Long Center. Tóm tắt kiến thức vận hành app bằng tiếng Việt.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return String(text);
    } catch {
      continue;
    }
  }
  return null;
}

function localSummary(parts: { source: string; text: string }[]): string {
  const joined = parts
    .filter((p) => p.text && !p.text.startsWith('[Fetch'))
    .map((p) => `• ${p.source}: ${p.text.slice(0, 400)}`)
    .join('\n');
  return (
    `## Kiến thức app Long (tự học — tóm tắt cục bộ)\n` +
    `Nguồn đã nạp: ${parts.length}. Boss có thể gắn API AI để tóm tắt sâu hơn.\n\n` +
    joined.slice(0, 6000)
  );
}

/** POST — Khởi chạy học kiến thức */
export async function POST() {
  const gate = await requireBoss();
  if ('error' in gate && gate.error) return gate.error;
  const session = gate.session!;

  const srcRow = await prisma.appSetting.findUnique({
    where: { key: KNOWLEDGE_SOURCES_KEY },
  });
  let sources: KnowledgeSources = EMPTY_SOURCES;
  if (srcRow?.value) {
    try {
      sources = normalizeSources(JSON.parse(srcRow.value));
    } catch {
      /* */
    }
  }

  if (!sources.githubUrl && sources.links.length === 0) {
    return NextResponse.json(
      { error: 'Chưa có GitHub hoặc link kiến thức. Lưu nguồn trước khi Khởi chạy.' },
      { status: 400 }
    );
  }

  sources = {
    ...sources,
    status: 'running',
    lastError: null,
  };
  await prisma.appSetting.upsert({
    where: { key: KNOWLEDGE_SOURCES_KEY },
    create: {
      key: KNOWLEDGE_SOURCES_KEY,
      value: JSON.stringify(sources),
      updatedBy: session.user.id,
    },
    update: {
      value: JSON.stringify(sources),
      updatedBy: session.user.id,
    },
  });

  try {
    const tokenRow = await prisma.appSetting.findUnique({ where: { key: TOKEN_KEY } });
    const token = tokenRow?.value || undefined;

    const urls: string[] = [];
    if (sources.githubUrl) {
      urls.push(...githubKnowledgeUrls(sources.githubUrl));
    }
    urls.push(...sources.links);

    // unique
    const seen = new Set<string>();
    const uniqueUrls = urls.filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });

    const parts: { source: string; text: string }[] = [];
    for (const url of uniqueUrls.slice(0, 15)) {
      const part = await fetchUrlText(url, { token });
      if (part.text && part.text.length > 40) parts.push(part);
    }

    const blob = parts.map((p) => `### ${p.source}\n${p.text}`).join('\n\n');
    const prompt = knowledgeSummaryPrompt(blob);
    let summary = await summarizeWithBossAI(prompt);
    if (!summary) summary = localSummary(parts);

    const base = buildKnowledgeBase(parts, summary);
    await prisma.appSetting.upsert({
      where: { key: KNOWLEDGE_BASE_KEY },
      create: {
        key: KNOWLEDGE_BASE_KEY,
        value: JSON.stringify(base),
        updatedBy: session.user.id,
      },
      update: {
        value: JSON.stringify(base),
        updatedBy: session.user.id,
      },
    });

    sources = {
      ...sources,
      status: 'ready',
      lastRunAt: new Date().toISOString(),
      summary: summary.slice(0, 2000),
      lastError: null,
    };
    await prisma.appSetting.update({
      where: { key: KNOWLEDGE_SOURCES_KEY },
      data: { value: JSON.stringify(sources), updatedBy: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'AI Admin đã nạp kiến thức',
      sources,
      chunkCount: base.chunks.length,
      summaryPreview: summary.slice(0, 500),
    });
  } catch (e: any) {
    sources = {
      ...sources,
      status: 'error',
      lastError: e?.message || 'Lỗi học kiến thức',
    };
    await prisma.appSetting.update({
      where: { key: KNOWLEDGE_SOURCES_KEY },
      data: { value: JSON.stringify(sources), updatedBy: session.user.id },
    });
    return NextResponse.json(
      { error: sources.lastError, sources },
      { status: 500 }
    );
  }
}
