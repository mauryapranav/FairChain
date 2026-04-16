'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';

interface Participant { walletAddress: string; role: string; paymentSplit: number; userId: string }
interface Milestone  { index: number; description: string; amount: number }

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '';
const CATEGORIES = ['Textiles', 'Jewellery', 'Handicrafts', 'Spices', 'Pottery', 'Woodwork', 'Leather', 'Electronics', 'Agriculture', 'Other'];
const ROLES = ['Artisan', 'Middleman', 'Seller'];

export default function NewContractPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Product
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCid, setImageCid]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Step 2 — Participants
  const [participants, setParticipants] = useState<Participant[]>([
    { walletAddress: address ?? '', role: 'Artisan', paymentSplit: 100, userId: user?.id ?? '' },
  ]);

  // Step 3 — Milestones
  const [milestonesEnabled, setMilestonesEnabled] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([{ index: 0, description: '', amount: 0 }]);
  const [totalAmount, setTotalAmount] = useState('');

  // Step 4 — Terms
  const [terms, setTerms] = useState('');

  const splitTotal = participants.reduce((s, p) => s + p.paymentSplit, 0);

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const uploadImage = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res  = await fetch(`${API}/api/ipfs/upload-image`, {
        method: 'POST', credentials: 'include', body: form,
      });
      const data = await res.json() as { cid: string };
      setImageCid(data.cid);
      toast.success('Image uploaded to IPFS!');
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(false); }
  };

  const addParticipant = () => {
    setParticipants(p => [...p, { walletAddress: '', role: 'Middleman', paymentSplit: 0, userId: '' }]);
  };

  const removeParticipant = (i: number) => {
    setParticipants(p => p.filter((_, idx) => idx !== i));
  };

  const updateParticipant = (i: number, field: keyof Participant, value: string | number) => {
    setParticipants(p => p.map((pt, idx) => idx === i ? { ...pt, [field]: value } : pt));
  };

  const addMilestone = () => {
    setMilestones(m => [...m, { index: m.length, description: '', amount: 0 }]);
  };

  const updateMilestone = (i: number, field: keyof Milestone, value: string | number) => {
    setMilestones(m => m.map((ms, idx) => idx === i ? { ...ms, [field]: value } : ms));
  };

  const submit = async () => {
    if (!isAuthenticated) { toast.error('Connect wallet first'); return; }
    if (!productName || !description || !category || !terms) {
      toast.error('All fields are required'); return;
    }
    if (Math.abs(splitTotal - 100) > 0.01) {
      toast.error('Payment splits must total exactly 100%'); return;
    }

    setSubmitting(true);
    try {
      const body = {
        productName, description, category, terms,
        participants,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        milestonesEnabled,
        milestones: milestonesEnabled ? milestones : [],
        imageCid,
      };

      const res  = await fetch(`${API}/api/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json() as { data?: { contractId: string }; error?: string };

      if (!res.ok) { toast.error(data.error ?? 'Failed to create contract'); return; }
      toast.success('Contract created!');
      router.push(`/contract/${data.data!.contractId}`);
    } catch { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="glass p-10 rounded-2xl text-center max-w-sm">
          <p className="text-4xl mb-4">🔑</p>
          <h1 className="text-xl font-bold text-white mb-2">Connect Wallet</h1>
          <p className="text-sm text-slate-400">You need to connect your wallet to create a contract.</p>
        </div>
      </main>
    );
  }

  const STEP_LABELS = ['Product', 'Participants', 'Milestones', 'Terms', 'Review'];

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-white">Create Contract</h1>
          <p className="text-sm text-slate-400 mt-1">Set up a transparent supply chain agreement</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                  ${step === i + 1 ? 'text-[#00E5A0]' : i + 1 < step ? 'text-slate-400 hover:text-slate-200 cursor-pointer' : 'text-slate-600 cursor-default'}`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold
                  ${step === i + 1 ? 'bg-[#00E5A0] text-[#0A0F1E]' : i + 1 < step ? 'bg-slate-600 text-white' : 'bg-white/[0.06] text-slate-600'}`}>
                  {i + 1 < step ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-white/[0.06]" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Product ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="glass p-6 space-y-4">
            <h2 className="font-semibold text-white">Product Details</h2>

            <div>
              <label className="text-xs text-slate-400 mb-1 block" htmlFor="product-name">Product Name *</label>
              <input id="product-name" value={productName} onChange={e => setProductName(e.target.value)}
                placeholder="e.g. Hand-woven Pashmina Shawl"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/40" />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block" htmlFor="category">Category *</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5A0]/40">
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block" htmlFor="description">Description *</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder="Describe the product and its origin…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/40 resize-none" />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block" htmlFor="product-image">Product Image (optional)</label>
              <div className="flex items-center gap-3">
                <input type="file" id="product-image" accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); uploadImage(f); } }}
                  className="hidden" />
                <label htmlFor="product-image"
                  className="btn-ghost text-sm cursor-pointer">
                  📎 {imageFile ? imageFile.name : 'Upload image'}
                </label>
                {uploading && <span className="text-xs text-slate-500 animate-pulse">Uploading to IPFS…</span>}
                {imageCid && <span className="text-xs text-[#00E5A0]">✓ Pinned</span>}
              </div>
            </div>

            <button onClick={() => { if (!productName || !description || !category) { toast.error('Fill required fields'); return; } setStep(2); }}
              className="btn-primary w-full justify-center">
              Next: Participants →
            </button>
          </div>
        )}

        {/* ── Step 2: Participants ─────────────────────────────────── */}
        {step === 2 && (
          <div className="glass p-6 space-y-4">
            <h2 className="font-semibold text-white">Participants</h2>
            <p className="text-xs text-slate-500">Add all parties in the supply chain. Splits must total 100%.</p>

            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Participant {i + 1}</span>
                    {participants.length > 1 && (
                      <button onClick={() => removeParticipant(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    )}
                  </div>
                  <input
                    value={p.walletAddress}
                    onChange={e => updateParticipant(i, 'walletAddress', e.target.value)}
                    placeholder="0x… wallet address"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-[#00E5A0]/30"
                  />
                  <div className="flex gap-2">
                    <select value={p.role} onChange={e => updateParticipant(i, 'role', e.target.value)}
                      className="flex-1 bg-[#111827] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <div className="flex items-center gap-1 border border-white/[0.08] rounded-lg px-3 py-2 bg-white/[0.04]">
                      <input type="number" value={p.paymentSplit} min={0} max={100}
                        onChange={e => updateParticipant(i, 'paymentSplit', parseFloat(e.target.value) || 0)}
                        className="w-12 bg-transparent text-xs text-white focus:outline-none" />
                      <span className="text-xs text-slate-500">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button onClick={addParticipant} className="btn-ghost text-sm">+ Add participant</button>
              <span className={`text-xs font-semibold ${Math.abs(splitTotal - 100) < 0.01 ? 'text-[#00E5A0]' : 'text-red-400'}`}>
                Total: {splitTotal}%
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center text-sm">← Back</button>
              <button onClick={() => { if (Math.abs(splitTotal - 100) > 0.01) { toast.error('Splits must total 100%'); return; } setStep(3); }}
                className="btn-primary flex-1 justify-center">Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Milestones ───────────────────────────────────── */}
        {step === 3 && (
          <div className="glass p-6 space-y-4">
            <h2 className="font-semibold text-white">Payment & Milestones</h2>

            <div>
              <label className="text-xs text-slate-400 mb-1 block" htmlFor="total-amount">Total Contract Value (₹)</label>
              <input id="total-amount" type="number" value={totalAmount} min={1} onChange={e => setTotalAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/40" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setMilestonesEnabled(e => !e)}
                className={`w-10 h-5 rounded-full transition-colors relative ${milestonesEnabled ? 'bg-[#00E5A0]' : 'bg-slate-600'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${milestonesEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-300">Enable milestone-based payments (1–5 milestones)</span>
            </label>

            {milestonesEnabled && (
              <div className="space-y-3">
                {milestones.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs text-slate-500 w-4 shrink-0">{i + 1}.</span>
                    <input value={m.description} onChange={e => updateMilestone(i, 'description', e.target.value)}
                      placeholder="Milestone description"
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none" />
                    <div className="flex items-center gap-1 border border-white/[0.08] rounded-lg px-2 py-2 bg-white/[0.04] shrink-0">
                      <span className="text-xs text-slate-500">₹</span>
                      <input type="number" value={m.amount} min={0} onChange={e => updateMilestone(i, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-16 bg-transparent text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                ))}
                {milestones.length < 5 && (
                  <button onClick={addMilestone} className="text-xs text-slate-500 hover:text-slate-300">+ Add milestone</button>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1 justify-center text-sm">← Back</button>
              <button onClick={() => setStep(4)} className="btn-primary flex-1 justify-center">Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Terms ────────────────────────────────────────── */}
        {step === 4 && (
          <div className="glass p-6 space-y-4">
            <h2 className="font-semibold text-white">Contract Terms</h2>
            <div>
              <label className="text-xs text-slate-400 mb-1 block" htmlFor="terms">Terms & Conditions *</label>
              <textarea id="terms" value={terms} onChange={e => setTerms(e.target.value)}
                rows={8} placeholder="Describe the obligations, delivery conditions, quality standards, dispute procedures…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/40 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-ghost flex-1 justify-center text-sm">← Back</button>
              <button onClick={() => { if (!terms.trim()) { toast.error('Terms are required'); return; } setStep(5); }}
                className="btn-primary flex-1 justify-center">Review →</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Review & Submit ────────────────────────────── */}
        {step === 5 && (
          <div className="glass p-6 space-y-5">
            <h2 className="font-semibold text-white">Review & Create</h2>
            <div className="space-y-3 text-sm">
              <Row label="Product"    value={productName} />
              <Row label="Category"   value={category} />
              <Row label="Participants" value={`${participants.length} parties`} />
              <Row label="Total Value" value={totalAmount ? `₹${parseFloat(totalAmount).toLocaleString('en-IN')}` : 'Not set'} />
              <Row label="Milestones" value={milestonesEnabled ? `${milestones.length} milestones` : 'Single payment'} />
              <Row label="Image"      value={imageCid ? '✓ Pinned to IPFS' : 'No image'} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="btn-ghost flex-1 justify-center text-sm">← Back</button>
              <button onClick={submit} disabled={submitting} className="btn-primary flex-1 justify-center">
                {submitting ? '⏳ Creating…' : '✓ Create Contract'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-white/[0.05] last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}
