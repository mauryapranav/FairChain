import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import ContractModel from '../models/Contract';

export const participantsRouter = Router();

// GET /api/participants?contractId=xxx
participantsRouter.get('/', requireAuth, async (req, res) => {
  const { contractId } = req.query as { contractId?: string };
  if (!contractId) { res.status(400).json({ error: 'contractId required' }); return; }
  const contract = await ContractModel.findOne({ contractId });
  if (!contract) { res.status(404).json({ error: 'Contract not found' }); return; }
  res.json({ data: contract.participants });
});
