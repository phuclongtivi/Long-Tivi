/**
 * Tự chọn ràng buộc camera tốt nhất mà thiết bị hỗ trợ:
 * chống rung, lấy nét liên tục, phơi sáng, cân bằng trắng, độ phân giải HD…
 * applyAdvancedSettings gọi sau getUserMedia để bật từng capability nếu có.
 */

export type BestCameraOpts = {
  deviceId?: string;
  facingMode?: 'user' | 'environment';
  preferWidth?: number;
  preferHeight?: number;
  preferFps?: number;
};

/** Constraints lý tưởng — browser bỏ qua key không hỗ trợ */
export function buildBestVideoConstraints(opts: BestCameraOpts = {}): MediaTrackConstraints {
  const width = opts.preferWidth ?? 1920;
  const height = opts.preferHeight ?? 1080;
  const fps = opts.preferFps ?? 30;

  const base: MediaTrackConstraints = {
    width: { ideal: width, min: 1280 },
    height: { ideal: height, min: 720 },
    frameRate: { ideal: fps, min: 24 },
    aspectRatio: { ideal: width / height },
    // Một số engine nhận resizeMode / facingMode
    // @ts-expect-error — advanced / non-standard keys
    resizeMode: 'none',
  };

  if (opts.deviceId) {
    base.deviceId = { exact: opts.deviceId };
  } else if (opts.facingMode) {
    base.facingMode = { ideal: opts.facingMode };
  } else {
    base.facingMode = { ideal: 'user' };
  }

  return base;
}

export function buildBestAudioConstraints(): MediaTrackConstraints {
  return {
    echoCancellation: { ideal: true },
    noiseSuppression: { ideal: true },
    autoGainControl: { ideal: true },
    channelCount: { ideal: 1 },
    // @ts-expect-error
    sampleRate: { ideal: 48000 },
  };
}

type CapBool = ConstrainBoolean | boolean | string | undefined;

/**
 * Sau khi có track: bật ổn định hình, AF, AE, AWB nếu hardware hỗ trợ.
 * Không throw — từng bước try/catch riêng.
 */
export async function applyAdvancedTrackSettings(stream: MediaStream): Promise<{
  applied: string[];
  skipped: string[];
}> {
  const applied: string[] = [];
  const skipped: string[] = [];
  const track = stream.getVideoTracks()[0];
  if (!track) return { applied, skipped };

  const caps =
    typeof track.getCapabilities === 'function'
      ? (track.getCapabilities() as Record<string, unknown>)
      : {};

  const tryApply = async (label: string, patch: Record<string, unknown>) => {
    try {
      // Chỉ apply nếu capability tồn tại (khi browser báo)
      const key = Object.keys(patch)[0];
      if (key && !(key in caps) && Object.keys(caps).length > 0) {
        skipped.push(label);
        return;
      }
      await track.applyConstraints({ advanced: [patch as any] } as MediaTrackConstraints);
      applied.push(label);
    } catch {
      try {
        await track.applyConstraints(patch as MediaTrackConstraints);
        applied.push(label);
      } catch {
        skipped.push(label);
      }
    }
  };

  // Chống rung / ổn định hình (Chrome Android, một số desktop)
  await tryApply('chống rung', { stabilizationMode: 'stabilization' });
  await tryApply('chống rung (points)', {
    // @ts-expect-error non-standard
    pointsOfInterest: undefined,
  });
  // Một số bản dùng imageStabilization boolean
  await tryApply('imageStabilization', {
    // @ts-expect-error
    imageStabilization: true,
  });

  // Lấy nét liên tục
  await tryApply('lấy nét liên tục', { focusMode: 'continuous' });

  // Phơi sáng tự động
  await tryApply('phơi sáng tự động', { exposureMode: 'continuous' });

  // Cân bằng trắng
  await tryApply('cân bằng trắng', { whiteBalanceMode: 'continuous' });

  // Giảm rung nhẹ qua frameRate ổn định (đã ideal trong constraints)

  return { applied, skipped };
}

/** getUserMedia với constraints tốt nhất + apply advanced */
export async function getBestUserMedia(opts: BestCameraOpts = {}): Promise<{
  stream: MediaStream;
  applied: string[];
  skipped: string[];
}> {
  const video = buildBestVideoConstraints(opts);
  const audio = buildBestAudioConstraints();

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video, audio });
  } catch {
    // Fallback thấp hơn
    stream = await navigator.mediaDevices.getUserMedia({
      video: opts.deviceId
        ? { deviceId: { exact: opts.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    });
  }

  const { applied, skipped } = await applyAdvancedTrackSettings(stream);
  return { stream, applied, skipped };
}
