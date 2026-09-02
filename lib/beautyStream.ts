/**
 * Pipeline: camera MediaStream → canvas (filter) → captureStream
 * để người xem nhận hình đã làm đẹp, không chỉ preview local.
 */

export type BeautyParams = {
  on: boolean;
  smooth: number; // 0-100
  bright: number;
  warm: number;
  pink: number;
  contrast: number;
};

export function buildCssFilter(p: BeautyParams): string {
  if (!p.on) return 'none';
  const parts = [
    `brightness(${1 + p.bright / 100})`,
    `contrast(${1 + p.contrast / 100})`,
    `saturate(${1 + p.pink / 50})`,
    `sepia(${p.warm / 200})`,
  ];
  if (p.smooth > 0) parts.push(`blur(${(p.smooth / 100) * 0.55}px)`);
  return parts.join(' ');
}

/**
 * Tạo stream đã filter từ video element nguồn.
 * Gọi stop() để hủy rAF + tracks canvas.
 */
export function createBeautyPipeline(
  sourceVideo: HTMLVideoElement,
  sourceStream: MediaStream,
  getParams: () => BeautyParams,
  fps = 30,
  drawOverlay?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
): { stream: MediaStream; stop: () => void; canvas: HTMLCanvasElement } {
  const canvas = document.createElement('canvas');
  const w = sourceVideo.videoWidth || 1280;
  const h = sourceVideo.videoHeight || 720;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false })!;

  let raf = 0;
  let running = true;

  const draw = () => {
    if (!running) return;
    const pw = sourceVideo.videoWidth || canvas.width;
    const ph = sourceVideo.videoHeight || canvas.height;
    if (pw && ph && (canvas.width !== pw || canvas.height !== ph)) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const p = getParams();
    ctx.filter = buildCssFilter(p);
    ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
    drawOverlay?.(ctx, canvas.width, canvas.height);
    raf = requestAnimationFrame(draw);
  };

  // Đợi video có frame
  const startDraw = () => {
    if (sourceVideo.readyState >= 2) draw();
    else sourceVideo.addEventListener('loadeddata', () => draw(), { once: true });
  };
  startDraw();

  const canvasStream = canvas.captureStream(fps);
  const audioTracks = sourceStream.getAudioTracks();
  const out = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioTracks.map((t) => t.clone()),
  ]);

  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    canvasStream.getTracks().forEach((t) => t.stop());
    out.getTracks().forEach((t) => {
      if (t.kind === 'video') t.stop();
    });
  };

  return { stream: out, stop, canvas };
}
