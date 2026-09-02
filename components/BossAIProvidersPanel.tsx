'use client';

import { useEffect, useState } from 'react';

type Provider = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  apiKeySet?: boolean;
};

const empty = (): Provider => ({
  id: String(Date.now()),
  name: '',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  enabled: true,
});

export default function BossAIProvidersPanel() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boss/ai-providers');
      const data = await res.json();
      if (res.ok) setProviders(data.providers || []);
      else setMsg(data.error || 'Không tải được');
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
      const res = await fetch('/api/boss/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providers }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error || 'Lưu thất bại');
      else {
        setProviders(data.providers || []);
        setMsg('Đã lưu API AI (tối đa 4). AI Admin dùng các API này khi nhận mệnh lệnh Boss.');
      }
    } catch {
      setMsg('Lỗi lưu');
    } finally {
      setSaving(false);
    }
  };

  const update = (i: number, patch: Partial<Provider>) => {
    setProviders((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  };

  if (loading) {
    return <div className="p-4 text-sm text-black/60">Đang tải API AI…</div>;
  }

  return (
    <section
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
    >
      <div>
        <h3 className="font-bold text-[#1A1A1A]">API AI Admin (tối đa 4)</h3>
        <p className="text-xs text-black/60 mt-1">
          Boss thêm API OpenAI / Anthropic (tương thích) / xAI / Gemini gateway… để AI Admin
          thực thi <strong>mệnh lệnh Boss</strong> (ưu tiên cao nhất) và tóm tắt kiến thức
          GitHub.
        </p>
      </div>

      {providers.map((p, i) => (
        <div
          key={p.id}
          className="rounded-lg border p-3 space-y-2 bg-white"
          style={{ borderColor: '#D4C9B5' }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold">#{i + 1}</span>
            <label className="text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={(e) => update(i, { enabled: e.target.checked })}
              />
              Bật
            </label>
            <button
              type="button"
              className="text-xs text-red-700"
              onClick={() => setProviders((prev) => prev.filter((_, idx) => idx !== i))}
            >
              Xóa
            </button>
          </div>
          <input
            className="w-full border rounded px-2 py-1.5 text-sm"
            placeholder="Tên (OpenAI, xAI…)"
            value={p.name}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <input
            className="w-full border rounded px-2 py-1.5 text-sm"
            placeholder="Base URL https://api.openai.com/v1"
            value={p.baseUrl}
            onChange={(e) => update(i, { baseUrl: e.target.value })}
          />
          <input
            className="w-full border rounded px-2 py-1.5 text-sm"
            placeholder="Model (gpt-4o-mini, …)"
            value={p.model}
            onChange={(e) => update(i, { model: e.target.value })}
          />
          <input
            type="password"
            className="w-full border rounded px-2 py-1.5 text-sm"
            placeholder={p.apiKeySet ? 'Đã có key (nhập mới để thay)' : 'API Key'}
            value={p.apiKey.includes('***') ? '' : p.apiKey}
            onChange={(e) => update(i, { apiKey: e.target.value })}
          />
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={providers.length >= 4}
          onClick={() => setProviders((prev) => [...prev, empty()])}
          className="px-3 py-2 rounded-lg text-sm border font-semibold disabled:opacity-40"
          style={{ borderColor: '#D4C9B5' }}
        >
          + Thêm API ({providers.length}/4)
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: '#8B4513' }}
        >
          {saving ? 'Đang lưu…' : 'Lưu API'}
        </button>
      </div>
      {msg && <p className="text-xs text-black/70 whitespace-pre-wrap">{msg}</p>}
    </section>
  );
}
