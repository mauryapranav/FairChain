'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { WagmiProvider } from 'wagmi';

import '@rainbow-me/rainbowkit/styles.css';

import { wagmiConfig } from '@/lib/wagmi';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';

export function AppProviders({ children }: { children: ReactNode }) {
  // Stable QueryClient instance per session
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00E5A0',
            accentColorForeground: '#0A0F1E',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          {/* AuthProvider first — WalletProvider consumes it */}
          <AuthProvider>
            <WalletProvider>{children}</WalletProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
