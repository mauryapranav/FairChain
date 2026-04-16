import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

export const paymentsRouter = Router();

// POST /api/payments/order — Razorpay order stub
paymentsRouter.post('/order', requireAuth, async (req, res) => {
  const { amount, currency = 'INR' } = req.body as { amount?: number; currency?: string };
  if (!amount) { res.status(400).json({ error: 'amount required' }); return; }
  // Stub — replace with Razorpay SDK call in production
  res.json({
    orderId: `rzp_mock_${Date.now()}`,
    amount,
    currency,
    keyId: process.env['RAZORPAY_KEY_ID'] ?? 'rzp_test_mock',
  });
});

// POST /api/payments/verify — verify Razorpay signature stub
paymentsRouter.post('/verify', requireAuth, (req, res) => {
  // In production: verify HMAC-SHA256 of order_id|payment_id using key_secret
  res.json({ verified: true });
});
