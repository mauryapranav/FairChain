'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { QRCodeCard } from '@/components/verify/QRCodeCard';

type Tab = 'scan' | 'generate';

interface ContractItem {
  contractId: string;
  productName: string;
  status: string;
}

export default function ScanPage() {
  const router = useRouter();
  const { isConnected, token } = useWallet();

  const [tab, setTab]           = useState<Tab>('scan');
  const [manual, setManual]     = useState('');
  const [error, setError]       = useState('');
  const [scanning, setScanning] = useState(false);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loadingContracts, setLoadingContracts] = useState(false);

  const scannerRef = useRef<{ stop(): Promise<void> } | null>(null);
  const divId      = 'qr-reader-container';

  /* ── Camera scanner (only active on Scan tab) ─────────────────────── */
  useEffect(() => {
    if (tab !== 'scan') return;

    let stopped = false;

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(divId);
      scannerRef.current = scanner;
      setScanning(true);
      setError('');

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (stopped) return;
          const match = decodedText.match(/\/verify\/([a-f0-9-]{36})/);
          const id = match ? match[1] : decodedText.trim();
          if (id) {
            stopped = true;
            void scanner.stop().then(() => router.push(`/verify/${id}`));
          }
        },
        () => { /* ignore per-frame errors */ }
      );
    }

    startScanner().catch(err => {
      setScanning(false);
      setError((err as Error).message ?? 'Camera access denied');
    });

    return () => {
      stopped = true;
      scannerRef.current?.stop().catch(() => {});
    };
  }, [router, tab]);

  /* ── Load owned contracts (Generate tab) ──────────────────────────── */
  useEffect(() => {
    if (tab !== 'generate' || !token) return;
    setLoadingContracts(true);

    fetch('/api/contracts', { credentials: 'include' })
      .then(r => r.json())
      .then((data: { data: ContractItem[] }) => {
        setContracts(data.data ?? []);
        if (data.data?.length) setSelectedId(data.data[0]!.contractId);
      })
      .catch(() => {})
      .finally(() => setLoadingContracts(false));
  }, [tab, token]);

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manual.trim();
    if (!id) return;
    const match = id.match(/\/verify\/([a-f0-9-]{36})/);
    router.push(`/verify/${match ? match[1] : id}`);
  };

  const selectedContract = contracts.find(c => c.contractId === selectedId);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-sm space-y-5">

        {/* Header */}
        <div className="text-center">
          <p className="text-5xl mb-3">⊡</p>
          <h1 className="text-2xl font-bold text-white">FairChain QR</h1>
          <p className="text-sm text-slate-400 mt-1">Scan a product or generate your own QR</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {(['scan', 'generate'] as Tab[]).map(t => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                tab === t
                  ? 'bg-[#00E5A0]/15 text-[#00E5A0] border border-[#00E5A0]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'scan' ? '📷 Scan' : '🔲 Generate'}
            </button>
          ))}
        </div>

        {/* ── Scan tab ─────────────────────────────────────────────── */}
        {tab === 'scan' && (
          <>
            <div className="glass rounded-2xl overflow-hidden">
              <div
                id={divId}
                className="w-full aspect-square"
                aria-label="QR code scanner viewport"
              />
              {!scanning && !error && (
                <div className="flex items-center justify-center aspect-square bg-black/40">
                  <div className="w-8 h-8 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center aspect-square bg-black/40 p-6 text-center">
                  <span className="text-3xl mb-3">📷</span>
                  <p className="text-sm text-red-400 mb-1">Camera unavailable</p>
                  <p className="text-xs text-slate-500">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-xs text-slate-600 font-medium">or enter manually</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            <form onSubmit={handleManual} className="space-y-3">
              <div>
                <label htmlFor="manual-id" className="text-xs text-slate-400 mb-1.5 block">
                  Contract ID or Verify URL
                </label>
                <input
                  id="manual-id"
                  value={manual}
                  onChange={e => setManual(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/40"
                  aria-label="Contract ID or verification URL"
                />
              </div>
              <button
                type="submit"
                disabled={!manual.trim()}
                className="btn-primary w-full justify-center"
                id="btn-manual-verify"
              >
                Verify →
              </button>
            </form>
          </>
        )}

        {/* ── Generate tab ─────────────────────────────────────────── */}
        {tab === 'generate' && (
          <>
            {!isConnected ? (
              <div className="glass rounded-2xl p-8 text-center space-y-3">
                <p className="text-3xl">🔐</p>
                <p className="text-white font-semibold">Wallet required</p>
                <p className="text-sm text-slate-400">Connect your MetaMask to generate QR codes for your contracts.</p>
              </div>
            ) : loadingContracts ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center space-y-3">
                <p className="text-3xl">📦</p>
                <p className="text-white font-semibold">No contracts yet</p>
                <p className="text-sm text-slate-400">Create a contract first to generate its QR code.</p>
              </div>
            ) : (
              <>
                {/* Contract picker */}
                <div>
                  <label htmlFor="contract-select" className="text-xs text-slate-400 mb-1.5 block">
                    Select contract
                  </label>
                  <select
                    id="contract-select"
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E5A0]/40"
                  >
                    {contracts.map(c => (
                      <option key={c.contractId} value={c.contractId} className="bg-slate-900">
                        {c.productName} — {c.status}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedContract && (
                  <QRCodeCard
                    contractId={selectedContract.contractId}
                    productName={selectedContract.productName}
                  />
                )}
              </>
            )}
          </>
        )}

        <p className="text-center text-xs text-slate-700">
          FairChain · Scan any product QR code to verify its supply chain
        </p>
      </div>
    </main>
  );
}
