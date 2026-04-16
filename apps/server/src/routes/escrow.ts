import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getEscrow,
  releaseMilestone,
  releaseAll,
  processRefund,
} from '../controllers/escrowController';

export const escrowRouter = Router();

escrowRouter.get('/:contractId',                            requireAuth, getEscrow);
escrowRouter.post('/:contractId/release/:milestoneIndex',   requireAuth, releaseMilestone);
escrowRouter.post('/:contractId/release-all',               requireAuth, releaseAll);
escrowRouter.post('/:contractId/refund',                    requireAuth, processRefund);
