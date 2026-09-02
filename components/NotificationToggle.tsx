'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageProvider';

/**
 * Bật/tắt thông báo livestream + đăng ký Web Push trên trình duyệt.
 * Tắt → server không gửi before_5m / after_10m.
 */
export function NotificationToggle() {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setPerm('unsupported');
      setLoading(false);
      return;
    }
    setPerm(Notification.permission);

    fetch('/api/notifications/settings')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.notificationsEnabled === 'boolean') setEnabled(d.notificationsEnabled);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const registerPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // VAPID public key từ env (NEXT_PUBLIC_VAPID_PUBLIC_KEY)
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    let subscription: PushSubscription | null = null;

    try {
      subscription = await reg.pushManager.getSubscription();
      if (!subscription && vapid) {
        const key = urlBase64ToUint8Array(vapid);
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
      }
    } catch (e) {
      console.warn('Push subscribe failed', e);
    }

    if (subscription) {
      const json = subscription.toJSON();
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          platform: 'web',
        }),
      });
    }
  };

  const toggle = async () => {
    const next = !enabled;
    if (next) {
      if ('Notification' in window && Notification.permission === 'default') {
        const p = await Notification.requestPermission();
        setPerm(p);
        if (p !== 'granted') return;
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        await registerPush();
      }
    }

    setEnabled(next);
    await fetch('/api/notifications/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: next }),
    });
  };

  if (loading) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/80 px-4 py-3">
      <div>
        <div className="text-sm font-bold text-black">
          {t('language') === 'Language'
            ? 'Livestream notifications'
            : t('language') === '语言'
              ? '直播通知'
              : 'Thông báo livestream'}
        </div>
        <p className="text-xs text-black/60">
          {enabled
            ? 'Trước 5 phút + sau 10 phút khi live'
            : 'Đã tắt — không nhận thông báo live'}
        </p>
        {perm === 'denied' && (
          <p className="text-[11px] text-red-600 mt-1">Hãy bật thông báo trong cài đặt điện thoại / trình duyệt</p>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`relative h-7 w-12 rounded-full transition ${enabled ? 'bg-red-600' : 'bg-black/20'}`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            enabled ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
