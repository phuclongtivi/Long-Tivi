/**
 * Boss knowledge sources + AI Admin self-learning
 */

export const KNOWLEDGE_SOURCES_KEY = 'ai_knowledge_sources';
export const KNOWLEDGE_BASE_KEY = 'ai_knowledge_base';

export type KnowledgeSources = {
  githubUrl: string;
  links: string[];
  githubTokenSet?: boolean;
  lastRunAt: string | null;
  status: 'idle' | 'running' | 'ready' | 'error';
  lastError?: string | null;
  summary?: string | null;
};

export type KnowledgeChunk = {
  source: string;
  text: string;
  updatedAt: string;
};

export type KnowledgeBase = {
  updatedAt: string;
  summary: string;
  chunks: KnowledgeChunk[];
};

export const EMPTY_SOURCES: KnowledgeSources = {
  githubUrl: '',
  links: [],
  githubTokenSet: false,
  lastRunAt: null,
  status: 'idle',
  lastError: null,
  summary: null,
};

const MAX_LINKS = 10;
const MAX_CHUNK_CHARS = 4000;
const MAX_CHUNKS = 40;

export function normalizeSources(input: Partial<KnowledgeSources>): KnowledgeSources {
  const links = Array.isArray(input.links)
    ? input.links
        .map((u) => String(u || '').trim())
        .filter((u) => /^https?:\/\//i.test(u))
        .slice(0, MAX_LINKS)
    : [];
  const githubUrl = String(input.githubUrl || '').trim();
  return {
    githubUrl: /^https?:\/\//i.test(githubUrl) ? githubUrl : '',
    links,
    githubTokenSet: !!input.githubTokenSet,
    lastRunAt: input.lastRunAt ?? null,
    status: input.status || 'idle',
    lastError: input.lastError ?? null,
    summary: input.summary ?? null,
  };
}

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchUrlText(
  url: string,
  opts?: { token?: string; timeoutMs?: number }
): Promise<{ source: string; text: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 20000);
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'PhucLongCenter-AIAdmin/1.0',
      Accept: 'text/html,application/json,text/plain,*/*',
    };
    if (opts?.token && url.includes('github.com')) {
      headers.Authorization = `Bearer ${opts.token}`;
      headers.Accept = 'application/vnd.github.raw+json, application/vnd.github+json';
    }
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) return { source: url, text: `[Fetch error ${res.status}]` };
    const ct = res.headers.get('content-type') || '';
    const raw = await res.text();
    if (ct.includes('json')) {
      try {
        return {
          source: url,
          text: JSON.stringify(JSON.parse(raw), null, 0).slice(0, MAX_CHUNK_CHARS),
        };
      } catch {
        return { source: url, text: raw.slice(0, MAX_CHUNK_CHARS) };
      }
    }
    if (ct.includes('html') || raw.trim().startsWith('<')) {
      return { source: url, text: htmlToText(raw).slice(0, MAX_CHUNK_CHARS) };
    }
    return { source: url, text: raw.slice(0, MAX_CHUNK_CHARS) };
  } catch (e: any) {
    return { source: url, text: `[Fetch failed: ${e?.message || 'error'}]` };
  } finally {
    clearTimeout(t);
  }
}

export function githubKnowledgeUrls(repoUrl: string): string[] {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/\#\?]+)/i);
  if (!m) return [repoUrl];
  const owner = m[1];
  const repo = m[2].replace(/\.git$/, '');
  return [
    `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/FILE-PHUC-LONG.md`,
    `https://api.github.com/repos/${owner}/${repo}/contents/`,
  ];
}

export function buildKnowledgeBase(
  parts: { source: string; text: string }[],
  summary: string
): KnowledgeBase {
  const now = new Date().toISOString();
  const chunks = parts
    .filter((p) => p.text && !p.text.startsWith('[Fetch'))
    .slice(0, MAX_CHUNKS)
    .map((p) => ({
      source: p.source,
      text: p.text.slice(0, MAX_CHUNK_CHARS),
      updatedAt: now,
    }));
  return { updatedAt: now, summary: summary.slice(0, 8000), chunks };
}

export function knowledgeSummaryPrompt(blob: string): string {
  return `Bạn là AI Admin của app Long (Phúc Long Center).
Dưới đây là nội dung lấy từ GitHub và các nguồn Boss cung cấp.
Hãy tóm tắt BẰNG TIẾNG VIỆT, có cấu trúc:
1) App làm gì (livestream, store, ranking, chatbot Phúc...)
2) Vai trò user / Pro / Nghệ sĩ / Admin / Boss
3) Luồng chính: đăng nhập, live, mua hàng, tặng quà, đặt lịch
4) Điểm quan trọng khi tư vấn user và khi nhận mệnh lệnh Boss

Nội dung nguồn:
${blob.slice(0, 24000)}`;
}
