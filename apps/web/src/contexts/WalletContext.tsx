'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
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
  const { connectAsync, connectors }     = useConnect();
  const { disconnectAsync }              = useDisconnect();
  const { signMessageAsync }             = useSignMessage();
  const { login: authLogin, logout: authLogout, user, token } = useAuth();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Trigger SIWE auth flow whenever wallet connects (and user isn't already logged in)
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
      // 1. Check for existing session (httpOnly cookie)
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.ok) {
        const { user: existingUser } = (await meRes.json()) as { user: User };
        authLogin(existingUser, 'cookie-session');
        return;
      }

      // 2. Get sign challenge from backend
      const nonceRes = await fetch(`/api/auth/nonce?address=${walletAddress}`);
      if (!nonceRes.ok) throw new Error('Failed to get nonce');
      const { message } = (await nonceRes.json()) as { message: string };

      // 3. Ask MetaMask to sign
      const signature = await signMessageAsync({ message });

      // 4. Verify signature → JWT cookie
      const loginRes = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress, signature }),
      });

      if (loginRes.status === 404) {
        // New wallet — onboard
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

  /** Connect MetaMask (the only connector registered in wagmi config) */
  const connect = useCallback(() => {
    const mm = connectors[0]; // MetaMask is the sole connector
    if (mm) void connectAsync({ connector: mm });
  }, [connectors, connectAsync]);

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
