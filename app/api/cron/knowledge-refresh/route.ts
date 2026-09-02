import { NextRequest, NextResponse } from 'next/server';
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
const REFRESH_HOURS = 12;

/**
 * GET /api/cron/knowledge-refresh
 * Bảo vệ bằng CRON_SECRET: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'build_or_no_db' });
    }

    const { prisma } = await import('@/lib/prisma');

    const secret = process.env.CRON_SECRET;
    const auth = req.headers.get('authorization') || '';
    if (secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const srcRow = await prisma.appSetting.findUnique({
      where: { key: KNOWLEDGE_SOURCES_KEY },
    });
    if (!srcRow?.value) {
      return NextResponse.json({ skipped: true, reason: 'no sources' });
    }

    let sources: KnowledgeSources = EMPTY_SOURCES;
    try {
      sources = normalizeSources(JSON.parse(srcRow.value));
    } catch {
      return NextResponse.json({ skipped: true, reason: 'invalid sources' });
    }

    if (!sources.githubUrl && sources.links.length === 0) {
      return NextResponse.json({ skipped: true, reason: 'empty sources' });
    }

    if (sources.lastRunAt) {
      const age = Date.now() - new Date(sources.lastRunAt).getTime();
      if (age < REFRESH_HOURS * 3600 * 1000 && sources.status === 'ready') {
        return NextResponse.json({
          skipped: true,
          reason: `last run < ${REFRESH_HOURS}h`,
          lastRunAt: sources.lastRunAt,
        });
      }
    }

    const tokenRow = await prisma.appSetting.findUnique({ where: { key: TOKEN_KEY } });
    const token = tokenRow?.value || undefined;

    const urls: string[] = [];
    if (sources.githubUrl) urls.push(...githubKnowledgeUrls(sources.githubUrl));
    urls.push(...sources.links);

    const seen = new Set<string>();
    const unique = urls.filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });

    const parts: { source: string; text: string }[] = [];
    for (const url of unique.slice(0, 15)) {
      const part = await fetchUrlText(url, { token });
      if (part.text && part.text.length > 40) parts.push(part);
    }

    const blob = parts.map((p) => `### ${p.source}\n${p.text}`).join('\n\n');
    let summary =
      `## Kiến thức app Long (cron refresh)\nNguồn: ${parts.length}\n\n` +
      parts.map((p) => p.text.slice(0, 500)).join('\n---\n');

    try {
      const prow = await prisma.appSetting.findUnique({ where: { key: PROVIDERS_KEY } });
      if (prow?.value) {
        const parsed = JSON.parse(prow.value);
        const providers = Array.isArray(parsed) ? parsed : parsed.providers || [];
        for (const p of providers.filter((x: any) => x.enabled && x.apiKey).slice(0, 4)) {
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
                { role: 'system', content: 'AI Admin Phúc Long Center — tóm tắt tiếng Việt.' },
                { role: 'user', content: knowledgeSummaryPrompt(blob) },
              ],
              max_tokens: 2000,
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            summary = text;
            break;
          }
        }
      }
    } catch {
      /* keep local summary */
    }

    const base = buildKnowledgeBase(parts, summary);
    await prisma.appSetting.upsert({
      where: { key: KNOWLEDGE_BASE_KEY },
      create: { key: KNOWLEDGE_BASE_KEY, value: JSON.stringify(base) },
      update: { value: JSON.stringify(base) },
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
      data: { value: JSON.stringify(sources) },
    });

    return NextResponse.json({
      success: true,
      chunkCount: base.chunks.length,
      lastRunAt: sources.lastRunAt,
    });
  } catch (e: any) {
    console.error('knowledge-refresh', e?.message || e);
    return NextResponse.json({ ok: true, skipped: true, error: 'db_unavailable' });
  }
}
