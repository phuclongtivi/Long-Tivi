'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from './LanguageProvider';
import LiveObjectStudio from './LiveObjectStudio';
import type { LiveOverlayItem } from '@/lib/liveOverlays';

export default function LiveStreamer() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [isLive, setIsLive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [webRTCUrl, setWebRTCUrl] = useState('');
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [scheduledStartAt, setScheduledStartAt] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requireIdCard, setRequireIdCard] = useState(false);
  const [hasReward, setHasReward] = useState(false);
  const [requiresTicket, setRequiresTicket] = useState(false);
  const [ticketHint, setTicketHint] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const beautyStopRef = useRef<(() => void) | null>(null);
  const beautyParamsRef = useRef({ on: true, smooth: 40, bright: 8, warm: 10, pink: 6, contrast: 5 });
  const overlaysRef = useRef<LiveOverlayItem[]>([]);
  const [screenSharing, setScreenSharing] = useState(false);
  // Làm đẹp hình (preview) — CSS filter trên camera local
  const [beautyOn, setBeautyOn] = useState(true);
  const [smooth, setSmooth] = useState(40);      // 0-100 → blur nhẹ
  const [bright, setBright] = useState(8);       // % brightness boost
  const [warm, setWarm] = useState(10);          // sepia / ấm
  const [pink, setPink] = useState(6);           // saturate hồng hào
  const [contrast, setContrast] = useState(5);   // contrast nhẹ

  const onOverlaysChange = useCallback((items: LiveOverlayItem[]) => {
    overlaysRef.current = items;
  }, []);

  const drawStreamOverlays = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    for (const item of overlaysRef.current.filter((x) => x.visible)) {
      const x = item.x / 100 * w, y = item.y / 100 * h, iw = item.width / 100 * w, ih = item.height / 100 * h;
      ctx.save(); ctx.translate(x + iw / 2, y + ih / 2); ctx.rotate(item.rotation * Math.PI / 180);
      ctx.fillStyle = item.kind === 'product' ? 'rgba(220,38,38,.94)' : 'rgba(255,255,255,.9)';
      ctx.beginPath(); ctx.roundRect(-iw / 2, -ih / 2, iw, ih, Math.min(18, ih / 4)); ctx.fill();
      ctx.fillStyle = item.kind === 'product' ? '#fff' : '#111'; ctx.font = `700 ${Math.max(14, Math.round(ih * .28))}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((item.text || item.label).slice(0, 40), 0, 0, iw - 12); ctx.restore();
    }
  }, []);



  // Đồng bộ params cho pipeline canvas (người xem nhận filter)
  useEffect(() => {
    beautyParamsRef.current = {
      on: beautyOn,
      smooth,
      bright,
      warm,
      pink,
      contrast,
    };
  }, [beautyOn, smooth, bright, warm, pink, contrast]);


  // Khi đang live: bật/tắt làm đẹp → dựng lại pipeline gửi đi
  useEffect(() => {
    if (!isLive || screenSharing || !rawStreamRef.current || !videoRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        await attachCameraStream(rawStreamRef.current!, beautyOn);
      } catch {
        /* ignore */
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beautyOn, isLive, screenSharing]);

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) setSelectedDeviceId(videoDevices[0].deviceId);
      } catch (err) {
        console.error('Không lấy được danh sách thiết bị:', err);
      }
    }
    getDevices();
  }, []);


  const stopBeautyPipeline = () => {
    beautyStopRef.current?.();
    beautyStopRef.current = null;
  };

  /** Gắn camera raw → preview + (nếu beauty) canvas stream gửi đi */
  const attachCameraStream = async (raw: MediaStream, applyBeauty: boolean) => {
    stopBeautyPipeline();
    rawStreamRef.current?.getTracks().forEach((tr) => {
      if (!raw.getTracks().includes(tr)) tr.stop();
    });
    rawStreamRef.current = raw;

    if (videoRef.current) {
      videoRef.current.srcObject = raw;
      try {
        await videoRef.current.play();
      } catch {
        /* autoplay */
      }
    }

    if (applyBeauty && beautyParamsRef.current.on) {
      // Đợi có kích thước video
      await new Promise<void>((resolve) => {
        const v = videoRef.current;
        if (!v) return resolve();
        if (v.videoWidth > 0) return resolve();
        v.addEventListener('loadeddata', () => resolve(), { once: true });
        setTimeout(() => resolve(), 800);
      });
      try {
        const { createBeautyPipeline } = await import('@/lib/beautyStream');
        if (videoRef.current) {
          const pipe = createBeautyPipeline(
            videoRef.current,
            raw,
            () => beautyParamsRef.current,
            30,
            drawStreamOverlays
          );
          beautyStopRef.current = pipe.stop;
          mediaStreamRef.current = pipe.stream;
          return pipe.stream;
        }
      } catch (e) {
        console.error('beauty pipeline', e);
      }
    }
    mediaStreamRef.current = raw;
    return raw;
  };

  const startLive = async () => {
    if (!session?.user) {
      alert('Bạn cần đăng nhập để livestream');
      return;
    }
    try {
      // Tự dùng khả năng camera tốt nhất: HD, chống rung, AF/AE/AWB (nếu thiết bị hỗ trợ)
      const { getBestUserMedia } = await import('@/lib/cameraBest');
      const best = await getBestUserMedia({
        deviceId: selectedDeviceId || undefined,
        facingMode: 'user',
        preferWidth: 1920,
        preferHeight: 1080,
        preferFps: 30,
      });
      if (best.applied.length) {
        console.info('[camera] đã bật:', best.applied.join(', '));
      }
      await attachCameraStream(best.stream, true);

      const res = await fetch('/api/live/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `Live của ${session.user.name}`,
          deviceId: selectedDeviceId,
          scheduledStartAt: scheduledStartAt ? new Date(scheduledStartAt).toISOString() : null,
          isPublic,
          requireIdCard,
          hasReward,
          requiresTicket,
          ticketPriceMin: 5000,
          ticketPriceMax: 20_000_000,
          ticketHint: ticketHint || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWebRTCUrl(data.webRTCUrl || '');
      if (data.liveSessionId) setLiveSessionId(data.liveSessionId);
      setIsLive(true);
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  /** Chia sẻ màn hình laptop (getDisplayMedia) — dành cho người tổ chức */
  const toggleScreenShare = async () => {
    if (screenSharing) {
      try {
        const { getBestUserMedia } = await import('@/lib/cameraBest');
        const best = await getBestUserMedia({
          deviceId: selectedDeviceId || undefined,
          facingMode: 'user',
        });
        mediaStreamRef.current?.getTracks().forEach((tr) => tr.stop());
        await attachCameraStream(best.stream, true);
        setScreenSharing(false);
      } catch (e: any) {
        alert(e?.message || 'Không bật lại camera');
      }
      return;
    }
    try {
      const { startScreenShare } = await import('@/lib/screenShare');
      const screen = await startScreenShare();
      mediaStreamRef.current?.getVideoTracks().forEach((t) => t.stop());
      mediaStreamRef.current = screen;
      if (videoRef.current) videoRef.current.srcObject = screen;
      setScreenSharing(true);
      screen.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
      };
    } catch (e: any) {
      alert(e?.message || 'Không chia sẻ được màn hình (dùng Chrome/Edge trên laptop)');
    }
  };

  const stopLive = () => {
    stopBeautyPipeline();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    rawStreamRef.current?.getTracks().forEach((track) => track.stop());
    rawStreamRef.current = null;
    setScreenSharing(false);
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsLive(false);
  };

  /** CSS filter cho preview camera (làm đẹp hình) */
  const beautyFilterStyle: React.CSSProperties = beautyOn
    ? {
        filter: [
          `brightness(${1 + bright / 100})`,
          `contrast(${1 + contrast / 100})`,
          `saturate(${1 + pink / 50})`,
          `sepia(${warm / 200})`,
          smooth > 0 ? `blur(${(smooth / 100) * 0.55}px)` : null,
        ]
          .filter(Boolean)
          .join(' '),
      }
    : {};

  if (!session) {
    return (
      <p className="text-center py-8" style={{ fontFamily: 'var(--font-x)' }}>
        Vui lòng đăng nhập để sử dụng Live Stream
      </p>
    );
  }

  return (
    <div
      className="max-w-md mx-auto p-4 space-y-4"
      style={{ backgroundColor: '#F5F0E6', color: '#1A1A1A', fontFamily: 'var(--font-x)' }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t('app_name')}</h1>
        <LanguageSwitcher compact />
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-xl bg-black aspect-video object-cover"
          style={beautyFilterStyle}
        />
        {/* LIVE + Phúc Long Tivi gradient — góc trên trái */}
        <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {isLive && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-red-600' : 'bg-gray-400'}`}
              />
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-black text-white ${
                isLive ? 'bg-red-600' : 'bg-black/60'
              }`}
            >
              {isLive ? 'LIVE' : 'PREVIEW'}
            </span>
          </div>
          <p className="pl-tivi-gradient-text" style={{ fontSize: 13 }}>
            Phúc Long Tivi
          </p>
        </div>
        {beautyOn && (
          <span
            className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: 'rgba(228, 17, 95, 0.85)' }}
          >
            ✦ Làm đẹp
          </span>
        )}
      </div>

      <LiveObjectStudio
        videoRef={videoRef}
        roomKey={liveSessionId || 'draft'}
        onOverlaysChange={onOverlaysChange}
      />

      {/* Bảng làm đẹp hình — dùng khi chuẩn bị / đang live (preview) */}
      <div
        className="rounded-xl border p-3 space-y-2.5"
        style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Làm đẹp hình ảnh</p>
          <button
            type="button"
            onClick={() => setBeautyOn((v) => !v)}
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: beautyOn ? '#E0115F' : '#EDE6D9',
              color: beautyOn ? '#F5F0E6' : '#1A1A1A',
            }}
          >
            {beautyOn ? 'Đang bật' : 'Tắt'}
          </button>
        </div>
        <p className="text-[10px] text-black/50">
          Làm mịn da, sáng da, tông ấm, hồng hào. Khi <strong>Bắt đầu Live</strong>, pipeline canvas
          gửi hình đã filter cho người xem (không chỉ xem trước local).
        </p>
        {beautyOn && (
          <div className="space-y-2 text-xs">
            {[
              { label: 'Làm mịn', value: smooth, set: setSmooth },
              { label: 'Sáng da', value: bright, set: setBright },
              { label: 'Tông ấm', value: warm, set: setWarm },
              { label: 'Hồng hào', value: pink, set: setPink },
              { label: 'Tương phản', value: contrast, set: setContrast },
            ].map((row) => (
              <label key={row.label} className="flex items-center gap-2">
                <span className="w-20 shrink-0 font-medium">{row.label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={row.value}
                  onChange={(e) => row.set(Number(e.target.value))}
                  className="flex-1 accent-[#E0115F]"
                />
                <span className="w-7 text-right text-black/45">{row.value}</span>
              </label>
            ))}
            <button
              type="button"
              className="text-[11px] font-semibold underline text-black/60"
              onClick={() => {
                setSmooth(40);
                setBright(8);
                setWarm(10);
                setPink(6);
                setContrast(5);
              }}
            >
              Đặt lại mặc định
            </button>
          </div>
        )}
      </div>

      {!isLive && (
        <div className="space-y-3 rounded-xl border border-black/10 bg-white/70 p-3">
          <div>
            <label className="block text-xs font-bold mb-1">Tiêu đề phiên live</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Liveshow cuối tuần Phúc Long"
              className="w-full border rounded-lg p-2 bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Lịch bắt đầu (thông báo trước 5 phút)</label>
            <input
              type="datetime-local"
              value={scheduledStartAt}
              onChange={(e) => setScheduledStartAt(e.target.value)}
              className="w-full border rounded-lg p-2 bg-white text-sm"
            />
            <p className="text-[11px] text-black/50 mt-1">
              Để trống = bắt đầu ngay. Có lịch → push ~5 phút trước giờ này.
            </p>
          </div>
          {devices.length > 0 && (
            <div>
              <label className="block text-xs font-bold mb-1">Camera</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white text-sm"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              {t('public_live')}
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={requireIdCard} onChange={(e) => setRequireIdCard(e.target.checked)} />
              {t('attendance_cccd')}
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={hasReward} onChange={(e) => setHasReward(e.target.checked)} />
              Có thưởng
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={requiresTicket} onChange={(e) => setRequiresTicket(e.target.checked)} />
              Yêu cầu mua vé xem live
            </label>
          </div>
          {requiresTicket && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-black/60">
                Người xem tự chọn số tiền vé từ <strong>5.000</strong> đến <strong>20.000.000</strong> VNĐ để được toàn quyền xem livestream.
              </p>
              <input
                type="text"
                placeholder="Gợi ý giá (tuỳ chọn), vd: 50.000đ"
                value={ticketHint}
                onChange={(e) => setTicketHint(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}
              />
            </div>
          )}
        </div>
      )}

      {!isLive ? (
        <button onClick={startLive} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl">
          {t('start_live')}
        </button>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={toggleScreenShare}
            className="w-full font-semibold py-3 rounded-xl border"
            style={{
              backgroundColor: screenSharing ? '#8B4513' : '#FAF7F0',
              color: screenSharing ? '#fff' : '#1A1A1A',
              borderColor: '#D4C9B5',
            }}
          >
            {screenSharing
              ? 'Đang chia sẻ màn hình laptop — bấm để về camera'
              : 'Chia sẻ màn hình laptop'}
          </button>
          <button onClick={stopLive} className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl">
            Stop Live
          </button>
          {liveSessionId && (
            <Link
              href={`/live/${liveSessionId}/map`}
              className="block w-full text-center bg-black text-white font-semibold py-3 rounded-xl"
            >
              🗺️ {t('open_map')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
