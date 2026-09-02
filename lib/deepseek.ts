/**
 * DeepSeek V4 Flash (OpenAI-compatible API)
 * Key: env DEEPSEEK_API_KEY hoặc AppSetting deepseek_chat_config (Boss dashboard)
 */

import { prisma } from '@/lib/prisma';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function resolveDeepSeekConfig(): Promise<{
  apiKey: string;
  base: string;
  model: string;
  enabled: boolean;
}> {
  let apiKey = process.env.DEEPSEEK_API_KEY || '';
  let base = (process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com').replace(/\/$/, '');
  let model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  let enabled = true;

  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: 'deepseek_chat_config' },
    });
    if (row?.value) {
      const j = JSON.parse(row.value);
      if (j.apiKey) apiKey = String(j.apiKey);
      if (j.baseUrl) base = String(j.baseUrl).replace(/\/$/, '');
      if (j.model) model = String(j.model);
      if (j.enabled === false) enabled = false;
    }
  } catch {
    /* ignore */
  }

  return { apiKey, base, model, enabled };
}

export async function callDeepSeekChat(params: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; model: string } | { error: string }> {
  const cfg = await resolveDeepSeekConfig();
  if (!cfg.enabled) return { error: 'DeepSeek đang tắt (Boss dashboard)' };
  if (!cfg.apiKey) return { error: 'DEEPSEEK_API_KEY chưa cấu hình' };

  try {
    const res = await fetch(`${cfg.base}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.4,
        max_tokens: params.maxTokens ?? 800,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        error:
          data?.error?.message ||
          data?.message ||
          `DeepSeek HTTP ${res.status}`,
      };
    }
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { error: 'DeepSeek không trả nội dung' };
    return { text, model: data.model || cfg.model };
  } catch (e: any) {
    return { error: e?.message || 'Lỗi gọi DeepSeek' };
  }
}
