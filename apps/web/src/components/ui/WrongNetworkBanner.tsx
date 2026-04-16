'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

export function WrongNetworkBanner() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  // Only show when wallet is connected AND on wrong network
  if (!chainId || chainId === polygonAmoy.id) return null;

  return (
    <div
      className="fixed top-[60px] left-0 right-0 z-40 flex items-center justify-between
        gap-3 px-4 py-2.5 text-sm
        bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm"
      role="alert"
    >
      <div className="flex items-center gap-2 text-amber-300">
        <span className="text-base">⚠</span>
        <span className="font-medium">
          Wrong network — FairChain runs on <strong>Polygon Amoy</strong> (chain {polygonAmoy.id})
        </span>
      </div>
      <button
        onClick={() => switchChain({ chainId: polygonAmoy.id })}
        disabled={isPending}
        className="btn-primary text-xs px-3 py-1.5 shrink-0"
        aria-label="Switch to Polygon Amoy testnet"
      >
        {isPending ? 'Switching…' : 'Switch Network'}
      </button>
    </div>
  );
}
