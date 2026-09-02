import type { LiveAudioSource } from '@/components/event/live-audio-sources';

export type MixerPreset = {
  audioSources: LiveAudioSource[];
  micId?: string;
  camId?: string;
  speakerId?: string;
  assistantMayPlay: boolean;
  aiVision: boolean;
  updatedAt?: string;
};

export const MIXER_LOCAL_KEY = 'pl.mixer-preset.v1';

export function loadLocalMixerPreset(): MixerPreset | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(MIXER_LOCAL_KEY) || 'null'); } catch { return null; }
}

export function saveLocalMixerPreset(value: MixerPreset) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MIXER_LOCAL_KEY, JSON.stringify({ ...value, updatedAt: new Date().toISOString() }));
}
