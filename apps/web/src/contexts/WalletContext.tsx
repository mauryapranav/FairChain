'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';

import type { User } from '@fairchain/shared';
import { useAuth } from './AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isAuthenticating: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  identity: User | null;
  token: string | null;
}

// ── Context ───────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, status } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const { login: authLogin, logout: authLogout, user, token } = useAuth();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Trigger auth flow when wallet connects
  useEffect(() => {
    if (status === 'connected' && address && !user) {
      void handleWalletConnect(address);
    }
    if (status === 'disconnected') {
      void authLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, address]);

  const handleWalletConnect = async (walletAddress: string) => {
    setIsAuthenticating(true);
    try {
      // 1. Check for existing authenticated session
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.ok) {
        const { user: existingUser } = (await meRes.json()) as { user: User };
        authLogin(existingUser, 'cookie-session');
        return;
      }

      // 2. Request a sign challenge (nonce)
      const nonceRes = await fetch(`/api/auth/nonce?address=${walletAddress}`);
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { message } = (await nonceRes.json()) as { message: string };

      // 3. Ask user to sign in wallet
      const signature = await signMessageAsync({ message });

      // 4. Verify signature → issue JWT
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress, signature }),
      });

      if (loginRes.status === 404) {
        // Wallet not registered → onboard
        router.push('/onboard');
        return;
      }

      if (loginRes.ok) {
        const { user: loggedInUser, token: newToken } = (await loginRes.json()) as {
          user: User;
          token: string;
        };
        authLogin(loggedInUser, newToken);
      }
    } catch (err) {
      console.error('[WalletContext] auth error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const connect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  const disconnect = useCallback(async () => {
    await disconnectAsync();
    await authLogout();
  }, [disconnectAsync, authLogout]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isAuthenticating,
        connect,
        disconnect,
        identity: user,
        token,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}
