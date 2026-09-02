'use client';

import { useParams, useRouter } from 'next/navigation';
import { LiveParticipantsMap } from '@/components/LiveParticipantsMap';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/components/LanguageProvider';

export default function LiveParticipantsMapPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const liveSessionId = String(params?.id || '');

  if (!liveSessionId) {
    return (
      <div className="pl-future-shell min-h-screen flex items-center justify-center">
        Invalid live session
      </div>
    );
  }

  return (
    <div className="pl-future-shell min-h-screen">
      <header className="pl-glass-bar sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="pl-nav-back text-sm font-semibold"
        >
          ← {t('back')}
        </button>
        <h1 className="text-sm font-bold">{t('participants_map')}</h1>
        <LanguageSwitcher compact />
      </header>

      <main className="mx-auto max-w-lg px-3 py-4">
        <LiveParticipantsMap liveSessionId={liveSessionId} />
      </main>
    </div>
  );
}
