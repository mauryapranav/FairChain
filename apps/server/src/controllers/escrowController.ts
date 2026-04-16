import type { Request, Response } from 'express';
import { ethers } from 'ethers';
import EscrowModel from '../models/Escrow';
import DisputeModel from '../models/Dispute';
import ContractModel from '../models/Contract';
import {
  releaseMilestoneOnChain,
  releaseAllOnChain,
  refundOnChain,
} from '../lib/blockchain';

function getIO() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('../index') as { io: import('socket.io').Server }).io;
}

const RELEASE_MSG = (contractId: string, idx: number) =>
  `FairChain: Release milestone ${idx} for contract ${contractId}`;

export const getEscrow = async (req: Request, res: Response): Promise<void> => {
  const escrow = await EscrowModel.findOne({ contractId: req.params['contractId'] ?? '' });
  res.json({ data: escrow ?? null });
};

export const releaseMilestone = async (req: Request, res: Response): Promise<void> => {
  const { contractId, milestoneIndex } = req.params as { contractId: string; milestoneIndex: string };
  const { signature } = req.body as { signature?: string };
  const idx = Number(milestoneIndex);

  const dispute = await DisputeModel.findOne({ contractId, status: { $in: ['open', 'under_review'] } });
  if (dispute) { res.status(403).json({ error: 'Escrow frozen — active dispute' }); return; }

  const escrow = await EscrowModel.findOne({ contractId });
  if (!escrow || escrow.status === 'unfunded') { res.status(404).json({ error: 'Escrow not funded' }); return; }
  if (escrow.status === 'fully_released' || escrow.status === 'refunded') {
    res.status(409).json({ error: 'Escrow already settled' }); return;
  }

  const milestone = escrow.milestones.find(m => m.index === idx);
  if (!milestone) { res.status(404).json({ error: 'Milestone not found' }); return; }
  if (milestone.releasedAt) { res.status(409).json({ error: 'Already released' }); return; }

  if (signature) {
    const recovered = ethers.verifyMessage(RELEASE_MSG(contractId, idx), signature);
    const contract  = await ContractModel.findOne({ contractId });
    if (recovered.toLowerCase() !== contract?.createdBy?.toLowerCase() &&
        !contract?.participants.some(p => p.walletAddress === recovered.toLowerCase())) {
      res.status(403).json({ error: 'Invalid signature' }); return;
    }
  }

  const txHash = await releaseMilestoneOnChain(contractId, idx);
  milestone.releasedAt = new Date();
  milestone.txHash = txHash;
  const allReleased    = escrow.milestones.every(m => m.releasedAt);
  escrow.status        = allReleased ? 'fully_released' : 'milestone_released';
  await EscrowModel.save(escrow);
  if (allReleased) await ContractModel.updateOne({ contractId }, { status: 'completed' });

  try { getIO().to(contractId).emit('escrow_update', { contractId, escrow, txHash }); } catch { /* ok */ }
  res.json({ success: true, txHash, escrow });
};

export const releaseAll = async (req: Request, res: Response): Promise<void> => {
  const { contractId } = req.params as { contractId: string };
  const dispute = await DisputeModel.findOne({ contractId, status: { $in: ['open', 'under_review'] } });
  if (dispute) { res.status(403).json({ error: 'Escrow frozen — active dispute' }); return; }

  const escrow = await EscrowModel.findOne({ contractId });
  if (!escrow || escrow.status === 'unfunded') { res.status(404).json({ error: 'Escrow not funded' }); return; }

  const txHash = await releaseAllOnChain(contractId);
  const now = new Date();
  escrow.milestones.forEach(m => { if (!m.releasedAt) m.releasedAt = now; });
  escrow.status = 'fully_released';
  await EscrowModel.save(escrow);
  await ContractModel.updateOne({ contractId }, { status: 'completed' });

  try { getIO().to(contractId).emit('escrow_update', { contractId, escrow, txHash }); } catch { /* ok */ }
  res.json({ success: true, txHash, escrow });
};

export const processRefund = async (req: Request, res: Response): Promise<void> => {
  const { contractId } = req.params as { contractId: string };
  const escrow = await EscrowModel.findOne({ contractId });
  if (!escrow || escrow.status === 'unfunded') { res.status(404).json({ error: 'Escrow not funded' }); return; }

  const txHash = await refundOnChain(contractId);
  escrow.status = 'refunded';
  await EscrowModel.save(escrow);

  try { getIO().to(contractId).emit('escrow_update', { contractId, escrow, txHash }); } catch { /* ok */ }
  res.json({ success: true, txHash, escrow });
};
