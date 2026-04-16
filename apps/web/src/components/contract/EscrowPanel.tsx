'use client';

import { useState, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { toast } from '@/lib/toast';

interface Milestone { index: number; description: string; amount: number }
interface EscrowData {
  status: 'unfunded' | 'held' | 'milestone_released' | 'fully_released' | 'refunded';
  totalAmount: number; // paise
  milestones: Array<{ index: number; description: string; amount: number; releasedAt?: string }>;
  onChainTxHash?: string;
}

interface Props {
  contractId: string;
  contractMilestones: Milestone[];
  totalAmount?: number; // INR
  onEscrowUpdate?: (escrow: EscrowData) => void;
}

const STATUS_LABELS: Record<EscrowData['status'], { label: string; color: string }> = {
  unfunded:          { label: 'Unfunded',          color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  held:              { label: 'Held in Escrow',    color: 'text-amber-300  bg-amber-500/10  border-amber-500/20' },
  milestone_released:{ label: 'Partially Released',color: 'text-sky-300    bg-sky-500/10    border-sky-500/20' },
  fully_released:    { label: 'Fully Released',    color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  refunded:          { label: 'Refunded',          color: 'text-purple-300  bg-purple-500/10 border-purple-500/20' },
};

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '';

export function EscrowPanel({ contractId, totalAmount, onEscrowUpdate }: Props) {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [escrow, setEscrow] = useState<EscrowData | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshEscrow = useCallback(async () => {
    const res = await fetch(`${API}/api/escrow/${contractId}`, { credentials: 'include' });
    const json = await res.json() as { data: EscrowData | null };
    if (json.data) { setEscrow(json.data); onEscrowUpdate?.(json.data); }
  }, [contractId, onEscrowUpdate]);

  useState(() => { void refreshEscrow(); });

  const fundEscrow = async () => {
    if (!isConnected) { toast.error('Connect your wallet first'); return; }
    if (!totalAmount || totalAmount < 1) { toast.error('Contract has no amount set'); return; }
    setLoading(true);
    try {
      const orderRes = await fetch(`${API}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ contractId, amountINR: totalAmount }),
      });
      const order = await orderRes.json() as {
        orderId: string; amount: number; currency: string; keyId: string; mock?: boolean;
      };

      if (order.mock) {
        // Mock payment — skip Razorpay modal, verify directly
        await fetch(`${API}/api/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            razorpay_order_id:   order.orderId,
            razorpay_payment_id: `pay_MOCK_${Date.now()}`,
            razorpay_signature:  'MOCK_SIGNATURE',
          }),
        });
        toast.success('Escrow funded (mock payment)');
        await refreshEscrow();
        setLoading(false);
        return;
      }

      openRazorpayCheckout({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'FairChain',
        description: `Fund escrow for contract ${contractId.slice(0, 8)}…`,
        order_id:    order.orderId,
        theme:       { color: '#00E5A0' },
        handler: async (response) => {
          const verifyRes = await fetch(`${API}/api/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            toast.success('Escrow funded successfully!');
            await refreshEscrow();
          } else {
            toast.error('Payment verification failed');
          }
          setLoading(false);
        },
        modal: { ondismiss: () => setLoading(false) },
      });
    } catch {
      toast.error('Failed to create payment order');
      setLoading(false);
    }
  };

  const releaseMilestone = async (milestoneIndex: number) => {
    setLoading(true);
    try {
      const message = `FairChain: Release milestone ${milestoneIndex} for contract ${contractId}`;
      const signature = await signMessageAsync({ message });
      const res = await fetch(`${API}/api/escrow/release/${contractId}/${milestoneIndex}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ signature }),
      });
      if (res.ok) {
        toast.success(`Milestone ${milestoneIndex + 1} released!`);
        await refreshEscrow();
      } else {
        const err = await res.json() as { error: string };
        toast.error(err.error ?? 'Release failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('rejected') || msg.includes('cancelled')) toast.warning('Signature cancelled');
      else toast.error('Release failed');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = escrow ? STATUS_LABELS[escrow.status] : STATUS_LABELS['unfunded'];

  return (
    <div className="glass p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🔒</span> Escrow
        </h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {totalAmount && (
        <div className="text-center py-3 border border-white/[0.06] rounded-xl bg-white/[0.02]">
          <p className="text-3xl font-bold text-gradient">₹{totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-500 mt-1">Contract Value</p>
        </div>
      )}

      {(!escrow || escrow.status === 'unfunded') && totalAmount && (
        <button
          onClick={fundEscrow}
          disabled={loading || !isConnected}
          className="btn-primary w-full justify-center"
          id="btn-fund-escrow"
          aria-label="Fund escrow with Razorpay"
        >
          {loading ? '⏳ Processing…' : '💳 Fund Escrow'}
        </button>
      )}

      {escrow && escrow.status !== 'unfunded' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Milestones</p>
          {escrow.milestones.map(m => (
            <div key={m.index} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 font-bold ${m.releasedAt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                  {m.releasedAt ? '✓' : m.index + 1}
                </span>
                <span className="text-sm text-slate-300 truncate">{m.description}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-white">₹{(m.amount / 100).toLocaleString('en-IN')}</span>
                {!m.releasedAt && (escrow.status === 'held' || escrow.status === 'milestone_released') && (
                  <button
                    onClick={() => releaseMilestone(m.index)}
                    disabled={loading}
                    className="text-xs btn-primary px-2.5 py-1"
                    aria-label={`Release milestone ${m.index + 1}`}
                  >
                    Release
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {escrow?.onChainTxHash && (
        <p className="text-xs text-slate-600 font-mono truncate">
          On-chain: {escrow.onChainTxHash}
        </p>
      )}
    </div>
  );
}
