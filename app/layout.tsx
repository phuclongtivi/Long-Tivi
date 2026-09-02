import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/components/event/theme.css';
import '@/components/core/v2-mixer-system.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Long Tivi — Phúc Long Center',
  description: 'Long 1986 V2 Tivi cho xem, LIVE và kết nối thiết bị.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon-192.png',
  },
  appleWebApp: { capable: true, title: 'Long Tivi', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const themeBoot = `(function(){try{var k='pl-theme';var v=localStorage.getItem(k);var ok=v==='pearl'||v==='aqua'||v==='blush'||v==='lavender';if(!ok){v='pearl';localStorage.setItem(k,v);}document.documentElement.setAttribute('data-theme',v);document.documentElement.dataset.theme=v;document.documentElement.removeAttribute('data-long-theme');}catch(e){document.documentElement.setAttribute('data-theme','pearl');document.documentElement.dataset.theme='pearl';document.documentElement.removeAttribute('data-long-theme');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning data-app-profile="tv">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
