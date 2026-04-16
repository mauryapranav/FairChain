import type { Request, Response } from 'express';
import UserModel from '../models/User';

export const getKycStatus = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const user = await UserModel.findById(userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ kycStatus: user.kycStatus, name: user.name, role: user.role });
};

export const initiateKyc = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const user = await UserModel.findById(userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  if (user.kycStatus === 'verified') { res.status(409).json({ error: 'Already verified' }); return; }

  user.kycStatus = 'pending';
  await UserModel.findByIdAndUpdate(userId, { kycStatus: 'pending' });

  // Dev: auto-verify after 3 s
  if (process.env['NODE_ENV'] !== 'production') {
    setTimeout(() => {
      UserModel.findByIdAndUpdate(userId, { kycStatus: 'verified' })
        .then(() => console.info(`[kyc:mock] User ${userId} auto-verified`))
        .catch(console.error);
    }, 3000);
  }

  res.json({
    status:  'pending',
    message: process.env['NODE_ENV'] !== 'production'
      ? 'Mock KYC: auto-verifying in 3 seconds'
      : 'KYC session initiated.',
    redirectUrl: process.env['KYC_REDIRECT_URL'] ?? null,
  });
};

export const kycCallback = async (req: Request, res: Response): Promise<void> => {
  const { userId, status } = req.body as { userId?: string; status?: 'verified' | 'failed' };
  if (!userId || !status) { res.status(400).json({ error: 'userId and status required' }); return; }
  await UserModel.findByIdAndUpdate(userId, { kycStatus: status });
  res.json({ success: true, status });
};
