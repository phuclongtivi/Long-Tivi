'use client';

/**
 * Player xem livestream — full màn hình + chọn độ phân giải (kiểu YouTube)
 * Hỗ trợ HLS (hls.js) và URL video thường / WebRTC poster fallback
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { LIVE_QUALITY, VIEWER_QUALITY_OPTIONS } from '@/lib/liveQuality';

type Props = {
  src?: string | null;
  poster?: string | null;
  title?: string;
  isLive?: boolean;
  className?: string;
};

export default function LiveVideoPlayer({
  src,
  poster,
  title,
  isLive = true,
  className = '',
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);

  const [playing, setPlaying] = useState(false);
  const [showUi, setShowUi] = useState(true);
  const [quality, setQuality] = useState<string>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [levels, setLevels] = useState<{ height: number; index: number }[]>([]);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bumpUi = useCallback(() => {
    setShowUi(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUi(false), 3500);
  }, []);

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let destroyed = false;

    async function attach() {
      const url = src!;
      const isHls =
        url.includes('.m3u8') ||
        url.includes('application/vnd.apple.mpegurl') ||
        url.includes('/hls/');

      if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }

      if (isHls) {
        try {
          const Hls = (await import('hls.js')).default;
          if (destroyed) return;
          if (Hls.isSupported()) {
            const hls = new Hls({ ...LIVE_QUALITY.hlsConfig });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              const lv = (hls.levels || []).map((l: any, index: number) => ({
                height: l.height || 0,
                index,
              }));
              setLevels(lv);
              hls.currentLevel = -1; // auto
            });
            return;
          }
        } catch {
          /* fall through */
        }
      }

      video.src = url;
    }

    attach();

    return () => {
      destroyed = true;
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {
          /* ignore */
        }
        hlsRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    if (quality === 'auto') {
      hls.currentLevel = -1;
      return;
    }
    const want = parseInt(quality, 10);
    const idx = levels.findIndex((l) => l.height === want);
    if (idx >= 0) hls.currentLevel = idx;
  }, [quality, levels]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
    bumpUi();
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        // Mobile landscape hint
        try {
          await (screen.orientation as any)?.lock?.('landscape');
        } catch {
          /* ignore */
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // iOS Safari: video webkitEnterFullscreen
      const v = videoRef.current as any;
      if (v?.webkitEnterFullscreen) v.webkitEnterFullscreen();
    }
    bumpUi();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black rounded-xl overflow-hidden aspect-video ${className}`}
      onMouseMove={bumpUi}
      onTouchStart={bumpUi}
      onClick={bumpUi}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        poster={poster || undefined}
        playsInline
        controls={false}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* LIVE + Phúc Long Tivi (gradient đổi màu) — góc trên trái, cỡ vừa */}
      <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'animate-ping bg-red-500' : 'bg-gray-400'}`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-red-600' : 'bg-gray-500'}`}
            />
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[12px] font-black tracking-wider text-white ${
              isLive ? 'bg-red-600' : 'bg-black/70'
            }`}
          >
            {isLive ? 'LIVE' : 'OFF AIR'}
          </span>
        </div>
        <p className="pl-tivi-gradient-text">Phúc Long Tivi</p>
      </div>

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showUi ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.75))',
        }}
      >
        <div className="flex items-center gap-2 px-3 pb-3 pt-8">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-lg"
            aria-label={playing ? 'Tạm dừng' : 'Phát'}
          >
            {playing ? '❚❚' : '▶'}
          </button>

          <div className="flex-1" />

          {/* Quality menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQualityMenu((s) => !s);
                bumpUi();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/20 text-white text-xs font-semibold"
            >
              {quality === 'auto' ? 'Tự động' : `${quality}p`}
            </button>
            {showQualityMenu && (
              <div
                className="absolute bottom-full right-0 mb-1 min-w-[120px] rounded-lg overflow-hidden shadow-lg z-20"
                style={{ backgroundColor: 'rgba(20,20,20,0.95)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {VIEWER_QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      quality === opt.value ? 'text-[#F5C542] font-bold' : 'text-white'
                    } hover:bg-white/10`}
                    onClick={() => {
                      setQuality(opt.value);
                      setShowQualityMenu(false);
                      bumpUi();
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="w-9 h-9 rounded-full bg-white/15 text-white text-sm"
            aria-label="Toàn màn hình"
            title="Toàn màn hình"
          >
            {isFs ? '⛶' : '⛶'}
          </button>
        </div>
      </div>

      {!src && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm px-4 text-center">
          Chưa có nguồn video. Livestream sẽ hiện khi phiên bắt đầu.
        </div>
      )}
    </div>
  );
}
