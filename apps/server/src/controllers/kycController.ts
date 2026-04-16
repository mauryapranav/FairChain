import type { Request, Response } from 'express';
import UserModel from '../models/User';

/**
 * Mock KYC service. In production, swap the `simulateVerification` function
 * for a real DigiLocker / HyperVerge / Setu API call.
 */

// ── GET /api/kyc/status ─────────────────────────────────────────────────────

export const getKycStatus = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const user = await UserModel.findById(userId).select('kycStatus name role').lean();
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  res.json({ kycStatus: user.kycStatus, name: user.name, role: user.role });
};

// ── POST /api/kyc/initiate ───────────────────────────────────────────────────

export const initiateKyc = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.sub;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const user = await UserModel.findById(userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  if (user.kycStatus === 'verified') {
    res.status(409).json({ error: 'Already verified' }); return;
  }

  // Mark as pending
  user.kycStatus = 'pending';
  await user.save();

  // Simulate async verification (3 s delay → auto-verified in dev)
  if (process.env['NODE_ENV'] !== 'production') {
    setTimeout(async () => {
      try {
        await UserModel.findByIdAndUpdate(userId, {
          kycStatus: 'verified',
        });
        console.info(`[kyc:mock] User ${userId} auto-verified`);
      } catch (e) {
        console.error('[kyc:mock] auto-verify failed', e);
      }
    }, 3000);
  }

  res.json({
    status:  'pending',
    message: process.env['NODE_ENV'] !== 'production'
      ? 'Mock KYC: auto-verifying in 3 seconds'
      : 'KYC session initiated. Complete verification in the redirect.',
    redirectUrl: process.env['KYC_REDIRECT_URL'] ?? null,
  });
};

// ── POST /api/kyc/callback ───────────────────────────────────────────────────
// Called by the KYC provider after verification (or by our mock)

export const kycCallback = async (req: Request, res: Response): Promise<void> => {
  // In production, validate the KYC provider's webhook signature here
  const { userId, status } = req.body as { userId: string; status: 'verified' | 'failed' };

  if (!userId || !status) {
    res.status(400).json({ error: 'userId and status are required' });
    return;
  }

  await UserModel.findByIdAndUpdate(userId, { kycStatus: status });
  res.json({ success: true, status });
};
