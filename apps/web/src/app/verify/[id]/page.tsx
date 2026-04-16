import { cookies } from 'next/headers';
import { SupplyChainFlow } from '@/components/verify/SupplyChainFlow';
import { PaymentChart }    from '@/components/verify/PaymentChart';
import type { Metadata }   from 'next';

/* ── Types ─────────────────────────────────────────────────────────── */

interface ContractParticipant {
  walletAddress: string;
  role: string;
  paymentSplit: number;
  userId?: string;
  name?: string; // enriched from users API
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

interface UserData {
  name?: string;
  walletAddress: string;
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

/* ── Helper ─────────────────────────────────────────────────────────── */

async function fetchUserName(API: string, walletAddress: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${API}/api/users/${walletAddress.toLowerCase()}`, { cache: 'no-store' });
    if (res.ok) {
      const { data } = await res.json() as { data: UserData };
      return data?.name;
    }
  } catch { /* ignore */ }
  return undefined;
}

function isMockHash(h?: string) {
  return !h || h.startsWith('0xmock') || h === '0x' + '0'.repeat(64);
}

function isMockCid(c?: string) {
  return !c || c.startsWith('bafybeimock') || c.startsWith('bafybeifile');
}

/* ── Page (Server Component) ────────────────────────────────────────── */

const IPFS_GW    = 'https://ipfs.io/ipfs';
const POLYGONSCAN = 'https://amoy.polygonscan.com/tx';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const API = process.env['API_URL'] ?? 'http://localhost:4000';

  const cookieStore = cookies();
  const isAuthenticated = !!cookieStore.get('fc_token')?.value;

  let contractData: ContractData | null = null;
  let escrowData:   EscrowData | null = null;

  try {
    const res = await fetch(`${API}/api/contracts/${params.id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json() as PageResponse;
      contractData = json.data;
      escrowData   = json.escrow;
    }
  } catch { /* network error */ }

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

  /* ── Enrich participants with names from users API ─────────────────── */
  const enrichedParticipants: ContractParticipant[] = await Promise.all(
    contractData.participants.map(async p => ({
      ...p,
      name: await fetchUserName(API, p.walletAddress),
    }))
  );

  const isVerified = ['locked', 'completed'].includes(contractData.status);
  const totalAmount = contractData.totalAmount ?? 0;

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
              {isVerified ? 'Verified on Blockchain' : 'Contract In Progress'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isVerified
                ? `Registered on Polygon Amoy · ${contractData.lockedAt ? new Date(contractData.lockedAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Recently'}`
                : `Status: ${contractData.status.charAt(0).toUpperCase() + contractData.status.slice(1)} — not yet locked on-chain`}
            </p>
          </div>
        </div>

        {/* ── Product Identity ──────────────────────────────────────── */}
        <section className="glass p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Product Identity</h2>

          {contractData.imageCid && !isMockCid(contractData.imageCid) && (
            // eslint-disable-next-line @next/next/no-img-element
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
          <p className="text-xs text-slate-500">The verified participants in this product&apos;s journey</p>
          <SupplyChainFlow participants={enrichedParticipants} totalAmount={totalAmount} />
        </section>

        {/* ── Payment Transparency (visible to ALL — key FairChain feature) */}
        <section className="glass p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            💸 Where Your Money Goes
          </h2>
          <p className="text-xs text-slate-500">
            FairChain guarantees full payment transparency. Here&apos;s exactly how the payment is distributed across the supply chain.
          </p>

          {totalAmount > 0 && (
            <div className="flex items-baseline gap-2 py-2">
              <span className="text-3xl font-extrabold text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
              <span className="text-sm text-slate-500">total contract value</span>
            </div>
          )}

          {/* Visual bars */}
          <div className="space-y-3">
            {enrichedParticipants.map((p, i) => {
              const amount = totalAmount ? Math.round(totalAmount * p.paymentSplit / 100) : 0;
              const roleColors: Record<string, string> = {
                Artisan:   'bg-[#00E5A0]',
                Middleman: 'bg-sky-400',
                Seller:    'bg-amber-400',
              };
              const bar = roleColors[p.role] ?? 'bg-slate-400';
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">
                        {p.name ?? `${p.role} (${p.walletAddress.slice(0, 6)}…${p.walletAddress.slice(-4)})`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">{p.paymentSplit}%</span>
                      {amount > 0 && (
                        <span className="text-xs text-[#00E5A0] ml-2">₹{amount.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bar} rounded-full transition-all duration-700`}
                      style={{ width: `${p.paymentSplit}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono">{p.walletAddress}</p>
                </div>
              );
            })}
          </div>

          {!isAuthenticated && (
            <p className="text-[11px] text-slate-600 border-t border-white/[0.05] pt-3 mt-2">
              🔒 Connect your wallet to see additional payment history and escrow status.
            </p>
          )}
        </section>

        {/* ── PaymentChart (visual pie — authenticated only) */}
        {isAuthenticated && totalAmount > 0 && (
          <section className="glass p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Payment Chart</h2>
            <PaymentChart participants={enrichedParticipants} totalAmount={totalAmount} />
          </section>
        )}

        {/* ── Blockchain Proof ──────────────────────────────────────── */}
        {isVerified && (
          <section className="glass p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2"><span>⛓</span> Blockchain Proof</h2>
              {contractData.ipfsCid && !isMockCid(contractData.ipfsCid) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                  Stored on IPFS
                </span>
              )}
              {contractData.ipfsCid && isMockCid(contractData.ipfsCid) && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                  ⚠ Dev / Mock
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <ProofRow label="Contract ID" value={contractData.contractId.slice(0, 16) + '…'} />
              {contractData.txHash && !isMockHash(contractData.txHash) && (
                <ProofRow label="Payment Tx" value="" href={`${POLYGONSCAN}/${contractData.txHash}`} linkText={`${contractData.txHash.slice(0, 10)}… ↗`} />
              )}
              {contractData.ipfsCid && !isMockCid(contractData.ipfsCid) && (
                <ProofRow label="IPFS Metadata" value="" href={`${IPFS_GW}/${contractData.ipfsCid}`} linkText={`${contractData.ipfsCid.slice(0, 10)}… ↗`} />
              )}
              {contractData.proofTxHash && !isMockHash(contractData.proofTxHash) && (
                <ProofRow label="Proof Registry" value="" href={`${POLYGONSCAN}/${contractData.proofTxHash}`} linkText={`${contractData.proofTxHash.slice(0, 10)}… ↗`} />
              )}
              {contractData.lockedAt && (
                <ProofRow label="Registered On" value={new Date(contractData.lockedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
              )}
            </div>
          </section>
        )}

        {/* ── Escrow Status ──────────────────────────────────────────── */}
        {escrowData && isAuthenticated && (
          <section className="glass p-6 space-y-3">
            <h2 className="text-base font-semibold text-white">Escrow Status</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Amount</span>
              <span className="text-white font-semibold">₹{escrowData.totalAmount.toLocaleString('en-IN')}</span>
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
                    <span className="text-white font-medium">₹{m.amount.toLocaleString('en-IN')}</span>
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
