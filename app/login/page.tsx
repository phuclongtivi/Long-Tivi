'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import LoginSecurityGate from '@/components/LoginSecurityGate';

type ShareEvent = {
  id: string;
  title: string;
  status: string;
  shareUrl?: string;
};

export default function LoginPage() {
  const [bossEmail, setBossEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [bioMsg, setBioMsg] = useState('');
  /** Mặc định tick chia sẻ sự kiện lên MXH khi đăng nhập */
  const [shareOnLogin, setShareOnLogin] = useState(true);
  const [sharePlatforms, setSharePlatforms] = useState({
    facebook: true,
    tiktok: true,
    zalo: true,
    instagram: true,
  });
  const [liveEvents, setLiveEvents] = useState<ShareEvent[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/live?status=active_or_upcoming');
        const data = await res.json();
        const list = (data.lives || data.items || []).slice(0, 3).map((l: any) => ({
          id: l.id,
          title: l.title || 'Sự kiện Phúc Long',
          status: l.endedAt ? 'ended' : l.startedAt ? 'live' : 'upcoming',
          shareUrl: l.shareUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/live/${l.id}`,
        }));
        setLiveEvents(list);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const rememberSharePref = () => {
    try {
      localStorage.setItem(
        'pl_share_on_login',
        JSON.stringify({ shareOnLogin, sharePlatforms })
      );
    } catch {
      /* */
    }
  };

  const doSignIn = (provider: string) => {
    rememberSharePref();
    signIn(provider, { callbackUrl: shareOnLogin ? '/?shared=1' : '/' }).catch(() =>
      alert('Provider đang cấu hình')
    );
  };

    /** Boss đăng nhập bằng email + mã 6 số */
  const loginBossEmail = async () => {
    if (!bossEmail.trim() || !bossEmail.includes('@')) {
      setMsg('Nhập email Boss');
      return;
    }
    setMsg('');
    try {
      const res = await fetch('/api/auth/boss-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bossEmail.trim(),
          step: otpSent ? 'verify' : 'send',
          otp: otp || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Lỗi');
        return;
      }
      if (data.otpSent) {
        setOtpSent(true);
        setMsg(data.message + (data.devCode ? ` (dev: ${data.devCode})` : ''));
        return;
      }
      if (data.success && data.loginCode) {
        const result = await signIn('boss-email', {
          loginCode: data.loginCode,
          redirect: false,
        });
        if (result?.error) {
          setMsg('Không tạo được phiên đăng nhập Boss');
          return;
        }
        setMsg('Đăng nhập Boss thành công');
        window.location.href = data.redirect || '/dashboard';
        return;
      }
      setMsg(data.message || 'OK');
    } catch {
      setMsg('Lỗi kết nối');
    }
  };


  /** Đăng nhập nhanh (thiết bị mới): nhận diện khuôn mặt / vân tay (WebAuthn / platform authenticator) */
  const loginBiometric = async (type: 'face' | 'fingerprint') => {
    setBioMsg('');
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setBioMsg('Thiết bị / trình duyệt không hỗ trợ nhận diện sinh trắc học.');
      return;
    }
    try {
      // WebAuthn – face ID / Touch ID / Windows Hello
      // Production: đăng ký credential trước, rồi get() khi đăng nhập
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setBioMsg(
          type === 'face'
            ? 'Thiết bị không hỗ trợ nhận diện khuôn mặt (Face ID / tương đương).'
            : 'Thiết bị không hỗ trợ nhận diện vân tay.'
        );
        return;
      }
      setBioMsg(
        type === 'face'
          ? 'Đã sẵn sàng nhận diện khuôn mặt. (Cần đăng ký sinh trắc trên thiết bị lần đầu – WebAuthn.)'
          : 'Đã sẵn sàng nhận diện vân tay. (Cần đăng ký sinh trắc trên thiết bị lần đầu – WebAuthn.)'
      );
      // TODO: gọi API /api/auth/webauthn/login khi đã enroll
    } catch (e: any) {
      setBioMsg(e?.message || 'Không thể dùng sinh trắc học');
    }
  };

  return (
    <main
      className="pl-future-shell min-h-screen flex flex-col items-center justify-center p-6"
    >
      <h1 className="text-3xl font-bold mb-2">
        Đăng nhập Phúc Long
      </h1>
      <p className="text-sm mb-6 text-center max-w-sm opacity-70">
        5 lần đầu đăng nhập nhanh, không cần xác nhận thêm. Từ lần 6: điện thoại cần kích hoạt khuôn mặt/vân tay; mọi thiết bị nhận mã 6 số qua email.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* Đăng nhập nhanh luôn ở vị trí ưu tiên đầu tiên */}
        <section className="pl-quick-login pl-diamond-surface p-4" aria-labelledby="quick-login-title">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p id="quick-login-title" className="text-sm font-black">Đăng nhập nhanh ưu tiên</p>
              <p className="text-[11px] opacity-65">Khuôn mặt trước, sau đó tài khoản mạng xã hội</p>
            </div>
            <span className="pl-priority-badge">Ưu tiên</span>
          </div>
          <p className="mb-2 text-[11px] font-bold opacity-70">1. Nhận diện trên thiết bị đã lưu</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => loginBiometric('face')}
              className="pl-holo-button min-h-11 rounded-xl px-3 py-2.5 text-sm font-bold"
            >
              ◉ Khuôn mặt
            </button>
            <button
              type="button"
              onClick={() => loginBiometric('fingerprint')}
              className="pl-holo-button min-h-11 rounded-xl px-3 py-2.5 text-sm font-bold"
            >
              ✦ Vân tay
            </button>
          </div>
          {bioMsg && <p className="mb-3 text-xs opacity-70" role="status">{bioMsg}</p>}
          <p className="mb-2 text-[11px] font-bold opacity-70">2. Đăng nhập nhanh bằng tài khoản mạng</p>
          <div className="grid gap-2 mb-3">
            <button onClick={() => doSignIn('facebook')} className="pl-auth-provider w-full py-3 px-4 rounded-xl font-semibold">
              Facebook
            </button>
            <button onClick={() => doSignIn('tiktok')} className="pl-auth-provider w-full py-3 px-4 rounded-xl font-semibold">
              TikTok
            </button>
            <button onClick={() => doSignIn('google')} className="pl-auth-provider w-full py-3 px-4 rounded-xl font-semibold">
              Google / YouTube
            </button>
            <button onClick={() => doSignIn('zalo')} className="pl-auth-provider w-full py-3 px-4 rounded-xl font-semibold">
              Zalo
            </button>
          </div>
        </section>

        <div className="pl-login-divider" role="separator">
          <span>Các phương thức khác</span>
        </div>

        {/* Chia sẻ sự kiện khi đăng nhập — mặc định đã tick */}
        <div
          className="pl-menu-module rounded-xl border p-3 text-left space-y-2"
        >
          <label className="flex items-start gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={shareOnLogin}
              onChange={(e) => setShareOnLogin(e.target.checked)}
            />
            <span>
              Chia sẻ sự kiện đang / sắp diễn ra lên Facebook, TikTok, Zalo, Instagram
              <span className="block text-xs font-normal text-black/60 mt-0.5">
                Mặc định bật. Bỏ tick nếu không muốn chia sẻ. Video chia sẻ có QR refer sản phẩm
                + ảnh AI Phúc (tránh vi phạm chính sách MXH).
              </span>
            </span>
          </label>
          {shareOnLogin && (
            <div className="flex flex-wrap gap-2 text-xs pl-6">
              {(
                [
                  ['facebook', 'Facebook'],
                  ['tiktok', 'TikTok'],
                  ['zalo', 'Zalo'],
                  ['instagram', 'Instagram'],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={sharePlatforms[k]}
                    onChange={(e) =>
                      setSharePlatforms((p) => ({ ...p, [k]: e.target.checked }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
          {liveEvents.length > 0 && (
            <ul className="text-xs text-black/70 pl-6 space-y-1">
              {liveEvents.map((ev) => (
                <li key={ev.id}>
                  · {ev.title}{' '}
                  <span className="text-red-600">
                    ({ev.status === 'live' ? 'ĐANG LIVE' : 'Sắp diễn ra'})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => doSignIn('twitter')}
          className="pl-auth-provider w-full py-2.5 px-4 rounded-xl text-sm font-medium"
        >
          X (tuỳ chọn)
        </button>

        {/* Boss – Email + mã 6 số */}
        <div className="pl-menu-module border-t pt-3 mt-1 p-3">
          <p className="text-xs font-bold mb-2">Boss – Đăng nhập bằng email</p>
          <p className="text-[10px] text-black/55 mb-2">
            Nhập email Boss → nhận mã 6 số qua email → xác minh để vào Dashboard.
          </p>
          <input
            type="email"
            placeholder="Email Boss"
            value={bossEmail}
            onChange={(e) => setBossEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border mb-2"
            autoComplete="email"
          />
          {otpSent && (
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Mã 6 số trong email"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 text-sm rounded-lg border mb-2 tracking-widest text-center"
            />
          )}
          <button
            type="button"
            onClick={loginBossEmail}
            className="pl-holo-button w-full py-2.5 text-sm font-bold rounded-xl"
          >
            {otpSent ? 'Xác nhận mã 6 số' : 'Gửi mã 6 số qua email'}
          </button>
          {msg && <p className="text-xs mt-2 font-semibold whitespace-pre-wrap">{msg}</p>}
        </div>

        <p className="text-xs text-center mt-2 opacity-60">
          TikTok & Zalo sẽ được bổ sung sau
        </p>
        <Link href="/home" className="pl-nav-back text-xs text-center">
          Về Home
        </Link>
      </div>
    </main>
  );
}
