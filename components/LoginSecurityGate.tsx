'use client';

import { useEffect, useState } from 'react';
import {
  getOrCreateDeviceId,
  saveLocalBiometricBinding,
  promptDeviceBiometric,
} from '@/lib/deviceAuth';

/**
 * Sau khi đăng nhập OAuth thành công, kiểm tra số lần đăng nhập.
 * - 5 lần đầu: cho qua
 * - Từ lần 6: mobile → bắt buộc chọn face/fingerprint; mọi user → OTP email 6 số
 */
export default function LoginSecurityGate({
  onPassed,
}: {
  onPassed: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [gate, setGate] = useState<any>(null);
  const [clientType, setClientType] = useState<'mobile' | 'desktop'>('desktop');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [step, setStep] = useState<'check' | 'biometric' | 'email' | 'idcard' | 'guest_email' | 'done'>('check');
  const [idFullName, setIdFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    setClientType(mobile ? 'mobile' : 'desktop');
  }, []);

  useEffect(() => {
    async function check() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/login-security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_gate', clientType }),
        });
        const data = await res.json();
        setGate(data);
        // Laptop/desktop: không bắt face/vân tay — chỉ email OTP + CCCD theo lộ trình
        // Mobile: có thể requireBiometricSetup

        if (data.guestOnly || data.requireEmail) {
          setStep('guest_email');
          setMsg(
            data.message ||
              'Từ lần 6 cần có email. Chưa có email — chỉ xem như Khách. Liên kết Google/Facebook có email.'
          );
          return;
        }

        if (data.allowed) {
          await fetch('/api/auth/login-security', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'record_login' }),
          });
          if (data.requireIdCard) {
            setStep('idcard');
          } else {
            setStep('done');
            onPassed();
          }
          return;
        }

        // Desktop: bỏ biometric, ưu tiên email OTP
        if (clientType === 'desktop') {
          if (data.requireEmailOtp) {
            setStep('email');
            await fetch('/api/auth/login-security', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'send_email_otp', clientType: 'desktop' }),
            });
          } else if (data.requireIdCard) {
            setStep('idcard');
          } else {
            setStep('done');
            onPassed();
          }
          return;
        }

        // Mobile
        if (data.requireBiometricSetup) {
          setStep('biometric');
        } else if (data.requireEmailOtp) {
          setStep('email');
          await fetch('/api/auth/login-security', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send_email_otp', clientType: 'mobile' }),
          });
        } else if (data.requireIdCard) {
          setStep('idcard');
        } else {
          setStep('done');
          onPassed();
        }
      } catch {
        setMsg('Lỗi kiểm tra bảo mật đăng nhập');
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [clientType, onPassed]);

  const enableBio = async (type: 'face' | 'fingerprint') => {
    // Xác thực sinh trắc trên thiết bị trước khi gắn
    const bio = await promptDeviceBiometric(
      type === 'face'
        ? 'Xác nhận nhận diện khuôn mặt để bật đăng nhập nhanh trên máy này'
        : 'Xác nhận vân tay để bật đăng nhập nhanh trên máy này'
    );
    if (!bio.ok) {
      setMsg(bio.error || 'Chưa xác thực được trên thiết bị');
      return;
    }

    const res = await fetch('/api/auth/login-security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enable_biometric', biometricType: type }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    if (data.success) {
      // Gắn thiết bị hiện tại → lần sau tự mở face/vân tay
      try {
        const deviceId = getOrCreateDeviceId();
        const bindRes = await fetch('/api/auth/device-biometric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'bind',
            deviceId,
            biometricType: type,
          }),
        });
        const bindData = await bindRes.json();
        if (bindRes.ok && bindData.deviceToken) {
          saveLocalBiometricBinding({
            userId: bindData.userId,
            biometricType: type,
            deviceToken: bindData.deviceToken,
          });
          setMsg(
            (data.message || 'Đã bật biometric') +
              ' Lần mở app sau trên máy này sẽ tự yêu cầu ' +
              (type === 'face' ? 'khuôn mặt' : 'vân tay') +
              '.'
          );
        }
      } catch {
        /* ignore bind error */
      }

      setStep('email');
      await fetch('/api/auth/login-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_email_otp' }),
      });
    }
  };

  const verifyOtp = async () => {
    const res = await fetch('/api/auth/login-security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_email_otp', otp }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    if (data.success) {
      try {
        const deviceId = getOrCreateDeviceId();
        await fetch('/api/auth/device-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'trust_after_email', deviceId }),
        });
      } catch {
        /* ignore */
      }
      setStep('done');
      onPassed();
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-center py-4" style={{ color: '#333' }}>
        Đang kiểm tra bảo mật đăng nhập...
      </p>
    );
  }

  const saveIdCard = async () => {
    if (!idFullName.trim() || !idNumber.trim()) {
      setMsg('Nhập họ tên đầy đủ và số căn cước');
      return;
    }
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: idFullName.trim(), idNumber: idNumber.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setMsg(data.error);
        return;
      }
      setMsg('Đã lưu căn cước. Các lần sau sẽ không yêu cầu lại nếu đã hoàn tất.');
      setStep('done');
      onPassed();
    } catch {
      setMsg('Lỗi lưu thông tin');
    }
  };

  if (step === 'idcard') {
    return (
      <div className="w-full max-w-xs space-y-3 p-4 rounded-xl border" style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}>
        <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
          Bổ sung căn cước công dân
        </p>
        <p className="text-xs" style={{ color: '#333' }}>
          Từ lần đăng nhập thứ 6, vui lòng nhập họ tên và số CCCD (có thể nhập tay). Sau khi hoàn tất, app không yêu cầu lại.
        </p>
        <input
          className="w-full px-3 py-2 text-sm rounded-lg border"
          style={{ backgroundColor: '#F5F0E6', borderColor: '#D4C9B5' }}
          placeholder="Họ tên đầy đủ *"
          value={idFullName}
          onChange={(e) => setIdFullName(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 text-sm rounded-lg border"
          style={{ backgroundColor: '#F5F0E6', borderColor: '#D4C9B5' }}
          placeholder="Số căn cước công dân *"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />
        <button
          type="button"
          onClick={saveIdCard}
          className="w-full py-2.5 text-sm font-bold rounded-xl"
          style={{ backgroundColor: '#1A1A1A', color: '#F5F0E6' }}
        >
          Lưu thông tin
        </button>
        <button
          type="button"
          onClick={() => {
            setStep('done');
            onPassed();
          }}
          className="w-full text-xs underline"
          style={{ color: '#666' }}
        >
          Bổ sung sau trên Dashboard
        </button>
        {msg && <p className="text-xs font-semibold">{msg}</p>}
      </div>
    );
  }


  if (step === 'guest_email') {
    return (
      <div className="w-full max-w-xs space-y-3 p-4 rounded-xl border" style={{ borderColor: '#D4C9B5', backgroundColor: '#FFF7ED' }}>
        <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
          Cần email (máy tính / laptop)
        </p>
        <p className="text-xs" style={{ color: '#333' }}>
          {msg || 'Từ lần đăng nhập thứ 6 bạn phải có email trên tài khoản. Nếu chưa có, bạn chỉ xem app dưới dạng Khách.'}
        </p>
        <p className="text-xs" style={{ color: '#555' }}>
          Trên laptop: đăng nhập lại bằng <strong>Google</strong> hoặc <strong>Facebook</strong> (có email), hoặc cập nhật email trong Dashboard khi đã đăng nhập bằng cách khác.
        </p>
        <button
          type="button"
          onClick={() => {
            setStep('done');
            onPassed();
          }}
          className="w-full py-2.5 text-sm font-bold rounded-xl"
          style={{ backgroundColor: '#1A1A1A', color: '#F5F0E6' }}
        >
          Tiếp tục xem như Khách
        </button>
      </div>
    );
  }

  if (step === 'biometric') {
    return (
      <div className="w-full max-w-xs space-y-3 p-4 rounded-xl border" style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}>
        <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
          Để bảo mật thông tin bạn cần kích hoạt nhận diện khuôn mặt hoặc vân tay.
        </p>
        <p className="text-xs" style={{ color: '#333' }}>
          Đây là lần đăng nhập thứ {gate?.upcomingLogin || 6} trở đi trên điện thoại. Chọn 1 phương thức:
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => enableBio('face')}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl"
            style={{ backgroundColor: '#1A1A1A', color: '#F5F0E6' }}
          >
            Khuôn mặt
          </button>
          <button
            type="button"
            onClick={() => enableBio('fingerprint')}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl"
            style={{ backgroundColor: '#8B4513', color: '#FAF7F0' }}
          >
            Vân tay
          </button>
        </div>
        {msg && <p className="text-xs font-semibold">{msg}</p>}
      </div>
    );
  }

  if (step === 'email') {
    return (
      <div className="w-full max-w-xs space-y-3 p-4 rounded-xl border" style={{ borderColor: '#D4C9B5', backgroundColor: '#FAF7F0' }}>
        <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
          Xác thực 2 bước – mã 6 số qua email
        </p>
        <p className="text-xs" style={{ color: '#333' }}>
          Từ lần đăng nhập thứ 6, bạn nhận email kèm 6 số ngẫu nhiên. Nhập mã để hoàn tất.
        </p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Nhập 6 số"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-3 py-2 text-sm rounded-lg border text-center tracking-widest font-bold"
          style={{ backgroundColor: '#F5F0E6', borderColor: '#D4C9B5', color: '#1A1A1A' }}
        />
        <button
          type="button"
          onClick={verifyOtp}
          className="w-full py-2.5 text-sm font-bold rounded-xl"
          style={{ backgroundColor: '#1A1A1A', color: '#F5F0E6' }}
        >
          Xác nhận
        </button>
        <button
          type="button"
          onClick={async () => {
            const res = await fetch('/api/auth/login-security', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'send_email_otp' }),
            });
            const data = await res.json();
            setMsg(data.message || data.error);
          }}
          className="w-full text-xs underline"
          style={{ color: '#333' }}
        >
          Gửi lại mã
        </button>
        {msg && <p className="text-xs font-semibold">{msg}</p>}
      </div>
    );
  }

  return null;
}
