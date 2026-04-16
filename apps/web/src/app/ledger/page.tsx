'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export interface TransactionRecord {
  id: string;
  type: 'CONTRACT_INITIATED' | 'CONTRACT_LOCKED' | 'MILESTONE_RELEASED';
  contractId: string;
  txHash?: string;
  timestamp: string;
  metadata: {
    productName?: string;
    amount?: number;
    description?: string;
  };
}

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '';
const MOCK_TX_PREFIX = '0xmock';

function isMockHash(h?: string) {
  return !h || h.startsWith(MOCK_TX_PREFIX) || h === '0x' + '0'.repeat(64);
}

export default function LedgerPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch(`${API}/api/transactions`, { credentials: 'include' });
      const data = await res.json() as { data: TransactionRecord[] };
      setTransactions(data.data || []);
      setLastRefresh(new Date());
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  // Initial load
  useEffect(() => { void fetchData(); }, [fetchData]);

  const getTypeLabel = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'CONTRACT_INITIATED': return 'Contract Created';
      case 'CONTRACT_LOCKED':    return 'Locked On-Chain';
      case 'MILESTONE_RELEASED': return 'Milestone Paid';
    }
  };

  const getTypeBadge = (type: TransactionRecord['type']) => {
    switch (type) {
      case 'CONTRACT_INITIATED': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'CONTRACT_LOCKED':    return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      case 'MILESTONE_RELEASED': return 'bg-[#00E5A0]/10 text-[#00E5A0] border-[#00E5A0]/20';
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Ledger</h1>
            <p className="text-slate-400 max-w-xl text-sm">
              Real-time, transparent log of all supply chain activity secured on FairChain.
              {lastRefresh && (
                <span className="text-slate-600 ml-2 text-xs">
                  Last updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => void fetchData(true)}
            disabled={refreshing}
            id="btn-refresh-ledger"
            className="btn-ghost text-sm flex items-center gap-2 shrink-0"
            aria-label="Refresh ledger"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg" width="15" height="15"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={refreshing ? 'animate-spin' : ''}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="glass p-10 text-center animate-pulse">
            <p className="text-slate-500">Loading ledger…</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass p-10 text-center space-y-3">
            <p className="text-4xl">📒</p>
            <p className="text-white font-semibold">No transactions yet</p>
            <p className="text-slate-500 text-sm">Create and lock a contract to see on-chain activity here.</p>
            <Link href="/contract/new" className="btn-primary text-sm inline-flex mt-2">+ Create Contract</Link>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.04] border-b border-white/[0.06] text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Event</th>
                    <th className="px-5 py-4 font-medium">Product / Details</th>
                    <th className="px-5 py-4 font-medium">Contract</th>
                    <th className="px-5 py-4 font-medium text-right">Blockchain Tx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-400 tabular-nums text-xs whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>

                      {/* Event badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${getTypeBadge(tx.type)}`}>
                          {getTypeLabel(tx.type)}
                        </span>
                      </td>

                      {/* Product/Details */}
                      <td className="px-5 py-4">
                        {tx.type === 'MILESTONE_RELEASED' ? (
                          <div className="flex flex-col">
                            <span className="text-[#00E5A0] font-semibold">+ ₹{tx.metadata.amount?.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-slate-500">{tx.metadata.description}</span>
                          </div>
                        ) : (
                          <span className="text-white font-medium">{tx.metadata.productName ?? '—'}</span>
                        )}
                      </td>

                      {/* Open contract button */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/contract/${tx.contractId}`)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono group-hover:text-slate-200"
                          title="Open contract"
                          aria-label={`Open contract ${tx.contractId}`}
                        >
                          {tx.contractId.slice(0, 8)}…
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                            <path d="m21 3-9 9" /><path d="M15 3h6v6" />
                          </svg>
                        </button>
                      </td>

                      {/* Blockchain Tx */}
                      <td className="px-5 py-4 text-right">
                        {!tx.txHash ? (
                          <span className="text-xs text-slate-600 italic">Pending…</span>
                        ) : isMockHash(tx.txHash) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-mono">
                            {tx.txHash.slice(0, 8)}… <span className="text-[10px] opacity-70">mock</span>
                          </span>
                        ) : (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-[#00E5A0] hover:bg-white/10 transition-all"
                            aria-label="View on Polygonscan"
                          >
                            {tx.txHash.slice(0, 6)}…{tx.txHash.slice(-4)} ↗
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-white/[0.04] text-xs text-slate-600 flex items-center justify-between">
              <span>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
              <span>Secured on Polygon Amoy</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
