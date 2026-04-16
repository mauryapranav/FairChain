import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import UserModel from '../models/User';

export const reputationRouter = Router();

// GET /api/reputation/:walletAddress
reputationRouter.get('/:walletAddress', async (req, res) => {
  const user = await UserModel.findOne({
    walletAddress: req.params['walletAddress']?.toLowerCase(),
  });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  // Stub score — real scoring will be derived from contract history
  res.json({ walletAddress: user.walletAddress, score: 100, level: 'New', badges: [] });
});

// POST /api/reputation/rate — rate a participant in a completed contract
reputationRouter.post('/rate', requireAuth, async (_req, res) => {
  res.json({ ok: true, message: 'Rating recorded (stub)' });
});
