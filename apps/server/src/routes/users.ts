import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import UserModel from '../models/User';

export const usersRouter = Router();

// GET /api/users
usersRouter.get('/', async (req, res) => {
  const { role, limit } = req.query as { role?: string; limit?: string };
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  
  const allUsers = await UserModel.find(filter);
  const data = allUsers
    .sort((a, b) => (b.reputationScore ?? 0) - (a.reputationScore ?? 0))
    .slice(0, Number(limit) || 50)
    .map(user => {
      const { walletAddress, name, role, kycStatus, createdAt, reputationScore, speciality, location, bio } = user;
      return { 
        id: user._id,
        walletAddress, 
        name, 
        role, 
        kycStatus, 
        createdAt, 
        reputationScore: reputationScore ?? 0, 
        speciality, 
        location, 
        bio 
      };
    });
  
  res.json({ data });
});

// GET /api/users/me
usersRouter.get('/me', requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user!.sub);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ data: user });
});

// GET /api/users/:walletAddress
usersRouter.get('/:walletAddress', async (req, res) => {
  const user = await UserModel.findOne({ walletAddress: req.params['walletAddress']?.toLowerCase() });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  // Strip sensitive fields for public profile
  const { walletAddress, name, role, kycStatus, createdAt } = user;
  res.json({ data: { walletAddress, name, role, kycStatus, createdAt } });
});
