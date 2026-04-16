'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TrackOrderBar() {
  const [contractId, setContractId] = useState('');
  const router = useRouter();

  const handleTrack = () => {
    const id = contractId.trim();
    if (!id) return;
    router.push(`/verify/${encodeURIComponent(id)}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <p className="text-xs text-slate-500 mb-3 text-center">
        📦 Track your product — paste the contract ID or scan the QR code on the package
      </p>
      <div className="flex gap-2">
        <input
          id="track-order-input"
          type="text"
          value={contractId}
          onChange={e => setContractId(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleTrack(); }}
          placeholder="Enter contract ID or scan QR…"
          className="flex-1 bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/50 focus:bg-white/[0.07] transition-all"
          aria-label="Contract ID to track"
        />
        <button
          id="btn-track-order"
          onClick={handleTrack}
          disabled={!contractId.trim()}
          className="btn-primary px-5 py-3 text-sm shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Track order"
        >
          🔍 Track
        </button>
      </div>
    </div>
  );
}
