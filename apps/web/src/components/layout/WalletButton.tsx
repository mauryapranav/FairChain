'use client';

import { useWallet } from '@/contexts/WalletContext';
import { useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

export function WalletButton() {
  const { address, isConnected, isAuthenticating, connect, disconnect } = useWallet();
  const chainId     = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== polygonAmoy.id;

  if (isAuthenticating) {
    return (
      <button className="btn-primary opacity-70 cursor-wait" disabled aria-label="Authenticating">
        <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
        Signing in…
      </button>
    );
  }

  if (wrongNetwork) {
    return (
      <button
        id="btn-switch-network"
        onClick={() => switchChain?.({ chainId: polygonAmoy.id })}
        className="btn-ghost text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg"
        type="button"
        aria-label="Switch to Polygon Amoy"
      >
        ⚠ Wrong Network — Switch to Amoy
      </button>
    );
  }

  if (!isConnected) {
    return (
      <button
        id="btn-connect-wallet"
        onClick={connect}
        className="btn-primary"
        type="button"
        aria-label="Connect MetaMask wallet"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
        Connect MetaMask
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        id="btn-wallet-account"
        onClick={() => void disconnect()}
        className="btn-ghost text-xs font-mono gap-2"
        type="button"
        title="Click to disconnect"
        aria-label="Connected wallet — click to disconnect"
      >
        <span className="h-2 w-2 rounded-full bg-[#00E5A0] animate-pulse" aria-hidden="true" />
        {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''}
      </button>
    </div>
  );
}
