'use client';

/**
 * Đăng nhập trên thiết bị mới → bắt buộc OTP 6 số qua email trước khi vào app.
 * Thiết bị đã tin cậy (biometric / đã OTP) → bỏ qua.
 */

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getOrCreateDeviceId } from '@/lib/deviceAuth';

export default function NewDeviceEmailGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [checking, setChecking] = useState(true);
  const [needOtp, setNeedOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [emailHint, setEmailHint] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated' || !session?.user?.id) {
      setChecking(false);
      setNeedOtp(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setChecking(true);
      try {
        const deviceId = getOrCreateDeviceId();
        const res = await fetch('/api/auth/device-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.trusted) {
          setNeedOtp(false);
        } else {
          setNeedOtp(true);
          setEmailHint(data.emailHint || '');
          // Tự gửi OTP
          setSending(true);
          const sendRes = await fetch('/api/auth/login-security', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send_email_otp', clientType: 'desktop' }),
          });
          const sendData = await sendRes.json();
          if (!cancelled) {
            setMsg(
              sendData.message ||
                sendData.error ||
                'Đã gửi mã 6 số tới email tài khoản. Nhập mã để dùng app trên thiết bị mới.'
            );
          }
          setSending(false);
        }
      } catch {
        if (!cancelled) {
          setNeedOtp(true);
          setMsg('Không kiểm tra được thiết bị. Vui lòng nhập mã email nếu được gửi.');
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);

  const resend = async () => {
    setSending(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/login-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_email_otp' }),
      });
      const data = await res.json();
      setMsg(data.message || data.error || 'Đã gửi lại mã');
    } catch {
      setMsg('Lỗi gửi mã');
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    if (otp.trim().length !== 6) {
      setMsg('Nhập đủ 6 số');
      return;
    }
    setVerifying(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/login-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_email_otp', otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsg(data.error || 'Mã không đúng');
        setVerifying(false);
        return;
      }

      // Đánh dấu thiết bị đã xác minh email
      const deviceId = getOrCreateDeviceId();
      await fetch('/api/auth/device-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trust_after_email', deviceId }),
      });

      setNeedOtp(false);
      setMsg('Thiết bị mới đã được xác minh.');
    } catch {
      setMsg('Lỗi xác minh');
    } finally {
      setVerifying(false);
    }
  };

  if (status === 'loading' || checking) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[90] bg-black/20 pointer-events-none" aria-hidden />
      </>
    );
  }

  if (!needOtp) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="pointer-events-none opacity-40 select-none" aria-hidden>
        {children}
      </div>
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/55">
        <div
          className="w-full max-w-sm rounded-2xl border p-5 space-y-3 shadow-2xl"
          style={{ backgroundColor: '#FAF7F0', borderColor: '#D4C9B5', color: '#1A1A1A' }}
        >
          <h2 className="text-lg font-bold">Xác minh thiết bị mới</h2>
          <p className="text-sm text-black/70">
            Bạn đang đăng nhập trên <strong>thiết bị mới</strong>. Chúng tôi đã gửi{' '}
            <strong>mã 6 số</strong> tới email
            {emailHint ? (
              <>
                {' '}
                <strong>{emailHint}</strong>
              </>
            ) : (
              ' của tài khoản'
            )}
            . Nhập đúng mã để tiếp tục dùng app Long.
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            className="w-full text-center text-2xl tracking-[0.4em] font-bold py-3 rounded-xl border"
            style={{ borderColor: '#D4C9B5', backgroundColor: '#fff' }}
            autoFocus
          />

          <button
            type="button"
            disabled={verifying || otp.length !== 6}
            onClick={verify}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: '#C41E3A' }}
          >
            {verifying ? 'Đang xác minh…' : 'Xác nhận & vào app'}
          </button>

          <button
            type="button"
            disabled={sending}
            onClick={resend}
            className="w-full text-xs font-semibold py-2"
            style={{ color: '#8B4513' }}
          >
            {sending ? 'Đang gửi…' : 'Gửi lại mã email'}
          </button>

          {msg && <p className="text-xs font-semibold text-black/70 whitespace-pre-wrap">{msg}</p>}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-[11px] text-black/45 underline"
          >
            Đăng xuất / dùng tài khoản khác
          </button>
        </div>
      </div>
    </>
  );
}
