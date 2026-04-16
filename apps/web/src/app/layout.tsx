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
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FairChain' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fairchain.io',
    siteName: 'FairChain',
  },
};

export const viewport: Viewport = {
  themeColor: '#00E5A0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-navy antialiased">
        <AppProviders>
          {/* Hero background glow */}
          <div className="pointer-events-none fixed inset-0 -z-10 bg-hero-glow" aria-hidden="true" />
          <Navbar />
          <WrongNetworkBanner />
          <main id="main-content" className="min-h-screen pt-[60px]">
            {children}
          </main>
          <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} FairChain. Built for transparent, fair supply chains.</p>
          </footer>
          <InstallPrompt />
          <ToastProvider />
        </AppProviders>
      </body>
    </html>
  );
}
