'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Tab cũ Yêu thích → chuyển sang Home Chat */
export default function FavoritesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/home?inbox=open');
  }, [router]);
  return (
    <p className="pl-future-shell min-h-screen p-8 text-center text-sm">
      Đang chuyển tới Home Chat...
    </p>
  );
}
