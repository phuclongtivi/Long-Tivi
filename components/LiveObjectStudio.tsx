'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clampOverlay,
  loadLiveOverlays,
  saveLiveOverlays,
  smoothDetections,
  type LiveOverlayItem,
  type VisionDetection,
} from '@/lib/liveOverlays';

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
  roomKey?: string;
  onOverlaysChange?: (items: LiveOverlayItem[]) => void;
};

function captureFrame(video: HTMLVideoElement) {
  if (!video.videoWidth || !video.videoHeight) return null;
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 960 / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
}

export default function LiveObjectStudio({ videoRef, roomKey = 'draft', onOverlaysChange }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<LiveOverlayItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [detections, setDetections] = useState<VisionDetection[]>([]);
  const [provider, setProvider] = useState<'auto' | 'openai' | 'gemini'>('auto');
  const [autoScan, setAutoScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('Sẵn sàng nhận diện');

  useEffect(() => setItems(loadLiveOverlays(roomKey)), [roomKey]);
  useEffect(() => {
    if (!items.length) return;
    saveLiveOverlays(items, roomKey);
    onOverlaysChange?.(items);
  }, [items, roomKey, onOverlaysChange]);

  const update = (id: string, patch: Partial<LiveOverlayItem>) => {
    setItems((list) => list.map((x) => (x.id === id ? clampOverlay({ ...x, ...patch }) : x)));
  };

  const scan = useCallback(async () => {
    const video = videoRef.current;
    if (!video || scanning) return;
    const imageDataUrl = captureFrame(video);
    if (!imageDataUrl) return setStatus('Camera chưa có hình');
    setScanning(true);
    try {
      const res = await fetch('/api/live/vision/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không nhận diện được');
      setDetections((old) => {
        const tracked = smoothDetections(old, data.detections || []);
        setItems((current) => current.map((item) => {
          const anchor = item.attachedDetectionId ? tracked.find((d) => d.id === item.attachedDetectionId) : undefined;
          return anchor ? clampOverlay({ ...item, x: anchor.box.x + anchor.box.width + 1, y: anchor.box.y }) : item;
        }));
        return tracked;
      });
      setStatus(`${data.provider}: ${data.detections?.length || 0} vật thể`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Lỗi nhận diện');
    } finally {
      setScanning(false);
    }
  }, [provider, scanning, videoRef]);

  useEffect(() => {
    if (!autoScan) return;
    void scan();
    const timer = window.setInterval(() => void scan(), 5000);
    return () => window.clearInterval(timer);
  }, [autoScan, scan]);

  const startDrag = (event: React.PointerEvent, item: LiveOverlayItem) => {
    event.preventDefault();
    setSelectedId(item.id);
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, ox: item.x, oy: item.y };
    const move = (e: PointerEvent) => update(item.id, {
      x: start.ox + ((e.clientX - start.x) / rect.width) * 100,
      y: start.oy + ((e.clientY - start.y) / rect.height) * 100,
    });
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const selected = items.find((x) => x.id === selectedId);
  return (
    <section className="pl-vision-panel space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold">Vật phẩm & AI Vision</p>
          <p className="text-[10px] opacity-65">Kéo vật phẩm trực tiếp trên khung. AI tìm và bám theo vật thể thật.</p>
        </div>
        <button type="button" onClick={() => void scan()} disabled={scanning} className="pl-holo-button rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50">
          {scanning ? 'Đang quét…' : 'Quét vật thể'}
        </button>
      </div>

      <div ref={stageRef} className="relative aspect-video overflow-hidden rounded-xl bg-black/90 touch-none">
        {detections.map((hit) => (
          <button key={hit.id} type="button" onClick={() => {
            const target = items.find((x) => x.kind === 'product');
            if (target) update(target.id, { attachedDetectionId: hit.id, x: hit.box.x + hit.box.width, y: hit.box.y });
          }} title="Chạm để gắn thẻ sản phẩm" className="absolute border-2 border-lime-400 bg-lime-300/10 text-left text-[9px] font-bold text-white"
            style={{ left: `${hit.box.x}%`, top: `${hit.box.y}%`, width: `${hit.box.width}%`, height: `${hit.box.height}%` }}>
            <span className="bg-black/70 px-1">{hit.label} {Math.round(hit.confidence * 100)}%</span>
          </button>
        ))}
        {items.filter((x) => x.visible).map((item) => {
          const anchor = item.attachedDetectionId ? detections.find((d) => d.id === item.attachedDetectionId) : undefined;
          const x = anchor ? Math.min(100 - item.width, anchor.box.x + anchor.box.width + 1) : item.x;
          const y = anchor ? Math.min(100 - item.height, anchor.box.y) : item.y;
          return (
            <button key={item.id} type="button" onPointerDown={(e) => startDrag(e, item)} className={`pl-vision-tag absolute flex select-none items-center justify-center rounded-lg px-2 text-center text-[10px] font-black ${selectedId === item.id ? 'is-selected' : ''} ${item.kind === 'product' ? 'is-product' : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, width: `${item.width}%`, height: `${item.height}%`, transform: `rotate(${item.rotation}deg)` }}>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.label} className="h-full w-full object-contain" /> : item.text || item.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button type="button" onClick={() => setItems((v) => [...v, { id: crypto.randomUUID(), label: 'Vật phẩm mới', kind: 'text', text: 'Nhãn mới', x: 35, y: 35, width: 25, height: 12, rotation: 0, visible: true }])} className="pl-holo-button rounded-lg p-2 font-bold">+ Thêm vật phẩm</button>
        <select value={provider} onChange={(e) => setProvider(e.target.value as typeof provider)} className="pl-field rounded-lg p-2">
          <option value="auto">AI tự chọn</option><option value="openai">OpenAI Vision</option><option value="gemini">Gemini Vision</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={autoScan} onChange={(e) => setAutoScan(e.target.checked)} /> Tự quét và bám theo mỗi 5 giây</label>
      <p className="text-[10px] opacity-65">{status}. Chạm khung xanh để gắn thẻ sản phẩm vào vật thể.</p>

      {selected && <div className="pl-vision-editor space-y-2 p-2 text-xs">
        <input value={selected.text || ''} onChange={(e) => update(selected.id, { text: e.target.value })} placeholder="Nội dung vật phẩm" className="pl-field w-full rounded p-2" />
        <label className="flex items-center gap-2">Kích thước <input type="range" min="10" max="70" value={selected.width} onChange={(e) => update(selected.id, { width: Number(e.target.value) })} className="flex-1" /></label>
        <label className="flex items-center gap-2">Xoay <input type="range" min="-180" max="180" value={selected.rotation} onChange={(e) => update(selected.id, { rotation: Number(e.target.value) })} className="flex-1" /></label>
        <div className="flex gap-2"><button type="button" onClick={() => update(selected.id, { visible: !selected.visible })} className="pl-mini-button rounded px-2 py-1">{selected.visible ? 'Ẩn' : 'Hiện'}</button><button type="button" onClick={() => update(selected.id, { attachedDetectionId: undefined })} className="pl-mini-button rounded px-2 py-1">Bỏ bám</button><button type="button" onClick={() => setItems((v) => v.filter((x) => x.id !== selected.id))} className="pl-mini-button is-danger rounded px-2 py-1">Xóa</button></div>
      </div>}
    </section>
  );
}
