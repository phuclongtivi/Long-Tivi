'use client';

/**
 * Boss: gắn API key DeepSeek + giới hạn câu trả lời Phúc / ngày
 */

import { useEffect, useState } from 'react';

export default function BossChatbotAiPanel() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySet, setApiKeySet] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com');
  const [model, setModel] = useState('deepseek-chat');
  const [enabled, setEnabled] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(4);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boss/chatbot-ai');
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Không tải được (chỉ Boss)');
        return;
      }
      setApiKeySet(!!data.deepseek?.apiKeySet);
      setBaseUrl(data.deepseek?.baseUrl || 'https://api.deepseek.com');
      setModel(data.deepseek?.model || 'deepseek-chat');
      setEnabled(data.deepseek?.enabled !== false);
      setDailyLimit(data.dailyLimit || 4);
      setApiKey(''); // không hiện key đầy đủ
      setMsg('');
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
      const res = await fetch('/api/boss/chatbot-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          baseUrl,
          model,
          enabled,
          dailyLimit,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Lưu thất bại');
      } else {
        setMsg(data.message || 'Đã lưu');
        setApiKeySet(!!data.deepseek?.apiKeySet);
        setApiKey('');
        setDailyLimit(data.dailyLimit ?? dailyLimit);
      }
    } catch {
      setMsg('Lỗi lưu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-black/60 rounded-xl border" style={{ borderColor: '#D4C9B5' }}>
        Đang tải cấu hình chatbot Phúc…
      </div>
    );
  }

  return (
    <section
      className="rounded-xl border p-4 space-y-3"
      style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5' }}
    >
      <div>
        <h3 className="font-bold text-[#1A1A1A]">Chatbot Phúc — DeepSeek API</h3>
        <p className="text-xs text-black/60 mt-1">
          Gắn / đổi API key DeepSeek và giới hạn số câu trả lời mỗi user mỗi ngày. Key được che khi
          hiển thị; để trống ô key khi lưu = giữ key cũ.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Bật DeepSeek cho Phúc
      </label>

      <div>
        <label className="text-xs font-semibold block mb-1">API Key DeepSeek</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={apiKeySet ? 'Đã có key — nhập key mới để thay' : 'sk-...'}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: '#D4C9B5', backgroundColor: '#fff' }}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold block mb-1">Base URL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            style={{ borderColor: '#D4C9B5' }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Model</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="deepseek-chat"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            style={{ borderColor: '#D4C9B5' }}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1">
          Giới hạn câu trả lời / user / ngày
        </label>
        <input
          type="number"
          min={1}
          max={500}
          value={dailyLimit}
          onChange={(e) => setDailyLimit(Number(e.target.value) || 4)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: '#D4C9B5' }}
        />
        <p className="text-[11px] text-black/50 mt-1">Boss / Admin không bị giới hạn này.</p>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        {saving ? 'Đang lưu…' : 'Lưu cấu hình Phúc + DeepSeek'}
      </button>
      {msg && <p className="text-xs font-semibold whitespace-pre-wrap">{msg}</p>}
    </section>
  );
}
