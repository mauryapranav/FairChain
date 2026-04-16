import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SupplyChainFlow } from '@/components/verify/SupplyChainFlow';
import { PaymentChart }    from '@/components/verify/PaymentChart';
import type { Metadata }   from 'next';

/* ── Types ─────────────────────────────────────────────────────────── */

interface ContractParticipant {
  walletAddress: string;
  role: string;
  paymentSplit: number;
  userId?: string;
}

interface ContractData {
  contractId: string;
  productName: string;
  description: string;
  category: string;
  participants: ContractParticipant[];
  terms: string;
  status: string;
  ipfsCid?: string;
  imageCid?: string;
  proofTxHash?: string;
  txHash?: string;
  totalAmount?: number;
  milestonesEnabled?: boolean;
  milestones?: Array<{ index: number; description: string; amount: number }>;
  createdAt: string;
  lockedAt?: string;
}

interface EscrowData {
  status: string;
  totalAmount: number;
  milestones: Array<{ index: number; description: string; amount: number; releasedAt?: string }>;
}

interface PageResponse {
  data: ContractData;
  escrow: EscrowData | null;
}

/* ── Metadata ───────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const API = process.env['API_URL'] ?? 'http://localhost:4000';
  try {
    const res = await fetch(`${API}/api/contracts/${params.id}`, { cache: 'no-store' });
    const { data } = await res.json() as PageResponse;
    return {
      title: `${data?.productName ?? 'Product'} — Verified on FairChain`,
      description: data?.description ?? 'Blockchain-verified supply chain contract',
    };
  } catch { return { title: 'Verify Product — FairChain' }; }
}

/* ── Page (Server Component) ────────────────────────────────────────── */

const IPFS_GW = 'https://ipfs.io/ipfs';
const POLYGONSCAN = 'https://amoy.polygonscan.com/tx';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const API = process.env['API_URL'] ?? 'http://localhost:4000';

  // Detect auth server-side — hide payment info for anonymous visitors
  const cookieStore = cookies();
  const isAuthenticated = !!cookieStore.get('fc_token')?.value;

  let contractData: ContractData | null = null;
  let escrowData: EscrowData | null = null;

  try {
    const res = await fetch(`${API}/api/contracts/${params.id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json() as PageResponse;
      contractData = json.data;
      escrowData   = json.escrow;
    }
  } catch { /* network error — show not found */ }

  /* ── Not Found ─────────────────────────────────────────────────────── */
  if (!contractData) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl">⚠</div>
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-slate-400 text-sm mb-6">
            This product could not be verified. The contract ID may be invalid or not yet registered on FairChain.
          </p>
          <p className="text-xs text-slate-600 font-mono bg-white/[0.03] rounded px-3 py-2 border border-white/[0.06]">
            ID: {params.id}
          </p>
        </div>
      </main>
    );
  }

  const isVerified = ['locked', 'completed'].includes(contractData.status);

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Verified Badge ─────────────────────────────────────────── */}
        <div className={`rounded-2xl p-6 border-2 flex items-center gap-4 ${
          isVerified
            ? 'border-[#00E5A0]/40 bg-[#00E5A0]/8'
            : 'border-amber-500/40 bg-amber-500/8'
        }`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${
            isVerified ? 'bg-[#00E5A0]/20' : 'bg-amber-500/20'
          }`}>
            {isVerified ? '✓' : '⏳'}
          </div>
          <div>
            <h1 className={`text-xl font-extrabold ${isVerified ? 'text-[#00E5A0]' : 'text-amber-300'}`}>
              {isVerified ? 'Verified on Blockchain' : 'Pending Verification'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isVerified
                ? `Registered on Polygon Amoy · ${contractData.lockedAt ? new Date(contractData.lockedAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Recently'}`
                : 'Contract is pending finalization by the creator'}
            </p>
          </div>
        </div>

        {/* ── Product Identity ──────────────────────────────────────── */}
        <section className="glass p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Product Identity</h2>

          {contractData.imageCid && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`${IPFS_GW}/${contractData.imageCid}`}
              alt={contractData.productName}
              className="w-full h-48 object-cover rounded-xl border border-white/[0.07]"
              loading="lazy"
            />
          )}

          <div className="space-y-3">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Product Name</p>
              <p className="text-white font-semibold">{contractData.productName}</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Category</p>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300">
                  {contractData.category}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Created</p>
                <p className="text-sm text-slate-300">{new Date(contractData.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
              </div>
            </div>
            {contractData.description && (
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Description</p>
                <p className="text-sm text-slate-300 leading-relaxed">{contractData.description}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Supply Chain Journey ──────────────────────────────────── */}
        <section className="glass p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Supply Chain Journey</h2>
          <p className="text-xs text-slate-500">Tap any participant to see their full details</p>
          <SupplyChainFlow participants={contractData.participants} />
        </section>

        {/* ── Payment Transparency ──────────────────────────────────────── */}
        {isAuthenticated ? (
          <section className="glass p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Payment Transparency</h2>
            {contractData.totalAmount && (
              <p className="text-2xl font-bold text-gradient">
                ₹{contractData.totalAmount.toLocaleString('en-IN')}
                <span className="text-sm text-slate-500 font-normal ml-2">total contract value</span>
              </p>
            )}
            <PaymentChart
              participants={contractData.participants}
              totalAmount={contractData.totalAmount}
            />
            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              {contractData.participants.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{p.role}</span>
                  <div className="text-right">
                    <span className="text-white font-medium">{p.paymentSplit}%</span>
                    {contractData.totalAmount && (
                      <span className="text-[#00E5A0] text-xs ml-2">
                        ₹{Math.round(contractData.totalAmount * p.paymentSplit / 100).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="glass p-6 flex items-center gap-4 border border-white/[0.06]">
            <div className="w-10 h-10 rounded-full bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-xl shrink-0">🔒</div>
            <div>
              <p className="text-sm font-semibold text-white">Payment details are private</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect your wallet to view payment splits and contract amounts.
              </p>
            </div>
          </section>
        )}

        {/* ── Blockchain Proof ──────────────────────────────────────── */}
        {isVerified && (
          <section className="glass p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2"><span>⛓</span> Blockchain Proof</h2>
              {contractData.ipfsCid && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                  Stored on Filecoin
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <ProofRow label="Contract ID" value={contractData.contractId.slice(0, 16) + '…'} />
              {contractData.txHash && (
                <ProofRow label="Payment Tx" value="" href={`${POLYGONSCAN}/${contractData.txHash}`} linkText={`${contractData.txHash.slice(0, 10)}… ↗`} />
              )}
              {contractData.ipfsCid && (
                <ProofRow label="IPFS Metadata" value="" href={`${IPFS_GW}/${contractData.ipfsCid}`} linkText={`${contractData.ipfsCid.slice(0, 10)}… ↗`} />
              )}
              {contractData.proofTxHash && (
                <ProofRow label="Proof Registry" value="" href={`${POLYGONSCAN}/${contractData.proofTxHash}`} linkText={`${contractData.proofTxHash.slice(0, 10)}… ↗`} />
              )}
              {contractData.lockedAt && (
                <ProofRow label="Registered On" value={new Date(contractData.lockedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
              )}
            </div>
          </section>
        )}

        {/* ── Escrow Status ──────────────────────────────────────────── */}
        {escrowData && (
          <section className="glass p-6 space-y-3">
            <h2 className="text-base font-semibold text-white">Escrow Status</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Amount</span>
              <span className="text-white font-semibold">₹{(escrowData.totalAmount / 100).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Status</span>
              <span className="text-xs capitalize px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {escrowData.status.replace(/_/g, ' ')}
              </span>
            </div>
            {escrowData.milestones.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                {escrowData.milestones.map(m => (
                  <div key={m.index} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center ${m.releasedAt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                        {m.releasedAt ? '✓' : (m.index + 1)}
                      </span>
                      {m.description}
                    </span>
                    <span className="text-white font-medium">₹{(m.amount / 100).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 pb-4">
          Powered by FairChain · Polygon Amoy · IPFS
        </p>
      </div>
    </main>
  );
}

function ProofRow({ label, value, href, linkText }: { label: string; value: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-slate-500 text-xs shrink-0">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00E5A0] text-xs hover:underline font-mono">
          {linkText}
        </a>
      ) : (
        <span className="text-slate-300 text-xs font-mono">{value}</span>
      )}
    </div>
  );
}
