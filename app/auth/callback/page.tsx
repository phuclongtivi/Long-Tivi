'use client';

import { useRouter } from 'next/navigation';
import LoginSecurityGate from '@/components/LoginSecurityGate';

/** Sau OAuth: kiểm tra cổng bảo mật lần 6+ rồi vào dashboard */
export default function AuthCallbackPage() {
  const router = useRouter();
  return (
    <main
      className="pl-future-shell min-h-screen flex flex-col items-center justify-center p-6"
    >
      <h1 className="text-xl font-bold mb-4">Xác minh đăng nhập</h1>
      <LoginSecurityGate onPassed={() => router.replace('/dashboard')} />
    </main>
  );
}
