import { Router } from 'express';
import { db } from '../lib/store';

export const statsRouter = Router();

// GET /api/stats — public aggregate stats for the landing page
statsRouter.get('/', (_req, res) => {
  let totalDistributed = 0;
  for (const escrow of db.escrows.values()) {
    if (escrow.status === 'fully_released' || escrow.status === 'completed') {
      totalDistributed += escrow.totalAmount;
    }
  }

  let contractsLocked = 0;
  for (const contract of db.contracts.values()) {
    if (contract.status === 'locked' || contract.status === 'completed') {
      contractsLocked++;
    }
  }

  res.json({
    artisans: db.users.size,
    contractsLocked,
    totalDistributed,
  });
});
