/**
 * Livestream quality — phát (capture) + xem (ABR / chọn độ phân giải kiểu YouTube)
 */

export const LIVE_QUALITY = {
  bitrate: {
    video1080: 5_500_000,
    video720: 3_000_000,
    video480: 1_400_000,
    video360: 800_000,
    audio: 160_000,
  },
  hlsConfig: {
    enableWorker: true,
    lowLatencyMode: true,
    abrEwmaDefaultEstimate: 5_000_000,
    abrBandWidthFactor: 0.85,
    capLevelToPlayerSize: true,
    startLevel: -1, // ABR auto
  },
} as const;

/** Tùy chọn chất lượng phía người xem (menu player) */
export const VIEWER_QUALITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'auto', label: 'Tự động' },
  { value: '1080', label: '1080p' },
  { value: '720', label: '720p' },
  { value: '480', label: '480p' },
  { value: '360', label: '360p' },
];

export function buildCaptureConstraints(
  facing: 'user' | 'environment' = 'user',
  deviceId?: string
): MediaStreamConstraints {
  const video: MediaTrackConstraints = {
    width: { ideal: 1920, min: 1280 },
    height: { ideal: 1080, min: 720 },
    frameRate: { ideal: 30, min: 24 },
    facingMode: facing,
  };
  if (deviceId) video.deviceId = { exact: deviceId };
  return {
    video,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  };
}

export async function applyHighBitrate(
  pc: RTCPeerConnection,
  prefer1080 = true
): Promise<void> {
  const maxBitrate = prefer1080
    ? LIVE_QUALITY.bitrate.video1080
    : LIVE_QUALITY.bitrate.video720;
  for (const sender of pc.getSenders()) {
    if (sender.track?.kind !== 'video') continue;
    const params = sender.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];
    params.encodings[0].maxBitrate = maxBitrate;
    params.encodings[0].maxFramerate = 30;
    try {
      await sender.setParameters(params);
    } catch {
      /* ignore */
    }
  }
}
