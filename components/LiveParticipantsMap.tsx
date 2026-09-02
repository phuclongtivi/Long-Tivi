'use client';

import UserChip from './UserChip';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageProvider';

export type ParticipantPin = {
  userId: string;
  name: string;
  lat: number;
  lng: number;
  image?: string | null;
  joinedAt?: string;
  isMe?: boolean;
};

type Props = {
  liveSessionId: string;
  /** Poll interval ms – default 15s */
  pollMs?: number;
  className?: string;
};

/** Simple equirectangular projection for Vietnam-focused map (no external map SDK required). */
function project(lat: number, lng: number, width: number, height: number) {
  // Vietnam approx bounds
  const minLat = 8.2;
  const maxLat = 23.6;
  const minLng = 102.0;
  const maxLng = 110.5;
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  return {
    x: Math.max(8, Math.min(width - 8, x)),
    y: Math.max(8, Math.min(height - 8, y)),
  };
}

export function LiveParticipantsMap({ liveSessionId, pollMs = 15000, className = '' }: Props) {
  const { t } = useLanguage();
  const [pins, setPins] = useState<ParticipantPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [selected, setSelected] = useState<ParticipantPin | null>(null);

  const mapW = 360;
  const mapH = 520;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${liveSessionId}/participants`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load participants');
      const data = await res.json();
      setPins(data.participants || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [liveSessionId]);

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  const shareMyLocation = async () => {
    if (!navigator.geolocation) {
      setError(t('location_required'));
      return;
    }
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await fetch(`/api/live/${liveSessionId}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          await load();
        } catch {
          setError(t('location_required'));
        } finally {
          setSharing(false);
        }
      },
      () => {
        setError(t('location_required'));
        setSharing(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const projected = useMemo(
    () =>
      pins.map((p) => ({
        ...p,
        ...project(p.lat, p.lng, mapW, mapH),
      })),
    [pins]
  );

  return (
    <div className={`rounded-2xl border border-black/10 bg-[#F5F0E6] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
        <div>
          <h2 className="text-base font-bold text-black">{t('participants_map_title')}</h2>
          <p className="text-xs text-black/60">
            {pins.length} {t('participants_count')}
          </p>
        </div>
        <button
          type="button"
          onClick={shareMyLocation}
          disabled={sharing}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {sharing ? t('loading') : t('share_location')}
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-b border-red-100">{error}</div>
      )}

      <div className="relative mx-auto" style={{ width: mapW, maxWidth: '100%' }}>
        {/* Stylized Vietnam map background */}
        <svg
          viewBox={`0 0 ${mapW} ${mapH}`}
          width="100%"
          height={mapH}
          className="block bg-[#E8DFD0]"
        >
          {/* Soft land shape (approx Vietnam silhouette) */}
          <path
            d="M180 20 C210 40 230 80 220 120 C240 160 250 200 230 250 C245 300 260 340 240 390 C220 440 190 480 160 500 C140 480 120 450 110 400 C90 350 80 300 95 250 C85 200 90 150 110 110 C130 70 150 40 180 20 Z"
            fill="#D4C4A8"
            stroke="#B8A88C"
            strokeWidth="2"
            opacity="0.9"
          />
          {/* Pins */}
          {projected.map((p) => (
            <g
              key={p.userId}
              transform={`translate(${p.x}, ${p.y})`}
              className="cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <circle
                r={p.isMe ? 10 : 7}
                fill={p.isMe ? '#DC2626' : '#1F2937'}
                stroke="#fff"
                strokeWidth="2"
              />
              <circle r={p.isMe ? 16 : 12} fill={p.isMe ? '#DC2626' : '#1F2937'} opacity="0.2" />
            </g>
          ))}
        </svg>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 text-sm font-medium text-black/70">
            {t('loading')}
          </div>
        )}

        {!loading && pins.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-black/50">
            {t('no_participants')}
          </div>
        )}
      </div>

      {/* List + selected detail — click user → Tặng quà */}
      <div className="max-h-48 overflow-y-auto border-t border-black/10 divide-y divide-black/5">
        {projected.map((p) => (
          <div
            key={p.userId}
            className={`flex items-center gap-3 px-4 py-2.5 ${
              selected?.userId === p.userId ? 'bg-red-50' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => setSelected(p)}
              className="shrink-0"
              title="Chọn trên bản đồ"
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  p.isMe ? 'bg-red-600' : 'bg-black'
                }`}
              >
                {(p.name || '?').slice(0, 1).toUpperCase()}
              </div>
            </button>
            <div className="min-w-0 flex-1">
              <UserChip
                userId={p.userId}
                name={p.name}
                image={p.image}
                liveSessionId={liveSessionId}
              />
              {p.isMe && (
                <span className="text-[11px] text-black/50 ml-1">{t('your_location')}</span>
              )}
              <div className="text-[11px] text-black/50">
                {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
