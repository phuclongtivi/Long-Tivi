'use client';

/**
 * Boss dashboard — nguồn kiến thức AI Admin (GitHub + links) + Khởi chạy học
 */

import { useEffect, useState } from 'react';

type Sources = {
  githubUrl: string;
  links: string[];
  githubTokenSet?: boolean;
  lastRunAt: string | null;
  status: 'idle' | 'running' | 'ready' | 'error';
  lastError?: string | null;
  summary?: string | null;
};

export default function BossKnowledgePanel() {
  const [githubUrl, setGithubUrl] = useState('');
  const [linksText, setLinksText] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [sources, setSources] = useState<Sources | null>(null);
  const [chunkCount, setChunkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boss/knowledge');
      const data = await res.json();
      if (res.ok) {
        setSources(data.sources);
        setGithubUrl(data.sources?.githubUrl || '');
        setLinksText((data.sources?.links || []).join('\n'));
        setChunkCount(data.knowledge?.chunkCount || 0);
      } else {
        setMsg(data.error || 'Không tải được');
      }
    } catch {
      setMsg('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const links = linksText
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      const body: any = { githubUrl, links };
      if (githubToken.trim()) body.githubToken = githubToken.trim();
      const res = await fetch('/api/boss/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Lưu thất bại');
      } else {
        setSources(data.sources);
        setMsg('Đã lưu nguồn kiến thức');
        setGithubToken('');
      }
    } catch {
      setMsg('Lỗi lưu');
    } finally {
      setSaving(false);
    }
  };

  const run = async () => {
    setRunning(true);
    setMsg('AI Admin đang học từ GitHub và các link…');
    try {
      // save first
      await save();
      const res = await fetch('/api/boss/knowledge/run', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Khởi chạy thất bại');
        if (data.sources) setSources(data.sources);
      } else {
        setSources(data.sources);
        setChunkCount(data.chunkCount || 0);
        setMsg(
          `Đã học xong · ${data.chunkCount || 0} đoạn kiến thức` +
            (data.summaryPreview ? `\n${data.summaryPreview.slice(0, 200)}…` : '')
        );
      }
    } catch {
      setMsg('Lỗi khởi chạy');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-black/60">Đang tải nguồn kiến thức…</div>
    );
  }

  const statusLabel: Record<string, string> = {
    idle: 'Chưa chạy',
    running: 'Đang học…',
    ready: 'Sẵn sàng',
    error: 'Lỗi',
  };

  return (
    <section
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
    >
      <div>
        <h3 className="font-bold text-[#1A1A1A]">Kiến thức AI Admin</h3>
        <p className="text-xs text-black/60 mt-1">
          Dán link GitHub repo code app Long và các nguồn kiến thức khác. Bấm{' '}
          <strong>Khởi chạy</strong> để AI Admin tự học cách vận hành app, phục
          vụ mệnh lệnh Boss và tư vấn user. Tự cập nhật định kỳ (cron ~12 giờ).
        </p>
      </div>

      <label className="block text-xs font-semibold text-black/70">
        GitHub repo
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-white"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
          placeholder="https://github.com/org/long-app"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </label>

      <label className="block text-xs font-semibold text-black/70">
        GitHub token (repo private — tùy chọn)
        <input
          type="password"
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-white"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
          placeholder={
            sources?.githubTokenSet ? 'Đã lưu token (nhập mới để thay)' : 'ghp_…'
          }
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
        />
      </label>

      <label className="block text-xs font-semibold text-black/70">
        Link kiến thức khác (mỗi dòng 1 URL, tối đa 10)
        <textarea
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-white min-h-[88px]"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
          placeholder={'https://phuclongtivi.com/\nhttps://...'}
          value={linksText}
          onChange={(e) => setLinksText(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={save}
          disabled={saving || running}
          className="px-3 py-2 rounded-lg text-sm font-semibold border disabled:opacity-50"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
        >
          {saving ? 'Đang lưu…' : 'Lưu nguồn'}
        </button>
        <button
          type="button"
          onClick={run}
          disabled={running || saving}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: '#8B4513' }}
        >
          {running ? 'Đang học…' : 'Khởi chạy'}
        </button>
        <span className="text-xs text-black/55">
          Trạng thái:{' '}
          <strong>{statusLabel[sources?.status || 'idle']}</strong>
          {sources?.lastRunAt
            ? ` · ${new Date(sources.lastRunAt).toLocaleString('vi-VN')}`
            : ''}
          {chunkCount ? ` · ${chunkCount} đoạn` : ''}
        </span>
      </div>

      {sources?.lastError && (
        <p className="text-xs text-red-700">{sources.lastError}</p>
      )}
      {msg && (
        <p className="text-xs whitespace-pre-wrap text-black/70">{msg}</p>
      )}
      {sources?.summary && sources.status === 'ready' && (
        <details className="text-xs text-black/70">
          <summary className="cursor-pointer font-semibold">Xem tóm tắt kiến thức</summary>
          <p className="mt-2 whitespace-pre-wrap">{sources.summary}</p>
        </details>
      )}
    </section>
  );
}
