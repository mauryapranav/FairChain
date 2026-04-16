'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { EscrowPanel }   from '@/components/contract/EscrowPanel';
import { QRModal }       from '@/components/contract/QRModal';
import { ChatDrawer }    from '@/components/contract/ChatDrawer';
import { DisputePanel }  from '@/components/contract/DisputePanel';
import { ProofSection }  from '@/components/contract/ProofSection';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { toast }         from '@/lib/toast';
import { getSocket }     from '@/lib/socket';

interface ContractParticipant {
  walletAddress: string;
  userId: string;
  role: string;
  paymentSplit: number;
}

interface ContractData {
  id: string;
  contractId: string;
  productName: string;
  description: string;
  category: string;
  participants: ContractParticipant[];
  terms: string;
  status: string;
  milestonesEnabled: boolean;
  milestones: Array<{ index: number; description: string; amount: number }>;
  totalAmount?: number;
  txHash?: string;
  ipfsCid?: string;
  imageCid?: string;
  proofTxHash?: string;
  createdBy: string;
  createdAt: string;
  acceptedAt?: string;
  lockedAt?: string;
}

const STATUS_BADGE: Record<string, string> = {
  draft:     'text-slate-400  bg-slate-500/10   border-slate-500/20',
  pending:   'text-amber-300  bg-amber-500/10   border-amber-500/20',
  accepted:  'text-indigo-300 bg-indigo-500/10  border-indigo-500/20',
  rejected:  'text-red-400    bg-red-500/10     border-red-500/20',
  locked:    'text-[#00E5A0] bg-[#00E5A0]/10   border-[#00E5A0]/20',
  completed: 'text-sky-300    bg-sky-500/10     border-sky-500/20',
  disputed:  'text-orange-400 bg-orange-500/10  border-orange-500/20',
};

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { address } = useAccount();
  const { user, isAuthenticated } = useAuth();

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [locking, setLocking]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/contracts/${id}`, { credentials: 'include' });
      if (res.status === 404) { router.push('/explore'); return; }
      const json = await res.json() as { data: ContractData };
      setContract(json.data);
    } catch { toast.error('Failed to load contract'); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { void load(); }, [load]);

  // ── Real-time contract status updates via socket ───────────────────────────
  const { token } = useAuth();
  useEffect(() => {
    if (!token || !id) return;
    const socket = getSocket(token);
    socketRef.current = socket;
    socket.emit('join_room', id);

    // Artisan accepted → creator's Lock button appears without refresh
    socket.on('contract_accepted', (data: { contractId: string; status: string }) => {
      if (data.contractId === id) {
        toast.success('Contract accepted by participant!');
        void load();
      }
    });

    // Contract locked → proof section populates
    socket.on('contract_locked', (data: { contractId: string }) => {
      if (data.contractId === id) {
        toast.success('Contract locked on-chain!');
        void load();
      }
    });

    return () => {
      socket.emit('leave_room', id);
      socket.off('contract_accepted');
      socket.off('contract_locked');
    };
  }, [token, id, load]);

  const isParticipant = contract?.participants.some(
    p => p.walletAddress.toLowerCase() === (address ?? '').toLowerCase()
  ) ?? false;

  const isCreator = contract?.createdBy === user?.id;

  const lockContract = async () => {
    setLocking(true);
    try {
      const res = await fetch(`${API}/api/contracts/${contract?.contractId}/lock`, {
        method: 'PATCH', credentials: 'include',
      });
      if (res.ok) {
        toast.success('Contract locked and proof registered!');
        void load();
      } else {
        const err = await res.json() as { error: string };
        toast.error(err.error ?? 'Lock failed');
      }
    } catch { toast.error('Network error'); }
    finally { setLocking(false); }
  };

  const acceptContract = async () => {
    try {
      const res = await fetch(`${API}/api/contracts/${contract?.contractId}/accept`, {
        method: 'PATCH', credentials: 'include',
      });
      if (res.ok) { toast.success('Contract accepted!'); void load(); }
      else { const err = await res.json() as { error: string }; toast.error(err.error ?? 'Accept failed'); }
    } catch { toast.error('Network error'); }
  };

  const rejectContract = async () => {
    try {
      const res = await fetch(`${API}/api/contracts/${contract?.contractId}/reject`, {
        method: 'PATCH', credentials: 'include',
      });
      if (res.ok) { toast.success('Contract rejected!'); void load(); }
      else { const err = await res.json() as { error: string }; toast.error(err.error ?? 'Reject failed'); }
    } catch { toast.error('Network error'); }
  };

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-2/3 bg-white/[0.05] rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-white/[0.04] rounded-2xl" />
              <div className="h-32 bg-white/[0.04] rounded-2xl" />
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-white/[0.04] rounded-2xl" />
              <div className="h-24 bg-white/[0.04] rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Not found ───────────────────────────────────────────────────── */
  if (!contract) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center glass p-10 rounded-2xl max-w-sm">
          <p className="text-5xl mb-4">📄</p>
          <h1 className="text-xl font-bold text-white mb-2">Contract Not Found</h1>
          <p className="text-sm text-slate-400 mb-6">This contract does not exist or you don&apos;t have access.</p>
          <button onClick={() => router.back()} className="btn-ghost">← Go Back</button>
        </div>
      </main>
    );
  }

  const statusClass = STATUS_BADGE[contract.status] ?? STATUS_BADGE['draft']!;
  const IPFS_GW = 'https://ipfs.io/ipfs';

  return (
    <>
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusClass}`}>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </span>
                <span className="text-xs text-slate-500 font-mono">{contract.contractId.slice(0, 16)}…</span>
                <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                  {contract.category}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white">{contract.productName}</h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Creator: Pending vs Accepted */}
              {isCreator && contract.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400">
                  ⏳ Waiting for Acceptance
                </span>
              )}
              {isCreator && contract.status === 'accepted' && (
                <button
                  onClick={lockContract}
                  disabled={locking}
                  className="btn-primary text-sm"
                  id="btn-lock-contract"
                  aria-label="Lock contract and register on-chain proof"
                >
                  {locking ? '⏳ Locking…' : '🔒 Lock Contract'}
                </button>
              )}

              {/* Participant: Pending (Needs Acceptance) */}
              {isParticipant && !isCreator && contract.status === 'pending' && (
                <>
                  <button onClick={rejectContract} className="btn-ghost text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    ❌ Decline
                  </button>
                  <button onClick={acceptContract} className="btn-primary text-sm bg-[#00E5A0] text-[#0A0F1E] hover:bg-[#00E5A0]/80">
                    ✅ Accept Contract
                  </button>
                </>
              )}

              {/* Chat toggle */}
              {isParticipant && (
                <button
                  onClick={() => { setChatOpen(o => !o); setUnread(0); }}
                  className="btn-ghost text-sm relative"
                  id="btn-open-chat"
                  aria-label="Open contract chat"
                >
                  💬 Chat
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00E5A0] text-[#0A0F1E] text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
              )}

              {/* Verify link */}
              {contract.status === 'locked' || contract.status === 'completed' || contract.status === 'disputed' ? (
                <a href={`/verify/${contract.contractId}`} className="btn-ghost text-sm" aria-label="View public verification page">
                  ⊡ Verify
                </a>
              ) : null}
            </div>
          </div>

          {/* ── Product Image ──────────────────────────────────────── */}
          {contract.imageCid && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${IPFS_GW}/${contract.imageCid}`}
              alt={contract.productName}
              className="w-full max-h-64 object-cover rounded-2xl border border-white/[0.07]"
              loading="lazy"
            />
          )}

          {/* ── Two-column layout ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — 2/3 */}
            <div className="lg:col-span-2 space-y-5">

              {/* Description + Terms */}
              <ErrorBoundary section="description">
                <div className="glass p-6 space-y-4">
                  {contract.description && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Description</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{contract.description}</p>
                    </div>
                  )}
                  {contract.terms && (
                    <div className="border-t border-white/[0.06] pt-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Terms</p>
                      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{contract.terms}</p>
                    </div>
                  )}
                </div>
              </ErrorBoundary>

              {/* Participants */}
              <ErrorBoundary section="participants">
                <div className="glass p-6 space-y-3">
                  <h2 className="font-semibold text-white text-sm">Participants ({contract.participants.length})</h2>
                  <div className="space-y-2">
                    {contract.participants.map((p, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5A0]/20 to-sky-500/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {p.role[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-300">{p.role}</p>
                            <p className="text-[10px] text-slate-600 font-mono truncate">{p.walletAddress}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#00E5A0] shrink-0">{p.paymentSplit}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ErrorBoundary>

              {/* Status Timeline */}
              <StatusTimeline
                status={contract.status}
                createdAt={contract.createdAt}
                acceptedAt={contract.acceptedAt}
                lockedAt={contract.lockedAt}
              />

              {/* Blockchain proof */}
              <ErrorBoundary section="proof">
                <ProofSection
                  contractId={contract.contractId}
                  txHash={contract.txHash}
                  ipfsCid={contract.ipfsCid}
                  proofTxHash={contract.proofTxHash}
                  lockedAt={contract.lockedAt}
                />
              </ErrorBoundary>
            </div>

            {/* Right — 1/3 */}
            <div className="space-y-5">

              {/* Escrow */}
              {isAuthenticated && (
                <ErrorBoundary section="escrow">
                  <EscrowPanel
                    contractId={contract.contractId}
                    contractMilestones={contract.milestones}
                    totalAmount={contract.totalAmount}
                  />
                </ErrorBoundary>
              )}

              {/* QR Code */}
              <div className="glass p-5 space-y-3">
                <h3 className="font-semibold text-white text-sm">Product QR</h3>
                <p className="text-xs text-slate-500">Generate a scannable code for physical product tagging</p>
                <QRModal contractId={contract.contractId} />
              </div>

              {/* Dispute */}
              {(isParticipant || contract.status === 'disputed') && (
                <ErrorBoundary section="dispute">
                  <DisputePanel contractId={contract.contractId} isParticipant={isParticipant} />
                </ErrorBoundary>
              )}

              {/* Meta */}
              <div className="glass p-5 space-y-2 text-xs text-slate-500">
                <p>Created: {new Date(contract.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                {contract.lockedAt && <p>Locked: {new Date(contract.lockedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat drawer */}
      {isParticipant && (
        <ChatDrawer
          contractId={contract.contractId}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}

// ── Status Timeline ────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: 'created',   label: 'Created',   icon: '📝' },
  { key: 'accepted',  label: 'Accepted',  icon: '✅' },
  { key: 'locked',    label: 'Locked',    icon: '🔒' },
  { key: 'completed', label: 'Completed', icon: '🏁' },
] as const;

const STATUS_ORDER: Record<string, number> = {
  pending: 0, draft: 0,
  accepted: 1,
  locked: 2, disputed: 2,
  completed: 3,
};

function StatusTimeline({
  status, createdAt, acceptedAt, lockedAt,
}: {
  status: string;
  createdAt?: string;
  acceptedAt?: string;
  lockedAt?: string;
}) {
  const currentStep = STATUS_ORDER[status] ?? 0;
  const timestamps: Record<string, string | undefined> = {
    created:   createdAt,
    accepted:  acceptedAt,
    locked:    lockedAt,
    completed: status === 'completed' ? lockedAt : undefined,
  };

  return (
    <div className="glass p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Contract Lifecycle</p>
      <div className="flex items-start gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done    = i <= currentStep;
          const current = i === currentStep;
          const ts      = timestamps[step.key];
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
              {/* Connector before */}
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className={`h-px flex-1 transition-colors duration-500 ${
                    i <= currentStep ? 'bg-[#00E5A0]/50' : 'bg-white/[0.06]'
                  }`} />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all duration-300 ${
                  current
                    ? 'bg-[#00E5A0]/20 border-2 border-[#00E5A0] ring-4 ring-[#00E5A0]/10'
                    : done
                      ? 'bg-[#00E5A0]/10 border border-[#00E5A0]/40'
                      : 'bg-white/[0.04] border border-white/[0.08]'
                }`}>
                  <span className={done ? '' : 'opacity-30'}>{step.icon}</span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`h-px flex-1 transition-colors duration-500 ${
                    i < currentStep ? 'bg-[#00E5A0]/50' : 'bg-white/[0.06]'
                  }`} />
                )}
              </div>
              {/* Label + timestamp */}
              <p className={`text-[10px] font-medium text-center mt-1 ${
                current ? 'text-[#00E5A0]' : done ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {step.label}
              </p>
              {ts && (
                <p className="text-[9px] text-slate-600 text-center">
                  {new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
