import Link from 'next/link';
import LiveVideoPlayer from '@/components/LiveVideoPlayer';

export const dynamic = 'force-dynamic';

type Props = { params: { id: string } };

export default async function WatchLivePage({ params }: Props) {
  let session: {
    id: string;
    title: string | null;
    playbackUrl: string | null;
    endedAt: Date | null;
    hostName: string | null;
  } | null = null;

  try {
    if (process.env.DATABASE_URL) {
      const { prisma } = await import('@/lib/prisma');
      const row = await prisma.liveSession.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          title: true,
          playbackUrl: true,
          endedAt: true,
          user: { select: { name: true, fullName: true } },
        },
      });
      if (row) {
        session = {
          id: row.id,
          title: row.title,
          playbackUrl: row.playbackUrl,
          endedAt: row.endedAt,
          hostName: row.user?.fullName || row.user?.name || null,
        };
      }
    }
  } catch {
    session = null;
  }

  const src = session?.playbackUrl || null;
  const live = !!(session && !session.endedAt);

  return (
    <main className="pl-future-shell min-h-screen py-4">
      <div className="max-w-3xl mx-auto px-3">
        <div className="flex items-center justify-between mb-3 gap-2">
          <Link href="/home" className="pl-nav-back text-sm font-semibold shrink-0">
            ← Home
          </Link>
          {session?.hostName && (
            <span className="text-xs text-black/60 truncate">Host: {session.hostName}</span>
          )}
        </div>

        <LiveVideoPlayer
          src={src}
          title={session?.title || 'Livestream'}
          isLive={live}
        />

        <div className="mt-3">
          <h1 className="text-lg font-bold">{session?.title || 'Livestream'}</h1>
          <p className="text-xs text-black/55 mt-1">
            Chạm video → chọn <strong>Tự động / 1080p / 720p / 480p / 360p</strong> và nút{' '}
            <strong>toàn màn hình</strong> (⛶). Cần URL HLS (m3u8) từ nhà cung cấp stream để menu
            độ phân giải hoạt động đầy đủ (ABR).
          </p>
          {!session && (
            <p className="text-sm text-black/50 mt-2">Không tìm thấy phiên hoặc DB chưa sẵn sàng.</p>
          )}
        </div>
      </div>
    </main>
  );
}
