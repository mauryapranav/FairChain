import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { AppProviders }       from '@/providers/AppProviders';
import { InstallPrompt }      from '@/components/pwa/InstallPrompt';
import { Navbar }             from '@/components/layout/Navbar';
import { ToastProvider }      from '@/components/ui/ToastProvider';
import { WrongNetworkBanner } from '@/components/ui/WrongNetworkBanner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FairChain — Transparent Supply Chain Contracts',
    template: '%s | FairChain',
  },
  description:
    'FairChain enables transparent, blockchain-anchored supply chain contracts with fair payment distribution for every participant.',
  keywords: ['supply chain', 'blockchain', 'smart contracts', 'fair trade', 'IPFS', 'Polygon'],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'FairChain' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fairchain.io',
    siteName: 'FairChain',
  },
};

export const viewport: Viewport = {
  themeColor: '#2C7A4E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts — Space Grotesk + DM Sans (Paper & Ink system) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AppProviders>
          {/* Paper & Ink background gradient overlay */}
          <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-paper" aria-hidden="true" />

          <Navbar />
          <WrongNetworkBanner />
          <main id="main-content" className="min-h-screen pt-[60px]">
            {children}
          </main>
          <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink-soft/60 font-body">
            <p>© {new Date().getFullYear()} FairChain. Built for transparent, fair supply chains.</p>
          </footer>
          <InstallPrompt />
          <ToastProvider />
        </AppProviders>
      </body>
    </html>
  );
}
