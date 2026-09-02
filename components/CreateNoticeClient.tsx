'use client';
import { EventAnnounceForm } from '@/components/event/EventAnnounceForm';
import type { EventPost } from '@/components/event/types';
export default function CreateNoticeClient({ name, userId, role }: { name: string; userId: string; role: EventPost['organizerRole'] }) {
  return <EventAnnounceForm organizerName={name} organizerId={userId} organizerRole={role} onComplete={(draft) => {
    const post = { ...draft, id: `ev-${Date.now()}`, publishedAt: new Date().toISOString() } as EventPost;
    try { const list = JSON.parse(localStorage.getItem('pl.home.notices.v1') || '[]') as EventPost[]; localStorage.setItem('pl.home.notices.v1', JSON.stringify([post, ...list].slice(0, 100))); } catch { /* unavailable */ }
    window.location.href = '/home';
  }} />;
}
