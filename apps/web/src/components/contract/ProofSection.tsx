'use client';

import { useState } from 'react';

interface Props {
  contractId: string;
  txHash?: string;
  ipfsCid?: string;
  proofTxHash?: string;
  lockedAt?: string;
}

const POLYGONSCAN = 'https://amoy.polygonscan.com/tx';
const IPFS_GW     = 'https://ipfs.io/ipfs';

/** Mock hashes use this prefix (set by blockchain.ts in mock mode). */
function isMockHash(s: string): boolean {
  return !s || s.startsWith('0xmock') || s === '0x' + '0'.repeat(64);
}

/** Mock CIDs use this prefix (set by ipfs.ts in mock mode). */
function isMockCid(s: string): boolean {
  return !s || s.startsWith('bafybeimock') || s.startsWith('bafybeifile');
}

function shorten(s: string, n = 10) {
  if (s.length <= n * 2 + 3) return s;
  return `${s.slice(0, n)}…${s.slice(-6)}`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="ml-1 text-slate-600 hover:text-slate-400 transition-colors text-[10px]"
      aria-label="Copy to clipboard"
    >
      {copied ? '✓' : '⧉'}
    </button>
  );
}

function HashLink({ hash, baseUrl, label }: { hash: string; baseUrl: string; label: string }) {
  if (isMockHash(hash)) {
    return (
      <span className="flex items-center gap-1.5">
        <code className="text-xs text-slate-400 font-mono">{shorten(hash)}</code>
        <CopyButton value={hash} />
        <span className="text-[10px] px-1.5 py-px rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
          mock
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <a
        href={`${baseUrl}/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#00E5A0] hover:underline font-mono"
        aria-label={label}
      >
        {shorten(hash)} ↗
      </a>
      <CopyButton value={hash} />
    </span>
  );
}

function CidLink({ cid }: { cid: string }) {
  if (isMockCid(cid)) {
    return (
      <span className="flex items-center gap-1.5">
        <code className="text-xs text-slate-400 font-mono">{shorten(cid)}</code>
        <CopyButton value={cid} />
        <span className="text-[10px] px-1.5 py-px rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
          mock
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <a
        href={`${IPFS_GW}/${cid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#00E5A0] hover:underline font-mono"
        aria-label="View raw IPFS metadata"
      >
        {shorten(cid)} ↗
      </a>
      <CopyButton value={cid} />
    </span>
  );
}

export function ProofSection({ contractId, txHash, ipfsCid, proofTxHash, lockedAt }: Props) {
  const hasProof = !!(txHash || ipfsCid || proofTxHash);
  const isFullyMock = [txHash, ipfsCid, proofTxHash]
    .filter(Boolean)
    .every(v => isMockHash(v!) || isMockCid(v!));

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-lg">⛓</span>
        <h3 className="font-semibold text-white">Blockchain Proof</h3>

        {hasProof && (
          <span className={`ml-auto text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
            isFullyMock
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-[#00E5A0]/10 border-[#00E5A0]/20 text-[#00E5A0]'
          }`}>
            {isFullyMock ? '⚠ Dev / Mock Mode' : '✓ On-chain Verified'}
          </span>
        )}

        {ipfsCid && !isMockCid(ipfsCid) && (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20 font-medium">
            Stored on IPFS
          </span>
        )}
      </div>

      {!hasProof ? (
        <p className="text-sm text-slate-500">
          Not yet registered on-chain. Lock the contract to generate proof.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Contract ID */}
          <Row label="Contract ID">
            <span className="flex items-center gap-1">
              <code className="text-xs text-slate-300 font-mono">{shorten(contractId, 12)}</code>
              <CopyButton value={contractId} />
            </span>
          </Row>

          {/* Payment tx */}
          {txHash && (
            <Row label="Payment Tx">
              <HashLink hash={txHash} baseUrl={POLYGONSCAN} label="View payment transaction on Polygonscan" />
            </Row>
          )}

          {/* IPFS CID */}
          {ipfsCid && (
            <Row label="IPFS Metadata">
              <CidLink cid={ipfsCid} />
            </Row>
          )}

          {/* Proof registry tx */}
          {proofTxHash && (
            <Row label="Proof Registry Tx">
              <HashLink hash={proofTxHash} baseUrl={POLYGONSCAN} label="View proof registration transaction" />
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

          {/* View raw — only show for real CIDs */}
          {ipfsCid && !isMockCid(ipfsCid) && (
            <a
              href={`${IPFS_GW}/${ipfsCid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
            >
              📄 View raw metadata on IPFS
            </a>
          )}

          {/* Mock mode explanation */}
          {isFullyMock && (
            <p className="text-[11px] text-amber-500/70 border-t border-white/[0.04] pt-3 mt-2">
              ⚠ Running in dev/mock mode. Set{' '}
              <code className="font-mono">POLYGON_RPC_URL</code>,{' '}
              <code className="font-mono">DEPLOY_WALLET_PRIVATE_KEY</code>, and{' '}
              <code className="font-mono">ESCROW_CONTRACT_ADDRESS</code> for real on-chain transactions.
            </p>
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
