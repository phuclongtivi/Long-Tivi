'use client';

/**
 * Nút Home (góc trên bên phải) — chỉ hiện khi KHÔNG ở màn hình chính.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isHomePath(pathname: string | null): boolean {
  if (!pathname) return true;
  // Trang chủ: / hoặc /?query
  return pathname === '/' || pathname === '';
}

export default function HomeButton() {
  const pathname = usePathname();

  if (isHomePath(pathname)) return null;

  return (
    <Link
      href="/"
      aria-label="Về màn hình chính"
      title="Về trang chủ"
      className="fixed top-3 right-3 z-[70] w-11 h-11 rounded-full shadow-lg flex items-center justify-center border active:scale-95 transition-transform"
      style={{
        backgroundColor: '#1A1A1A',
        borderColor: '#D4C9B5',
        color: '#F5F0E6',
      }}
    >
      {/* Icon home đơn giản */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.15"
        />
      </svg>
    </Link>
  );
}
