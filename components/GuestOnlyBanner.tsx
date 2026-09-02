'use client';

/**
 * Từ lần đăng nhập thứ 6: không có email → chỉ xem như Khách
 */

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function GuestOnlyBanner() {
  const { status } = useSession();
  const [guestOnly, setGuestOnly] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') {
      setGuestOnly(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/login-security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_gate', clientType: 'mobile' }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.guestOnly || data.requireEmail) {
          setGuestOnly(true);
          setMessage(
            data.message ||
              'Từ lần đăng nhập thứ 6 cần có email. Chưa có email — bạn chỉ xem app như Khách.'
          );
        } else {
          setGuestOnly(false);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (!guestOnly) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[85] px-3 pt-2">
      <div
        className="mx-auto max-w-lg rounded-xl border p-3 shadow-md text-sm"
        style={{ backgroundColor: '#FFF7ED', borderColor: '#D4C9B5', color: '#1A1A1A' }}
      >
        <p className="font-bold text-xs mb-1">Chế độ Khách (thiếu email)</p>
        <p className="text-xs text-black/70">{message}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Link
            href="/login"
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: '#C41E3A' }}
          >
            Liên kết email / đăng nhập lại
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-[11px] font-semibold underline text-black/50"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
