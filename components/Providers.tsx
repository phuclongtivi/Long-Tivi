'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from './LanguageProvider';
import AdminAIChatbot from './AdminAIChatbot';
import BiometricAutoLogin from './BiometricAutoLogin';
import NewDeviceEmailGate from './NewDeviceEmailGate';
import GuestOnlyBanner from './GuestOnlyBanner';
import SessionActivityGuard from './SessionActivityGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <NewDeviceEmailGate>
          <GuestOnlyBanner />
          {children}
        </NewDeviceEmailGate>
        <SessionActivityGuard />
        <BiometricAutoLogin />
        <AdminAIChatbot />
      </LanguageProvider>
    </SessionProvider>
  );
}
