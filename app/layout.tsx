import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/components/event/theme.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Long ProApp — Phúc Long Center',
  description: 'Headquarter web pro cho livestream, AI, thiết bị và điều phối Long.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Long ProApp',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{localStorage.setItem("pl-theme","light");document.documentElement.setAttribute("data-theme","light");document.documentElement.setAttribute("data-long-theme","aqua");document.documentElement.dataset.theme="light";}catch(e){document.documentElement.setAttribute("data-theme","light");document.documentElement.setAttribute("data-long-theme","aqua");}})();',
          }}
        />
      </head>
      <body className="antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
