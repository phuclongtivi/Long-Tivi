import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CreateNoticeClient from '@/components/CreateNoticeClient';
export default async function CreateEventNoticePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login?callbackUrl=/events/create');
  return <main className="min-h-screen p-4 pb-24" style={{ background: 'var(--pl-bg)', color: 'var(--pl-text)' }}><div className="mx-auto max-w-2xl"><h1 className="mb-1 text-xl font-bold">Tạo thông báo tổ chức</h1><p className="mb-4 text-sm opacity-70">Công bố lịch, vé, quà và khách mời. Thao tác này không bật camera.</p><CreateNoticeClient name={session.user.name || 'Bạn'} userId={session.user.id} role="artist" /></div></main>;
}
