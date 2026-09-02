export type LiveOverlayItem = {
  id: string;
  label: string;
  kind: 'text' | 'image' | 'product';
  text?: string;
  imageUrl?: string;
  href?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  attachedDetectionId?: string;
};

export type VisionDetection = {
  id: string;
  label: string;
  confidence: number;
  kind: 'product' | 'person' | 'object' | 'text' | 'other';
  box: { x: number; y: number; width: number; height: number };
};

export const DEFAULT_LIVE_OVERLAYS: LiveOverlayItem[] = [
  {
    id: 'product-card',
    label: 'Thẻ sản phẩm',
    kind: 'product',
    text: 'Xem sản phẩm',
    href: '/store',
    x: 68,
    y: 68,
    width: 27,
    height: 13,
    rotation: 0,
    visible: true,
  },
];

export function clampOverlay(item: LiveOverlayItem): LiveOverlayItem {
  const width = Math.min(80, Math.max(10, item.width));
  const height = Math.min(60, Math.max(7, item.height));
  return {
    ...item,
    width,
    height,
    x: Math.min(100 - width, Math.max(0, item.x)),
    y: Math.min(100 - height, Math.max(0, item.y)),
  };
}

export function loadLiveOverlays(roomKey = 'draft'): LiveOverlayItem[] {
  if (typeof window === 'undefined') return DEFAULT_LIVE_OVERLAYS;
  try {
    const value = localStorage.getItem(`pl.live-overlays.v2.${roomKey}`);
    return value ? (JSON.parse(value) as LiveOverlayItem[]) : DEFAULT_LIVE_OVERLAYS;
  } catch {
    return DEFAULT_LIVE_OVERLAYS;
  }
}

export function saveLiveOverlays(items: LiveOverlayItem[], roomKey = 'draft') {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`pl.live-overlays.v2.${roomKey}`, JSON.stringify(items));
}

export function smoothDetections(previous: VisionDetection[], next: VisionDetection[]) {
  return next.map((hit) => {
    const old = previous.find((p) => p.label.toLowerCase() === hit.label.toLowerCase());
    if (!old) return hit;
    const mix = (a: number, b: number) => a * 0.55 + b * 0.45;
    return {
      ...hit,
      id: old.id,
      box: {
        x: mix(old.box.x, hit.box.x),
        y: mix(old.box.y, hit.box.y),
        width: mix(old.box.width, hit.box.width),
        height: mix(old.box.height, hit.box.height),
      },
    };
  });
}
