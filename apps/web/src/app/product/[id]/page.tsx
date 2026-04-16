import type { Metadata } from 'next';
import Link from 'next/link';

/* ── Types ──────────────────────────────────────────────────────────── */

interface Participant {
  role: string;
  walletAddress: string;
}

interface ContractData {
  contractId: string;
  productName: string;
  description: string;
  category: string;
  participants: Participant[];
  status: string;
  imageCid?: string;
  ipfsCid?: string;
  proofTxHash?: string;
  txHash?: string;
  createdAt: string;
  lockedAt?: string;
}

/* ── Metadata ───────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const API = process.env['API_URL'] ?? 'http://localhost:4000';
  try {
    const res = await fetch(`${API}/api/contracts/${params.id}`, { cache: 'no-store' });
    const json = await res.json() as { data: ContractData };
    return {
      title: `${json.data?.productName ?? 'Product'} — Track on FairChain`,
      description: `Verify the authenticity of ${json.data?.productName ?? 'this product'} on FairChain's blockchain-anchored supply chain.`,
    };
  } catch {
    return { title: 'Product Tracker — FairChain' };
  }
}

/* ── Role badge colours ──────────────────────────────────────────────── */

const ROLE_COLORS: Record<string, string> = {
  Artisan:   'bg-purple-500/15 border-purple-500/30 text-purple-300',
  Middleman: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  Seller:    'bg-amber-500/15 border-amber-500/30 text-amber-300',
};

const ROLE_ICONS: Record<string, string> = {
  Artisan:   '🪡',
  Middleman: '🔗',
  Seller:    '🛒',
};

const IPFS_GW    = 'https://ipfs.io/ipfs';
const POLYGONSCAN = 'https://amoy.polygonscan.com/tx';

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function ProductPage({ params }: { params: { id: string } }) {
  const API = process.env['API_URL'] ?? 'http://localhost:4000';

  let product: ContractData | null = null;
  try {
    const res = await fetch(`${API}/api/contracts/${params.id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json() as { data: ContractData };
      product = json.data;
    }
  } catch { /* network error */ }

  /* ── Not found ──────────────────────────────────────────────────────── */
  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl">⚠</div>
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-slate-400 text-sm mb-6">
            This product could not be verified. The ID may be invalid or not yet registered on FairChain.
          </p>
          <p className="text-xs text-slate-600 font-mono bg-white/[0.03] rounded px-3 py-2 border border-white/[0.06]">
            ID: {params.id}
          </p>
        </div>
      </main>
    );
  }

  const isVerified = ['locked', 'completed'].includes(product.status);

  return (
    <main className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Authenticity Badge ──────────────────────────────────────── */}
        <div className={`rounded-2xl p-6 border-2 flex items-center gap-4 ${
          isVerified
            ? 'border-[#00E5A0]/40 bg-[#00E5A0]/8'
            : 'border-amber-500/40 bg-amber-500/8'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0 ${
            isVerified ? 'bg-[#00E5A0]/20' : 'bg-amber-500/20'
          }`}>
            {isVerified ? '✓' : '⏳'}
          </div>
          <div>
            <h1 className={`text-xl font-extrabold ${isVerified ? 'text-[#00E5A0]' : 'text-amber-300'}`}>
              {isVerified ? 'Authenticity Verified' : 'Pending Verification'}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isVerified
                ? `Registered on Polygon Amoy · ${product.lockedAt
                  ? new Date(product.lockedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })
                  : 'Recently'}`
                : 'This product is awaiting blockchain registration'}
            </p>
          </div>
        </div>

        {/* ── Product Info ────────────────────────────────────────────── */}
        <section className="glass p-6 space-y-4" aria-labelledby="product-info-heading">
          <h2 id="product-info-heading" className="text-base font-semibold text-white">Product Information</h2>

          {product.imageCid && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`${IPFS_GW}/${product.imageCid}`}
              alt={product.productName}
              className="w-full h-48 object-cover rounded-xl border border-white/[0.07]"
              loading="lazy"
            />
          )}

          <div className="space-y-3">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Product Name</p>
              <p className="text-white font-semibold text-lg">{product.productName}</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Category</p>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300">
                  {product.category}
                </span>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Created</p>
                <p className="text-sm text-slate-300">
                  {new Date(product.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </p>
              </div>
            </div>
            {product.description && (
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Description</p>
                <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Supply Chain ────────────────────────────────────────────── */}
        <section className="glass p-6 space-y-4" aria-labelledby="supply-chain-heading">
          <h2 id="supply-chain-heading" className="text-base font-semibold text-white">Supply Chain Journey</h2>
          <p className="text-xs text-slate-500">
            The participants listed below were involved in creating and delivering this product.
            Wallet addresses are partially hidden for privacy.
          </p>
          <ol className="relative pl-4 space-y-6">
            {product.participants.map((p, i) => (
              <li key={i} className="relative flex gap-4 items-start">
                {i < product!.participants.length - 1 && (
                  <div className="absolute left-[1.1rem] top-8 w-px h-full bg-white/[0.08]" aria-hidden="true" />
                )}
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-base shrink-0 ${ROLE_COLORS[p.role] ?? 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                  {ROLE_ICONS[p.role] ?? '👤'}
                </div>
                <div className="pt-1">
                  <p className="text-white font-medium text-sm">{p.role}</p>
                  <p className="text-slate-500 text-xs font-mono mt-0.5">
                    {p.walletAddress.slice(0, 6)}…{p.walletAddress.slice(-4)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Blockchain Proof ────────────────────────────────────────── */}
        {isVerified && (
          <section className="glass p-6 space-y-3" aria-labelledby="proof-heading">
            <h2 id="proof-heading" className="text-base font-semibold text-white flex items-center gap-2">
              <span aria-hidden="true">⛓</span> Blockchain Proof
            </h2>
            <div className="space-y-2 text-sm">
              <ProofRow label="Contract ID" value={product.contractId.slice(0, 16) + '…'} />
              {product.txHash && (
                <ProofRow
                  label="Payment Tx"
                  href={`${POLYGONSCAN}/${product.txHash}`}
                  linkText={`${product.txHash.slice(0, 10)}… ↗`}
                />
              )}
              {product.ipfsCid && (
                <ProofRow
                  label="IPFS Metadata"
                  href={`${IPFS_GW}/${product.ipfsCid}`}
                  linkText={`${product.ipfsCid.slice(0, 10)}… ↗`}
                />
              )}
              {product.proofTxHash && (
                <ProofRow
                  label="Proof Registry"
                  href={`${POLYGONSCAN}/${product.proofTxHash}`}
                  linkText={`${product.proofTxHash.slice(0, 10)}… ↗`}
                />
              )}
            </div>
          </section>
        )}

        {/* ── Notice for public users ──────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <span className="text-lg shrink-0" aria-hidden="true">ℹ️</span>
          <div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This is a <strong className="text-white">public product verification page</strong>. Payment splits
              and exact contract amounts are only visible to verified participants.{' '}
              <Link href="/scan" className="text-[#00E5A0] hover:underline">Scan another product →</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 pb-4">
          Powered by FairChain · Polygon Amoy · IPFS
        </p>
      </div>
    </main>
  );
}

function ProofRow({ label, value, href, linkText }: { label: string; value?: string; href?: string; linkText?: string }) {
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
