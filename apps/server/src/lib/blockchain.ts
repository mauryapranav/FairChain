/**
 * Blockchain interaction layer — FairChainEscrow contract via ethers v6.
 *
 * When POLYGON_RPC_URL + DEPLOY_WALLET_PRIVATE_KEY + ESCROW_CONTRACT_ADDRESS
 * are all set, real on-chain transactions are submitted to Polygon Amoy.
 *
 * When any of those env vars are missing (local dev / CI), mock mode is used:
 * fake transaction hashes are returned and a warning is logged.
 *
 * Deploy the contract first:
 *   cd packages/contracts && pnpm deploy
 * Then set ESCROW_CONTRACT_ADDRESS in your .env.
 */

import { ethers } from 'ethers';
import type { ContractTransactionResponse } from 'ethers';

// ── ABI (minimal — only the functions we call) ────────────────────────────────
const ESCROW_ABI = [
  'function registerContract(string contractId, string ipfsCid) external',
  'function releaseMilestone(string contractId, uint256 milestoneIndex) external',
  'function releaseAll(string contractId) external',
  'function refund(string contractId) external',
  'event ContractRegistered(string indexed contractId, address indexed creator, string ipfsCid, uint256 timestamp)',
  'event MilestoneReleased(string indexed contractId, uint256 indexed milestoneIndex, uint256 timestamp)',
  'event EscrowSettled(string indexed contractId, uint256 timestamp)',
  'event EscrowRefunded(string indexed contractId, uint256 timestamp)',
];

// ── Environment ───────────────────────────────────────────────────────────────
const RPC_URL         = process.env['POLYGON_RPC_URL'];
const PRIVATE_KEY     = process.env['DEPLOY_WALLET_PRIVATE_KEY'];
const CONTRACT_ADDR   = process.env['ESCROW_CONTRACT_ADDRESS'];
const EXPLORER_BASE   = process.env['BLOCK_EXPLORER_URL'] ?? 'https://amoy.polygonscan.com/tx';

const isMock = !RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDR;

if (isMock) {
  console.warn(
    '[blockchain] Running in MOCK mode — no real on-chain transactions.\n' +
    '  To enable real blockchain: set POLYGON_RPC_URL, DEPLOY_WALLET_PRIVATE_KEY, ESCROW_CONTRACT_ADDRESS\n' +
    '  Then deploy the contract: cd packages/contracts && pnpm deploy'
  );
} else {
  console.info(`[blockchain] Connected to Polygon Amoy — contract: ${CONTRACT_ADDR}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Prefix applied to all mock tx hashes so the UI can detect them. */
const MOCK_TX_PREFIX = '0xmock';

function fakeTx(label: string): string {
  const rand = Math.random().toString(16).slice(2, 18);
  const hash = `${MOCK_TX_PREFIX}${rand.padEnd(60, '0')}`;
  console.info(`[blockchain:mock] ${label} → ${hash}`);
  return hash;
}

function getContract(): ethers.Contract {
  const provider = new ethers.JsonRpcProvider(RPC_URL!);
  const wallet   = new ethers.Wallet(PRIVATE_KEY!, provider);
  return new ethers.Contract(CONTRACT_ADDR!, ESCROW_ABI, wallet);
}

async function sendTx(label: string, contractFn: () => Promise<ContractTransactionResponse>): Promise<string> {
  try {
    const tx      = await contractFn();
    console.info(`[blockchain] ${label} → tx submitted: ${tx.hash}`);
    const receipt = await tx.wait(1); // wait for 1 confirmation
    console.info(`[blockchain] ${label} → confirmed in block ${receipt?.blockNumber ?? '?'}`);
    return tx.hash;
  } catch (err) {
    console.error(`[blockchain] ${label} FAILED:`, err);
    throw err;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Register a new contract proof on-chain.
 * Called when a contract is locked (status: accepted → locked).
 */
export async function registerProofOnChain(
  contractId: string,
  ipfsCid: string,
  _prevTxHash: string,
): Promise<string> {
  if (isMock) return fakeTx(`registerContract(${contractId}, ${ipfsCid})`);
  const c = getContract();
  return sendTx(`registerContract(${contractId})`, () =>
    c['registerContract'](contractId, ipfsCid) as Promise<ContractTransactionResponse>
  );
}

/**
 * Release a specific milestone on-chain.
 */
export async function releaseMilestoneOnChain(
  contractId: string,
  milestoneIndex: number,
): Promise<string> {
  if (isMock) return fakeTx(`releaseMilestone(${contractId}, ${milestoneIndex})`);
  const c = getContract();
  return sendTx(`releaseMilestone(${contractId}, ${milestoneIndex})`, () =>
    c['releaseMilestone'](contractId, milestoneIndex) as Promise<ContractTransactionResponse>
  );
}

/**
 * Release all milestones and settle the escrow on-chain.
 */
export async function releaseAllOnChain(contractId: string): Promise<string> {
  if (isMock) return fakeTx(`releaseAll(${contractId})`);
  const c = getContract();
  return sendTx(`releaseAll(${contractId})`, () =>
    c['releaseAll'](contractId) as Promise<ContractTransactionResponse>
  );
}

/**
 * Process a refund on-chain.
 */
export async function refundOnChain(contractId: string): Promise<string> {
  if (isMock) return fakeTx(`refund(${contractId})`);
  const c = getContract();
  return sendTx(`refund(${contractId})`, () =>
    c['refund'](contractId) as Promise<ContractTransactionResponse>
  );
}

/**
 * Build a block explorer URL for a transaction hash.
 * Returns null for mock hashes (they have no on-chain record).
 */
export function getExplorerUrl(txHash: string): string | null {
  if (isMockTxHash(txHash)) return null;
  return `${EXPLORER_BASE}/${txHash}`;
}

/**
 * Returns true if the given tx hash is a mock (dev-only) hash.
 * Use this in the frontend or API responses to label mock proofs honestly.
 */
export function isMockTxHash(txHash: string): boolean {
  return txHash.startsWith(MOCK_TX_PREFIX) || txHash === '0x' + '0'.repeat(64);
}
