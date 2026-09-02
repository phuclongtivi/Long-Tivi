'use client';

/**
 * Tự đăng xuất sau 60 phút không hoạt động (tính từ lần tương tác gần nhất).
 * Có hoạt động → cập nhật mốc thời gian + refresh session NextAuth.
 */

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

const IDLE_MS = 60 * 60 * 1000; // 60 phút
const CHECK_MS = 30 * 1000; // kiểm tra mỗi 30s
const ACTIVITY_KEY = 'pl_last_activity_at';

function touch() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
}

export default function SessionActivityGuard() {
  const { status } = useSession();
  const refreshed = useRef(0);

  useEffect(() => {
    if (status !== 'authenticated') return;

    touch();

    const onActivity = () => {
      touch();
      // Rolling session: thỉnh thoảng gọi /api/auth/session để gia hạn JWT
      const now = Date.now();
      if (now - refreshed.current > 5 * 60 * 1000) {
        refreshed.current = now;
        fetch('/api/auth/session').catch(() => null);
      }
    };

    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'visibilitychange'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'hidden') {
        // vẫn tính idle theo last activity
      }
      const last = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
      if (last && Date.now() - last >= IDLE_MS) {
        signOut({ callbackUrl: '/login?reason=idle' });
      }
    }, CHECK_MS);

    // Khi mở lại tab sau thời gian dài
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      const last = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
      if (last && Date.now() - last >= IDLE_MS) {
        signOut({ callbackUrl: '/login?reason=idle' });
      } else {
        onActivity();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener('visibilitychange', onVis);
      window.clearInterval(timer);
    };
  }, [status]);

  return null;
}
