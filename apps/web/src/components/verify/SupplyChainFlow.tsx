'use client';

import { useState } from 'react';

interface Participant {
  name?: string;
  walletAddress: string;
  role: string;
}

interface Props {
  participants: Participant[];
}

const ROLE_COLORS: Record<string, string> = {
  Artisan:   'border-[#00E5A0]/40 bg-[#00E5A0]/10 text-[#00E5A0]',
  Middleman: 'border-sky-500/40    bg-sky-500/10    text-sky-300',
  Seller:    'border-amber-500/40  bg-amber-500/10  text-amber-300',
};

const ROLE_ICONS: Record<string, string> = {
  Artisan:   '🧵',
  Middleman: '🚚',
  Seller:    '🏪',
};

function shortenAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function SupplyChainFlow({ participants }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!participants.length) return null;

  return (
    <div className="space-y-4">
      {/* Horizontal flow — scrollable on small screens */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max mx-auto px-4">
          {participants.map((p, i) => {
            const colorClass = ROLE_COLORS[p.role] ?? 'border-slate-500/40 bg-slate-500/10 text-slate-300';
            const icon = ROLE_ICONS[p.role] ?? '👤';
            return (
              <div key={i} className="flex items-center">
                {/* Node */}
                <button
                  onClick={() => setSelected(selected === i ? null : i)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200
                    hover:scale-105 active:scale-95 cursor-pointer text-center min-w-[100px]
                    ${colorClass}
                    ${selected === i ? 'scale-105 shadow-lg' : ''}`}
                  aria-label={`View ${p.role} details`}
                  aria-expanded={selected === i}
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">{p.role}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">{p.name ?? shortenAddr(p.walletAddress)}</p>
                  </div>
                </button>

                {/* Connector arrow */}
                {i < participants.length - 1 && (
                  <div className="flex items-center px-2">
                    <div className="h-px w-6 bg-gradient-to-r from-white/20 to-white/5" />
                    <svg width="12" height="12" viewBox="0 0 12 12" className="text-slate-500">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded participant detail */}
      {selected !== null && participants[selected] && (
        <div className="glass p-4 rounded-xl border border-white/[0.07] animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">{participants[selected].name ?? 'Anonymous'}</p>
              <p className="text-xs text-slate-400 font-mono">{participants[selected].walletAddress}</p>
            </div>
            <a
              href={`https://amoy.polygonscan.com/address/${participants[selected].walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00E5A0] hover:underline shrink-0"
              aria-label="View address on Polygonscan"
            >
              View on Polygonscan ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
