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

  const contracts = await ContractModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 50));

  const total = await ContractModel.countDocuments(filter);
  res.json({ data: contracts.map(c => c.toJSON()), total });
};

// ── GET /api/contracts/:id ───────────────────────────────────────────────────

export const getContract = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  // Try contractId (UUID) first, then MongoDB _id
  const contract = await ContractModel.findOne({ contractId: id })
    ?? await ContractModel.findById(id).catch(() => null);

  if (!contract) { res.status(404).json({ error: 'Contract not found' }); return; }

  // Attach live escrow + dispute status
  const [escrow, dispute] = await Promise.all([
    EscrowModel.findOne({ contractId: contract.contractId }),
    DisputeModel.findOne({ contractId: contract.contractId }),
  ]);

  res.json({
    data:    contract.toJSON(),
    escrow:  escrow  ? escrow.toJSON()  : null,
    dispute: dispute ? dispute.toJSON() : null,
  });
};

// ── POST /api/contracts ──────────────────────────────────────────────────────

export const createContract = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const {
    productName, description, category, terms,
    participants, milestonesEnabled, milestones,
    totalAmount, imageCid,
  } = req.body as {
    productName: string; description: string; category: string; terms: string;
    participants: Array<{userId: string; walletAddress: string; role: string; paymentSplit: number}>;
    milestonesEnabled?: boolean;
    milestones?: Array<{index: number; description: string; amount: number}>;
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

  res.status(201).json({ data: contract.toJSON() });
};

// ── PATCH /api/contracts/:id/lock ────────────────────────────────────────────

export const lockContract = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const contract = await ContractModel.findOne({ contractId: req.params['id'] })
    ?? await ContractModel.findById(req.params['id']).catch(() => null);

  if (!contract) { res.status(404).json({ error: 'Contract not found' }); return; }
  if (contract.createdBy !== userId) { res.status(403).json({ error: 'Only the creator can lock' }); return; }
  if (contract.status === 'locked') { res.status(409).json({ error: 'Already locked' }); return; }

  // Build metadata for IPFS
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

  // Upload to IPFS
  const cid = await uploadJSON(metadata, `fairchain-contract-${contract.contractId}`);

  // Register proof on-chain
  const proofTxHash = await registerProofOnChain(
    contract.contractId,
    cid,
    contract.txHash ?? '0x0000000000000000000000000000000000000000000000000000000000000000'
  );

  contract.status      = 'locked';
  contract.ipfsCid     = cid;
  contract.proofTxHash = proofTxHash;
  contract.lockedAt    = new Date();
  await contract.save();

  try { getIO().to(contract.contractId).emit('contract_locked', { contractId: contract.contractId, ipfsCid: cid, proofTxHash }); } catch {}

  res.json({
    data: contract.toJSON(),
    ipfsCid:      cid,
    ipfsUrl:      gatewayUrl(cid),
    proofTxHash,
  });
};
