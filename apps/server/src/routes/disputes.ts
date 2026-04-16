import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import DisputeModel from '../models/Dispute';

export const disputesRouter = Router();

// POST /api/disputes
disputesRouter.post('/', requireAuth, async (req, res) => {
  const { contractId, reason } = req.body as { contractId?: string; reason?: string };
  if (!contractId || !reason) { res.status(400).json({ error: 'contractId and reason required' }); return; }
  const dispute = await DisputeModel.create({
    contractId,
    raisedBy: req.user!.sub,
    reason,
    status: 'open',
  });
  res.status(201).json({ data: dispute });
});

// GET /api/disputes/:contractId
disputesRouter.get('/:contractId', requireAuth, async (req, res) => {
  const dispute = await DisputeModel.findOne({ contractId: req.params['contractId'] });
  res.json({ data: dispute ?? null });
});

// PATCH /api/disputes/:id/resolve
disputesRouter.patch('/:id/resolve', requireAuth, async (req, res) => {
  const { resolution } = req.body as { resolution?: string };
  const dispute = await DisputeModel.findOne({ _id: req.params['id'] });
  if (!dispute) { res.status(404).json({ error: 'Dispute not found' }); return; }
  dispute.status = 'resolved';
  dispute.resolution = resolution ?? '';
  await DisputeModel.save(dispute);
  res.json({ data: dispute });
});
