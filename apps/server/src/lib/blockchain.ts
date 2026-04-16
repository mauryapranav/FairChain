/**
 * Blockchain interaction stubs.
 * Production implementation calls the FairChainEscrow Solidity contract via ethers.js.
 * For local dev / CI these return fake tx hashes so the API layer works end-to-end.
 */

function fakeTx(label: string): string {
  const rand = Math.random().toString(16).slice(2, 18);
  console.info(`[blockchain:stub] ${label} → 0x${rand}`);
  return `0x${rand.padEnd(64, '0')}`;
}

export async function registerProofOnChain(
  contractId: string,
  ipfsCid: string,
  _prevTxHash: string,
): Promise<string> {
  return fakeTx(`registerProof(${contractId}, ${ipfsCid})`);
}

export async function releaseMilestoneOnChain(
  contractId: string,
  milestoneIndex: number,
): Promise<string> {
  return fakeTx(`releaseMilestone(${contractId}, ${milestoneIndex})`);
}

export async function releaseAllOnChain(contractId: string): Promise<string> {
  return fakeTx(`releaseAll(${contractId})`);
}

export async function refundOnChain(contractId: string): Promise<string> {
  return fakeTx(`refund(${contractId})`);
}
