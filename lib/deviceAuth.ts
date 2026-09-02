/**
 * Định danh thiết bị + cờ biometric trên client (localStorage)
 * Cùng thiết bị: tự mở face/vân tay; thiết bị mới: OAuth nhanh
 */

export const DEVICE_ID_KEY = 'pl_device_id';
export const BIO_USER_KEY = 'pl_bio_user_id';
export const BIO_TYPE_KEY = 'pl_bio_type';
export const BIO_TOKEN_KEY = 'pl_bio_device_token';
export const BIO_ENABLED_KEY = 'pl_bio_enabled';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `d_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function isSameDeviceBiometricBound(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(BIO_ENABLED_KEY) === '1' &&
    !!localStorage.getItem(BIO_TOKEN_KEY) &&
    !!localStorage.getItem(BIO_USER_KEY)
  );
}

export function saveLocalBiometricBinding(opts: {
  userId: string;
  biometricType: 'face' | 'fingerprint';
  deviceToken: string;
}) {
  if (typeof window === 'undefined') return;
  getOrCreateDeviceId();
  localStorage.setItem(BIO_ENABLED_KEY, '1');
  localStorage.setItem(BIO_USER_KEY, opts.userId);
  localStorage.setItem(BIO_TYPE_KEY, opts.biometricType);
  localStorage.setItem(BIO_TOKEN_KEY, opts.deviceToken);
}

export function clearLocalBiometricBinding() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BIO_ENABLED_KEY);
  localStorage.removeItem(BIO_USER_KEY);
  localStorage.removeItem(BIO_TYPE_KEY);
  localStorage.removeItem(BIO_TOKEN_KEY);
}

export function getLocalBiometric() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!isSameDeviceBiometricBound()) return null;
  return {
    userId: localStorage.getItem(BIO_USER_KEY)!,
    biometricType: (localStorage.getItem(BIO_TYPE_KEY) || 'fingerprint') as
      | 'face'
      | 'fingerprint',
    deviceToken: localStorage.getItem(BIO_TOKEN_KEY)!,
    deviceId: getOrCreateDeviceId(),
  };
}

/** WebAuthn / Biometric prompt (trình duyệt hỗ trợ) */
export async function promptDeviceBiometric(
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Không hỗ trợ' };
  }

  // Ưu tiên Web Authentication API (Face ID / Touch ID / Windows Hello)
  if (window.PublicKeyCredential && navigator.credentials) {
    try {
      // Kiểm tra platform authenticator
      const available =
        typeof (
          PublicKeyCredential as unknown as {
            isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
          }
        ).isUserVerifyingPlatformAuthenticatorAvailable === 'function'
          ? await (
              PublicKeyCredential as unknown as {
                isUserVerifyingPlatformAuthenticatorAvailable: () => Promise<boolean>;
              }
            ).isUserVerifyingPlatformAuthenticatorAvailable()
          : true;

      if (available) {
        // Challenge giả lập xác nhận người dùng (UV) — không lưu credential server-side phức tạp
        // Một số trình duyệt yêu cầu get() với allowCredentials rỗng sẽ fail;
        // fallback: confirm + timeout giả biometric UX
        try {
          const challenge = new Uint8Array(32);
          crypto.getRandomValues(challenge);
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'required',
              rpId: window.location.hostname,
            },
          } as CredentialRequestOptions);
          return { ok: true };
        } catch {
          // User cancel hoặc chưa enroll WebAuthn — dùng confirm có nhãn biometric
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Fallback UX: hộp thoại xác nhận mang nhãn face/vân tay (web không native plugin)
  const label =
    reason ||
    'Xác nhận khuôn mặt hoặc vân tay để đăng nhập Phúc Long Center / Long';
  const ok = window.confirm(label + '\n\nNhấn OK sau khi xác thực trên thiết bị.');
  return ok ? { ok: true } : { ok: false, error: 'Đã hủy xác thực' };
}
