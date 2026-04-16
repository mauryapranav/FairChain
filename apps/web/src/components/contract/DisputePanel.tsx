'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast';

interface Props {
  contractId: string;
  isParticipant: boolean;
}

type DisputeStatus = 'open' | 'under_review' | 'resolved';

interface Dispute {
  contractId: string;
  raisedBy: string;
  reason: string;
  evidence: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<DisputeStatus, { icon: string; color: string; label: string }> = {
  open:         { icon: '⚠', color: 'text-red-400    border-red-500/30    bg-red-500/10',    label: 'Open' },
  under_review: { icon: '🔍', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', label: 'Under Review' },
  resolved:     { icon: '✓', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', label: 'Resolved' },
};

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '';

export function DisputePanel({ contractId, isParticipant }: Props) {
  const [dispute, setDispute]   = useState<Dispute | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason]     = useState('');
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading]   = useState(false);

  // Fetch existing dispute on mount
  useState(() => {
    fetch(`${API}/api/disputes/${contractId}`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: { data: Dispute | null }) => { if (d.data) setDispute(d.data); })
      .catch(() => {});
  });

  const submitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !evidence.trim()) { toast.error('Reason and evidence are required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/disputes/raise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ contractId, reason, evidence }),
      });
      const data = await res.json() as { data?: Dispute; error?: string };
      if (!res.ok) { toast.error(data.error ?? 'Failed to raise dispute'); return; }
      setDispute(data.data!);
      setShowForm(false);
      toast.success('Dispute raised — escrow is now frozen');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  if (dispute) {
    const cfg = STATUS_CONFIG[dispute.status];
    return (
      <div className={`glass p-5 space-y-3 border ${cfg.color.split(' ').filter(c => c.startsWith('border')).join(' ')}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{cfg.icon}</span>
          <div>
            <p className="font-semibold text-white text-sm">
              Under Dispute — funds frozen
            </p>
            <p className={`text-xs font-medium ${cfg.color.split(' ')[0]}`}>{cfg.label}</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <p><span className="text-slate-500">Reason:</span> {dispute.reason}</p>
          {dispute.resolution && <p><span className="text-slate-500">Resolution:</span> {dispute.resolution}</p>}
        </div>
      </div>
    );
  }

  if (!isParticipant) return null;

  return (
    <div className="space-y-2">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-ghost w-full justify-center text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-sm"
          id="btn-raise-dispute"
          aria-label="Raise a dispute for this contract"
        >
          ⚠ Raise Dispute
        </button>
      ) : (
        <form onSubmit={disputeSubmit => submitDispute(disputeSubmit)} className="glass p-5 space-y-4">
          <h4 className="font-semibold text-white text-sm">Raise a Dispute</h4>
          <div>
            <label className="text-xs text-slate-400 mb-1 block" htmlFor="dispute-reason">Reason</label>
            <input
              id="dispute-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Brief reason for the dispute"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40"
              maxLength={200}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block" htmlFor="dispute-evidence">Evidence</label>
            <textarea
              id="dispute-evidence"
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              placeholder="Describe in detail what went wrong and any supporting evidence…"
              rows={4}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/40 resize-none"
              maxLength={2000}
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] flex-1 justify-center text-sm">
              {loading ? 'Submitting…' : 'Submit Dispute'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
