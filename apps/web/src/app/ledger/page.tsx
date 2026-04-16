'use client';

import { useEffect, useState } from 'react';
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

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTypeLabel = (type: TransactionRecord['type']) => {
    switch(type) {
      case 'CONTRACT_INITIATED': return 'Contract Initiated';
      case 'CONTRACT_LOCKED': return 'Contract Locked';
      case 'MILESTONE_RELEASED': return 'Milestone Paid';
    }
  };

  const getDotColor = (type: TransactionRecord['type']) => {
    switch(type) {
      case 'CONTRACT_INITIATED': return 'bg-amber-400';
      case 'CONTRACT_LOCKED': return 'bg-[#4F46E5]';
      case 'MILESTONE_RELEASED': return 'bg-[#00E5A0]';
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-2">Ledger</h1>
        <p className="text-slate-400 mb-8 max-w-2xl">
          A real-time, transparent ledger of all active supply chain activities secured on the FairChain network. Linked natively to Polygon Amoy.
        </p>

        {loading ? (
          <div className="glass p-8 text-center animate-pulse">
            <p className="text-slate-500">Loading ledger data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-slate-500">No on-chain transactions recorded yet.</p>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date (Local)</th>
                    <th className="px-6 py-4 font-medium">Activity</th>
                    <th className="px-6 py-4 font-medium">Ref / Details</th>
                    <th className="px-6 py-4 font-medium text-right">Blockchain Tx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5 text-slate-300 tabular-nums">
                        {new Date(tx.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getDotColor(tx.type)}`} />
                          <span className="font-medium text-white">
                            {getTypeLabel(tx.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {tx.type === 'MILESTONE_RELEASED' ? (
                          <div className="flex flex-col">
                            <span className="text-[#00E5A0] font-medium">+ ₹{tx.metadata.amount?.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-slate-500">{tx.metadata.description}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-white">{tx.metadata.productName}</span>
                            <Link href={`/contract/${tx.contractId}`} className="text-xs text-slate-500 hover:text-white transition-colors">
                              {tx.contractId.slice(0,8)}...
                            </Link>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {tx.txHash ? (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                          >
                            {tx.txHash.slice(0,6)}...{tx.txHash.slice(-4)}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path>
                              <path d="m21 3-9 9"></path>
                              <path d="M15 3h6v6"></path>
                            </svg>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-500 cursor-not-allowed">
                            Pending Lock...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
