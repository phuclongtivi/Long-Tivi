import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import type { VisionDetection } from '@/lib/liveOverlays';

export const runtime = 'nodejs';
const MAX_IMAGE_CHARS = 2_000_000;

const schema = {
  type: 'object', additionalProperties: false,
  properties: { detections: { type: 'array', maxItems: 12, items: { type: 'object', additionalProperties: false, properties: {
    label: { type: 'string' }, confidence: { type: 'number' }, kind: { type: 'string', enum: ['product', 'person', 'object', 'text', 'other'] },
    box: { type: 'object', additionalProperties: false, properties: { x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } }, required: ['x', 'y', 'width', 'height'] },
  }, required: ['label', 'confidence', 'kind', 'box'] } } }, required: ['detections'],
};

function normalize(raw: any): VisionDetection[] {
  return (Array.isArray(raw?.detections) ? raw.detections : []).slice(0, 12).map((d: any, i: number) => ({
    id: `vision-${i}-${String(d.label || 'object').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    label: String(d.label || 'Vật thể').slice(0, 60), confidence: Math.min(1, Math.max(0, Number(d.confidence) || 0.5)),
    kind: ['product', 'person', 'object', 'text', 'other'].includes(d.kind) ? d.kind : 'other',
    box: { x: Math.min(98, Math.max(0, Number(d.box?.x) || 0)), y: Math.min(98, Math.max(0, Number(d.box?.y) || 0)), width: Math.min(100, Math.max(2, Number(d.box?.width) || 10)), height: Math.min(100, Math.max(2, Number(d.box?.height) || 10)) },
  }));
}

const prompt = 'Phát hiện tối đa 12 người, sản phẩm và vật thể chính. Tọa độ box là phần trăm 0-100 của ảnh: x,y góc trái; width,height. Không đoán thương hiệu hoặc giá. Nhãn tiếng Việt ngắn.';

async function openAi(imageDataUrl: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY chưa cấu hình');
  const res = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({
    model: process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini', store: false,
    input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }, { type: 'input_image', image_url: imageDataUrl, detail: 'low' }] }],
    text: { format: { type: 'json_schema', name: 'live_object_detections', strict: true, schema } }, max_output_tokens: 900,
  }) });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  const text = data.output_text || data.output?.flatMap((x: any) => x.content || []).find((x: any) => x.type === 'output_text')?.text;
  return normalize(JSON.parse(text || '{"detections":[]}'));
}

async function gemini(imageDataUrl: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY chưa cấu hình');
  const [meta, base64] = imageDataUrl.split(',');
  const mime = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const endpoint = process.env.GEMINI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta';
  const res = await fetch(`${endpoint}/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
    contents: [{ parts: [{ text: `${prompt}\nChỉ trả JSON: {"detections":[{"label":"","confidence":0.0,"kind":"object","box":{"x":0,"y":0,"width":0,"height":0}}]}` }, { inlineData: { mimeType: mime, data: base64 } }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 900 },
  }) });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  return normalize(JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || '{"detections":[]}'));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Bạn cần đăng nhập' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const image = String(body.imageDataUrl || '');
  if (!image.startsWith('data:image/') || image.length > MAX_IMAGE_CHARS) return NextResponse.json({ error: 'Ảnh không hợp lệ hoặc quá lớn' }, { status: 400 });
  const requested = body.provider === 'gemini' ? 'gemini' : body.provider === 'openai' ? 'openai' : process.env.LIVE_VISION_PROVIDER || 'auto';
  try {
    if (requested === 'gemini') return NextResponse.json({ provider: 'Gemini', detections: await gemini(image) });
    if (requested === 'openai') return NextResponse.json({ provider: 'OpenAI', detections: await openAi(image) });
    if (process.env.OPENAI_API_KEY) return NextResponse.json({ provider: 'OpenAI', detections: await openAi(image) });
    if (process.env.GEMINI_API_KEY) return NextResponse.json({ provider: 'Gemini', detections: await gemini(image) });
    throw new Error('Chưa cấu hình OPENAI_API_KEY hoặc GEMINI_API_KEY');
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Vision API lỗi' }, { status: 502 });
  }
}
