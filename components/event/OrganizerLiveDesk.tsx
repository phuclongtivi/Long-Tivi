"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BtcControlChrome } from "./BtcControlChrome";
import { AvProcessorDock } from "./AvProcessorDock";
import { AvMiniPreviewStrip, setBtcLiveOpen } from "./AvMiniPreviewStrip";
import { MediaDeviceDock } from "./MediaDeviceDock";
import { LiveAudienceCapControl } from "./LiveAudienceCapControl";
import { LiveAudienceCapAlert } from "./LiveAudienceCapAlert";
import type { EventPost } from "./types";
import { LiveKitStage } from "./LiveKitStage";
import { LiveAudioMixer } from "./LiveAudioMixer";
import { DEFAULT_LIVE_SOURCES, type LiveAudioSource } from './live-audio-sources';
import { loadLocalMixerPreset, saveLocalMixerPreset, type MixerPreset } from '@/lib/mixerPreset';
import { useLanguage } from '@/components/LanguageProvider';

/** Bàn BTC: video fullscreen + nút thu phóng riêng + 4 khe app + trần khán giả. */
export function OrganizerLiveDesk({
  post,
  inside,
  preview,
  aiOn,
  onAiToggle,
  onEndLive,
  onRaiseCap,
  onStartLive,
}: {
  post: EventPost;
  inside: number;
  preview?: ReactNode;
  aiOn?: boolean;
  onAiToggle?: () => void;
  onEndLive?: () => void;
  onRaiseCap?: (cap: number, extra: number) => void;
  onStartLive?: (preset: MixerPreset) => void | Promise<void>;
}) {
  const { t, tf, locale } = useLanguage();
  const cap = post.paidAudienceCap ?? post.expectedAudience ?? 200;
  const [audioSources, setAudioSources] = useState<LiveAudioSource[]>(DEFAULT_LIVE_SOURCES);
  const [devices, setDevices] = useState<{ micId?: string; camId?: string; speakerId?: string }>({});
  const [assistantMayPlay, setAssistantMayPlay] = useState(true);
  const [aiVision, setAiVision] = useState(true);
  const [savedAt, setSavedAt] = useState<string>();
  const preset = useMemo<MixerPreset>(() => ({ audioSources, ...devices, assistantMayPlay, aiVision, updatedAt: savedAt }), [audioSources, devices, assistantMayPlay, aiVision, savedAt]);

  useEffect(() => {
    const local = loadLocalMixerPreset();
    if (local) {
      setAudioSources(local.audioSources?.length ? local.audioSources : DEFAULT_LIVE_SOURCES);
      setDevices({ micId: local.micId, camId: local.camId, speakerId: local.speakerId });
      setAssistantMayPlay(local.assistantMayPlay !== false);
      setAiVision(local.aiVision !== false);
      setSavedAt(local.updatedAt);
    }
    fetch('/api/user/mixer-preset', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      const cloud = d.preset as MixerPreset | undefined;
      if (!cloud) return;
      setAudioSources(cloud.audioSources?.length ? cloud.audioSources : DEFAULT_LIVE_SOURCES);
      setDevices({ micId: cloud.micId, camId: cloud.camId, speakerId: cloud.speakerId });
      setAssistantMayPlay(cloud.assistantMayPlay !== false); setAiVision(cloud.aiVision !== false); setSavedAt(cloud.updatedAt);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = { ...preset, updatedAt: new Date().toISOString() };
      saveLocalMixerPreset(next);
      fetch('/api/user/mixer-preset', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).then((r) => r.ok && setSavedAt(next.updatedAt)).catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [audioSources, devices, assistantMayPlay, aiVision]);
  return (
    <>
      <LiveAudienceCapAlert inside={inside} cap={cap} onRaiseCap={() => onRaiseCap?.(cap, 0)} />
      <BtcControlChrome
        preview={preview ?? <LiveKitStage room={`pl-${post.id}`} identity="btc" role="host" />}
        reviewing
        aiOn={aiOn}
        onAiToggle={onAiToggle}
        onEndLive={() => {
          setBtcLiveOpen(false);
          onEndLive?.();
        }}
      >
        <MediaDeviceDock initial={devices} onPick={setDevices} />
        <label className="pl-live-desk-panel" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', fontSize: 12, marginBottom: 10 }}><input type="checkbox" checked={aiVision} onChange={(e) => setAiVision(e.target.checked)} /> {t('ai_vision_track')}</label>
        <LiveAudioMixer sources={audioSources} onChange={setAudioSources} assistantMayPlay={assistantMayPlay} onAssistantMayPlay={setAssistantMayPlay} onMixReady={() => void onStartLive?.(preset)} />
        <p className="pl-live-desk-panel" style={{ fontSize: 11, opacity: .82, padding: '10px 12px' }}>
          {savedAt
            ? tf('mixer_auto_saved_at', { time: new Date(savedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : locale) })
            : t('mixer_auto_saved_device_account')}
        </p>
        <AvProcessorDock />
        <LiveAudienceCapControl
          paidCap={cap}
          currentCap={post.expectedAudience ?? cap}
          onApply={(n, extra) => onRaiseCap?.(n, extra)}
        />
      </BtcControlChrome>
      <AvMiniPreviewStrip liveOn />
    </>
  );
}
