'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MixerPreset } from '@/lib/mixerPreset';
import { loadLocalMixerPreset } from '@/lib/mixerPreset';

export default function MixerPresetMenuCard() {
  const [preset, setPreset] = useState<MixerPreset | null>(null);
  useEffect(() => {
    setPreset(loadLocalMixerPreset());
    fetch('/api/user/mixer-preset', { cache: 'no-store' }).then((r) => r.json()).then((d) => d.preset && setPreset(d.preset)).catch(() => undefined);
  }, []);
  const mic = preset?.audioSources?.find((x) => x.id === 'mic');
  return <div className="pl-menu-module rounded-xl border p-4 text-sm">
    <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Bàn Mixer của tôi</h3><p className="text-xs opacity-65">{preset?.updatedAt ? `Lưu gần nhất: ${new Date(preset.updatedAt).toLocaleString('vi-VN')}` : 'Chưa có cấu hình đã lưu'}</p></div><Link href="/?pane=create" className="pl-holo-button rounded-lg px-3 py-2 text-xs font-bold">Mở Mixer</Link></div>
    {preset && <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span>Micro: {mic?.deviceId ? 'Đã chọn' : 'Mặc định'}</span><span>Camera: {preset.camId ? 'Đã chọn' : 'Mặc định'}</span><span>AI Vision: {preset.aiVision ? 'Bật' : 'Tắt'}</span><span>Nguồn âm: {preset.audioSources.filter((x) => x.enabled).length}</span></div>}
  </div>;
}
