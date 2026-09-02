/**
 * Chia sẻ màn hình laptop cho người tổ chức livestream
 * getDisplayMedia → track video thay / thêm vào stream live
 */

export async function startScreenShare(): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Thiết bị không hỗ trợ chia sẻ màn hình');
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    } as MediaTrackConstraints,
    audio: true,
  });
  return stream;
}

/** Gắn track màn hình vào RTCPeerConnection (WHIP) hoặc preview local */
export async function replaceVideoWithScreen(
  pc: RTCPeerConnection | null,
  screenStream: MediaStream,
  localPreview?: HTMLVideoElement | null
): Promise<MediaStreamTrack | null> {
  const track = screenStream.getVideoTracks()[0];
  if (!track) return null;
  if (localPreview) {
    localPreview.srcObject = screenStream;
  }
  if (pc) {
    const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
    if (sender) await sender.replaceTrack(track);
  }
  track.onended = () => {
    /* user bấm Stop sharing trên trình duyệt */
  };
  return track;
}
