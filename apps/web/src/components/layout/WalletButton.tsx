'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        if (!connected) {
          return (
            <button
              id="btn-connect-wallet"
              onClick={openConnectModal}
              className="btn-primary"
              type="button"
              aria-label="Connect your crypto wallet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              Connect Wallet
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {chain.unsupported && (
              <button onClick={openChainModal} className="btn-ghost text-xs text-red-400 border-red-400/30" type="button">
                Wrong Network
              </button>
            )}
            <button
              id="btn-wallet-account"
              onClick={openAccountModal}
              className={cn('btn-ghost text-xs font-mono')}
              type="button"
              aria-label="Wallet account menu"
            >
              <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse-accent" aria-hidden="true" />
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
