'use client';

/**
 * Thiết bị cũ (đã gắn biometric):
 * - Tự mở face / vân tay
 * - Thất bại 3 lần liên tiếp → cho phép xác minh 6 số qua email
 */

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import {
  getLocalBiometric,
  getOrCreateDeviceId,
  promptDeviceBiometric,
  clearLocalBiometricBinding,
} from '@/lib/deviceAuth';

const FAIL_KEY = 'pl_bio_fail_streak';

function getFailStreak() {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(FAIL_KEY) || 0);
}

function setFailStreak(n: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAIL_KEY, String(n));
}

export default function BiometricAutoLogin() {
  const { status } = useSession();
  const tried = useRef(false);
  const [ui, setUi] = useState<'idle' | 'prompt' | 'working' | 'fail' | 'email_fallback'>('idle');
  const [msg, setMsg] = useState('');
  const [otp, setOtp] = useState('');
  const [emailHint, setEmailHint] = useState('');

  const completeWithLoginCode = async (loginCode: string) => {
    const result = await signIn('device-biometric', {
      loginCode,
      redirect: false,
    });
    if (result?.error) {
      setUi('fail');
      setMsg('Đăng nhập thất bại. Thử lại hoặc dùng email.');
      return;
    }
    setFailStreak(0);
    setUi('idle');
    window.location.reload();
  };

  const tryBiometricLogin = async () => {
    const local = getLocalBiometric();
    if (!local) return;

    setUi('prompt');
    const typeLabel =
      local.biometricType === 'face' ? 'nhận diện khuôn mặt' : 'xác thực vân tay';
    const bio = await promptDeviceBiometric(
      `Đăng nhập Long bằng ${typeLabel} trên thiết bị này`
    );

    if (!bio.ok) {
      const fails = getFailStreak() + 1;
      setFailStreak(fails);
      if (fails >= 3) {
        setUi('email_fallback');
        setMsg(
          'Không dùng được khuôn mặt/vân tay 3 lần liên tiếp. Nhập mã 6 số gửi qua email.'
        );
        try {
          const res = await fetch('/api/auth/device-biometric', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send_email_fallback',
              deviceId: local.deviceId || getOrCreateDeviceId(),
              deviceToken: local.deviceToken,
            }),
          });
          const data = await res.json();
          if (data.emailHint) setEmailHint(data.emailHint);
          let m = data.message || data.error || 'Đã gửi mã 6 số tới email.';
          if (data.devCode) m += ` (dev: ${data.devCode})`;
          setMsg(m);
        } catch {
          setMsg('Không gửi được email. Thử lại sau.');
        }
      } else {
        setUi('fail');
        setMsg(
          `${bio.error || 'Xác thực thất bại'}. Còn ${3 - fails} lần trước khi chuyển sang mã email.`
        );
      }
      return;
    }

    setUi('working');
    try {
      const res = await fetch('/api/auth/device-biometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          deviceId: local.deviceId || getOrCreateDeviceId(),
          deviceToken: local.deviceToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.loginCode) {
        if (data.needOAuth) clearLocalBiometricBinding();
        const fails = getFailStreak() + 1;
        setFailStreak(fails);
        if (fails >= 3) {
          setUi('email_fallback');
          setMsg('Chuyển sang xác minh email sau 3 lần thất bại.');
        } else {
          setUi('fail');
          setMsg(data.error || 'Không xác thực được thiết bị.');
        }
        return;
      }
      await completeWithLoginCode(data.loginCode);
    } catch {
      setUi('fail');
      setMsg('Lỗi kết nối.');
    }
  };

  useEffect(() => {
    if (status === 'loading' || status === 'authenticated') return;
    if (tried.current) return;
    const local = getLocalBiometric();
    if (!local) return;
    tried.current = true;
    tryBiometricLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const verifyEmailFallback = async () => {
    const local = getLocalBiometric();
    if (!local || otp.length !== 6) {
      setMsg('Nhập đủ 6 số');
      return;
    }
    setUi('working');
    try {
      const res = await fetch('/api/auth/device-biometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_email_fallback',
          deviceId: local.deviceId || getOrCreateDeviceId(),
          deviceToken: local.deviceToken,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.loginCode) {
        setUi('email_fallback');
        setMsg(data.error || 'Mã không đúng');
        return;
      }
      await completeWithLoginCode(data.loginCode);
    } catch {
      setUi('email_fallback');
      setMsg('Lỗi kết nối');
    }
  };

  if (ui === 'idle' || status === 'authenticated') return null;

  if (ui === 'prompt' || ui === 'working') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div
          className="w-full max-w-sm rounded-2xl p-5 text-center space-y-3"
          style={{ backgroundColor: '#FAF7F0', color: '#1A1A1A' }}
        >
          <p className="text-lg font-bold">Đăng nhập thiết bị</p>
          <p className="text-sm text-black/70">
            {ui === 'working' ? 'Đang xác thực…' : 'Xác nhận khuôn mặt hoặc vân tay'}
          </p>
          <div className="text-4xl py-2">🔐</div>
        </div>
      </div>
    );
  }

  if (ui === 'email_fallback') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
        <div
          className="w-full max-w-sm rounded-2xl border p-5 space-y-3"
          style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5', color: '#1A1A1A' }}
        >
          <p className="font-bold">Xác minh email (sau 3 lần biometric)</p>
          <p className="text-xs text-black/65">{msg}</p>
          {emailHint ? (
            <p className="text-xs">
              Email: <strong>{emailHint}</strong>
            </p>
          ) : null}
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            className="w-full text-center text-2xl tracking-[0.35em] font-bold py-3 rounded-xl border"
            style={{ borderColor: '#D4C9B5' }}
          />
          <button
            type="button"
            onClick={verifyEmailFallback}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: '#C41E3A' }}
          >
            Xác nhận mã 6 số
          </button>
          <button
            type="button"
            onClick={() => {
              tried.current = false;
              setFailStreak(0);
              tryBiometricLogin();
            }}
            className="w-full text-xs underline text-black/50"
          >
            Thử lại khuôn mặt / vân tay
          </button>
          <a href="/login" className="block text-center text-xs font-bold" style={{ color: '#C41E3A' }}>
            Đăng nhập nhanh MXH
          </a>
        </div>
      </div>
    );
  }

  if (ui === 'fail') {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-[100] max-w-md mx-auto">
        <div
          className="rounded-xl border p-3 shadow-lg text-sm"
          style={{ backgroundColor: '#FFF7ED', borderColor: '#D4C9B5' }}
        >
          <p className="font-semibold">{msg}</p>
          <button
            type="button"
            className="mt-2 text-xs font-bold underline"
            style={{ color: '#C41E3A' }}
            onClick={() => {
              tried.current = false;
              tryBiometricLogin();
            }}
          >
            Thử lại
          </button>
          <a href="/login" className="ml-3 text-xs underline text-black/50">
            Đăng nhập MXH
          </a>
        </div>
      </div>
    );
  }

  return null;
}
