import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import ContractModel from '../models/Contract';
import EscrowModel from '../models/Escrow';
import DisputeModel from '../models/Dispute';
import { uploadJSON, gatewayUrl } from '../lib/ipfs';
import { registerProofOnChain } from '../lib/blockchain';

function getIO() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('../index') as { io: import('socket.io').Server }).io;
}

// ── GET /api/contracts ────────────────────────────────────────────────────────

export const listContracts = async (req: Request, res: Response): Promise<void> => {
  const { status, createdBy, limit = '20', skip = '0' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status)    filter['status']    = status;
  if (createdBy) filter['createdBy'] = createdBy;

  const all = await ContractModel.find(filter);
  const total = all.length;
  const data = all
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(Number(skip), Number(skip) + Math.min(Number(limit), 50));

  res.json({ data, total });
};

// ── GET /api/contracts/:id ────────────────────────────────────────────────────

export const getContract = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const contract = await ContractModel.findOne({ contractId: id })
    ?? await ContractModel.findById(id ?? '');

  if (!contract) { res.status(404).json({ error: 'Contract not found' }); return; }

  const [escrow, dispute] = await Promise.all([
    EscrowModel.findOne({ contractId: contract.contractId }),
    DisputeModel.findOne({ contractId: contract.contractId }),
  ]);

  res.json({ data: contract, escrow: escrow ?? null, dispute: dispute ?? null });
};

// ── POST /api/contracts ───────────────────────────────────────────────────────

export const createContract = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const {
    productName, description, category, terms,
    participants, milestonesEnabled, milestones,
    totalAmount, imageCid,
  } = req.body as {
    productName: string; description: string; category: string; terms: string;
    participants: Array<{ userId: string; walletAddress: string; role: string; paymentSplit: number }>;
    milestonesEnabled?: boolean;
    milestones?: Array<{ index: number; description: string; amount: number }>;
    totalAmount?: number;
    imageCid?: string;
  };

  if (!productName || !description || !category || !terms) {
    res.status(400).json({ error: 'productName, description, category, and terms are required' }); return;
  }
  if (!participants?.length) {
    res.status(400).json({ error: 'At least one participant is required' }); return;
  }
  const splitTotal = participants.reduce((s, p) => s + p.paymentSplit, 0);
  if (Math.abs(splitTotal - 100) > 0.01) {
    res.status(400).json({ error: `Payment splits must total 100% (got ${splitTotal}%)` }); return;
  }

  const contract = await ContractModel.create({
    contractId:        uuidv4(),
    productName,
    description,
    category,
    participants,
    terms,
    milestonesEnabled: milestonesEnabled ?? false,
    milestones:        milestones ?? [],
    totalAmount,
    imageCid,
    status:            'pending',
    createdBy:         userId,
  });

  if (totalAmount && totalAmount > 0) {
    await EscrowModel.create({
      contractId: contract.contractId,
      status: 'unfunded',
      totalAmount,
      milestones: milestonesEnabled && milestones?.length ? milestones : [{ index: 0, description: 'Final Payment', amount: totalAmount }],
    });
  }

  res.status(201).json({ data: contract });
};

// ── PATCH /api/contracts/:id/lock ─────────────────────────────────────────────

export const lockContract = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const contract = await ContractModel.findOne({ contractId: req.params['id'] ?? '' })
    ?? await ContractModel.findById(req.params['id'] ?? '');

  if (!contract) { res.status(404).json({ error: 'Contract not found' }); return; }
  if (contract.createdBy !== userId) { res.status(403).json({ error: 'Only the creator can lock' }); return; }
  if (contract.status === 'locked') { res.status(409).json({ error: 'Already locked' }); return; }
  if (contract.status !== 'accepted') { res.status(403).json({ error: 'Contract must be formally accepted by the participants before locking' }); return; }

  const metadata = {
    contractId:   contract.contractId,
    productName:  contract.productName,
    category:     contract.category,
    description:  contract.description,
    participants: contract.participants.map(p => ({
      walletAddress: p.walletAddress,
      role:          p.role,
      split:         p.paymentSplit,
    })),
    terms:     contract.terms,
    lockedAt:  new Date().toISOString(),
    createdBy: contract.createdBy,
    imageCid:  contract.imageCid ?? null,
  };

  const cid = await uploadJSON(metadata, `fairchain-contract-${contract.contractId}`);
  const proofTxHash = await registerProofOnChain(
    contract.contractId,
    cid,
    contract.txHash ?? '0x0000000000000000000000000000000000000000000000000000000000000000'
  );

  await ContractModel.updateOne(
    { contractId: contract.contractId },
    { status: 'locked', ipfsCid: cid, proofTxHash, lockedAt: new Date() }
  );

  try { getIO().to(contract.contractId).emit('contract_locked', { contractId: contract.contractId, ipfsCid: cid, proofTxHash }); } catch { /* ok */ }

  res.json({ success: true, cid, proofTxHash });
};

// ── PATCH /api/contracts/:id/accept ─────────────────────────────────────────────

export const acceptContract = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const contract = await ContractModel.findOne({ contractId: req.params['id'] ?? '' });
  if (!contract) { res.status(404).json({ error: 'Contract not found' }); return; }
  if (contract.status !== 'pending') { res.status(409).json({ error: 'Contract is not pending' }); return; }

  const isParticipant = contract.participants.some(p => p.userId === userId);
  if (!isParticipant) { res.status(403).json({ error: 'Not a formal participant' }); return; }
  if (contract.createdBy === userId) { res.status(403).json({ error: 'Creator cannot accept their own contract' }); return; }

  const acceptedAt = new Date();
  await ContractModel.updateOne({ contractId: contract.contractId }, { status: 'accepted', acceptedAt });

  // Notify all room members (creator sees "Lock" button appear without refresh)
  try {
    getIO().to(contract.contractId).emit('contract_accepted', {
      contractId: contract.contractId,
      acceptedBy: userId,
      acceptedAt: acceptedAt.toISOString(),
      status: 'accepted',
    });
  } catch { /* socket not critical */ }

  res.json({ success: true, status: 'accepted', acceptedAt });
};

// ── PATCH /api/contracts/:id/reject ─────────────────────────────────────────────

export const rejectContract = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const contract = await ContractModel.findOne({ contractId: req.params['id'] ?? '' });
  if (!contract) { res.status(404).json({ error: 'Contract not found' }); return; }
  if (contract.status !== 'pending' && contract.status !== 'accepted') { res.status(409).json({ error: 'Cannot reject resolved contract' }); return; }

  const isParticipant = contract.participants.some(p => p.userId === userId);
  if (!isParticipant && contract.createdBy !== userId) { res.status(403).json({ error: 'Not authorized' }); return; }

  await ContractModel.updateOne({ contractId: contract.contractId }, { status: 'rejected' });
  res.json({ success: true, status: 'rejected' });
};
