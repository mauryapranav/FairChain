'use client';

interface Props {
  contractId: string;
  txHash?: string;
  ipfsCid?: string;
  proofTxHash?: string;
  lockedAt?: string;
}

const POLYGONSCAN = 'https://amoy.polygonscan.com/tx';
const IPFS_GW     = 'https://ipfs.io/ipfs';

function shorten(s: string, n = 10) {
  if (s.length <= n * 2 + 3) return s;
  return `${s.slice(0, n)}…${s.slice(-6)}`;
}

export function ProofSection({ contractId, txHash, ipfsCid, proofTxHash, lockedAt }: Props) {
  const hasProof = !!(txHash || ipfsCid || proofTxHash);

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">⛓</span>
        <h3 className="font-semibold text-white">Blockchain Proof</h3>
        {ipfsCid && (
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20 font-medium">
            Stored on Filecoin
          </span>
        )}
      </div>

      {!hasProof ? (
        <p className="text-sm text-slate-500">Not yet registered on-chain. Lock the contract to generate proof.</p>
      ) : (
        <div className="space-y-3">
          {/* Contract ID */}
          <Row label="Contract ID">
            <code className="text-xs text-slate-300 font-mono">{shorten(contractId, 12)}</code>
          </Row>

          {/* Payment tx */}
          {txHash && (
            <Row label="Payment Tx">
              <a
                href={`${POLYGONSCAN}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00E5A0] hover:underline font-mono"
                aria-label="View payment transaction on Polygonscan"
              >
                {shorten(txHash)} ↗
              </a>
            </Row>
          )}

          {/* IPFS CID */}
          {ipfsCid && (
            <Row label="IPFS Metadata">
              <a
                href={`${IPFS_GW}/${ipfsCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00E5A0] hover:underline font-mono"
                aria-label="View raw IPFS metadata"
              >
                {shorten(ipfsCid)} ↗
              </a>
            </Row>
          )}

          {/* Proof registry tx */}
          {proofTxHash && (
            <Row label="Proof Registry Tx">
              <a
                href={`${POLYGONSCAN}/${proofTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00E5A0] hover:underline font-mono"
                aria-label="View proof registration transaction"
              >
                {shorten(proofTxHash)} ↗
              </a>
            </Row>
          )}

          {/* Locked at */}
          {lockedAt && (
            <Row label="Proof Registered">
              <span className="text-xs text-slate-400">
                {new Date(lockedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </Row>
          )}

          {/* View raw */}
          {ipfsCid && (
            <a
              href={`${IPFS_GW}/${ipfsCid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
            >
              📄 View raw metadata (IPFS)
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-slate-500 shrink-0 w-32">{label}</span>
      <div className="text-right min-w-0 break-all">{children}</div>
    </div>
  );
}
