'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';

type KycStatus = 'none' | 'pending' | 'verified';

interface StatusData {
  kycStatus: KycStatus;
  name: string;
  role: string;
}

const STATUS_UI: Record<KycStatus, {
  icon: string;
  color: string;
  bg: string;
  border: string;
  title: string;
  subtitle: string;
}> = {
  none: {
    icon: '🪪',
    color: 'text-slate-300',
    bg: 'bg-slate-700/40',
    border: 'border-slate-600/40',
    title: 'Verify Your Identity',
    subtitle: 'KYC verification lets you participate in contracts and be listed as a trusted artisan or middleman.',
  },
  pending: {
    icon: '⏳',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    title: 'Verification In Progress',
    subtitle: 'Your identity is being verified. This typically takes a few seconds in development and a few minutes in production.',
  },
  verified: {
    icon: '✅',
    color: 'text-[#00E5A0]',
    bg: 'bg-[#00E5A0]/10',
    border: 'border-[#00E5A0]/30',
    title: 'Identity Verified',
    subtitle: 'Your KYC is complete. You can now create and participate in FairChain contracts.',
  },
};

export default function KycPage() {
  const router = useRouter();
  const { isConnected, token } = useWallet();

  const [status, setStatus]     = useState<KycStatus | null>(null);
  const [userData, setUserData] = useState<StatusData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/kyc/status', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch KYC status');
      const data = await res.json() as StatusData;
      setUserData(data);
      setStatus(data.kycStatus);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  // Poll while pending
  useEffect(() => {
    if (status !== 'pending') return;
    const interval = setInterval(() => { void fetchStatus(); }, 3000);
    return () => clearInterval(interval);
  }, [status, fetchStatus]);

  // Redirect to profile when verified
  useEffect(() => {
    if (status === 'verified') {
      const t = setTimeout(() => router.push('/profile'), 3000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  const handleInitiate = async () => {
    setInitiating(true);
    setError(null);
    try {
      const res = await fetch('/api/kyc/initiate', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json() as { status: string; message: string; redirectUrl?: string };
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Failed to start KYC');

      setStatus('pending');

      // If a redirect URL is provided (production KYC provider), open it
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setInitiating(false);
    }
  };

  /* ── Not connected ────────────────────────────────────────────────── */
  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass max-w-sm w-full rounded-2xl p-8 text-center space-y-4">
          <p className="text-4xl">🔐</p>
          <h1 className="text-xl font-bold text-white">Wallet Required</h1>
          <p className="text-sm text-slate-400">Connect your MetaMask wallet to start KYC verification.</p>
          <Link href="/" className="btn-primary justify-center w-full">Back to Home</Link>
        </div>
      </main>
    );
  }

  const ui = status ? STATUS_UI[status] : null;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white">KYC Verification</h1>
          <p className="text-sm text-slate-400 mt-2">
            Prove your identity to unlock full FairChain participation
          </p>
        </div>

        {/* Status card */}
        {loading ? (
          <div className="glass rounded-2xl p-10 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ui && status ? (
          <div className={`rounded-2xl p-6 border-2 space-y-4 ${ui.bg} ${ui.border}`}>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{ui.icon}</div>
              <div>
                <p className={`font-bold text-lg ${ui.color}`}>{ui.title}</p>
                {userData && (
                  <p className="text-slate-400 text-xs mt-0.5">
                    {userData.name} · {userData.role}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{ui.subtitle}</p>

            {status === 'pending' && (
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                Auto-refreshing…
              </div>
            )}

            {status === 'verified' && (
              <p className="text-xs text-[#00E5A0]">Redirecting to your profile in 3 seconds…</p>
            )}
          </div>
        ) : null}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Action */}
        {status === 'none' && !loading && (
          <button
            id="btn-start-kyc"
            onClick={() => { void handleInitiate(); }}
            disabled={initiating}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60"
          >
            {initiating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting verification…
              </>
            ) : (
              '🪪 Start Identity Verification'
            )}
          </button>
        )}

        {status === 'verified' && (
          <Link href="/profile" className="btn-primary w-full justify-center py-3" id="btn-go-profile">
            Go to My Profile →
          </Link>
        )}

        {/* Steps */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">What happens</p>
          {[
            { step: '1', label: 'Click "Start Verification"', done: status !== 'none' },
            { step: '2', label: 'Identity check runs (auto in dev mode)', done: status === 'verified' || status === 'pending' },
            { step: '3', label: 'KYC badge added to your profile', done: status === 'verified' },
          ].map(({ step, label, done }) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                done ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/30' : 'bg-white/[0.05] text-slate-500 border border-white/[0.08]'
              }`}>
                {done ? '✓' : step}
              </div>
              <span className={done ? 'text-slate-300' : 'text-slate-500'}>{label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-700">
          FairChain uses mock KYC in development. Production connects to DigiLocker / HyperVerge.
        </p>
      </div>
    </main>
  );
}
