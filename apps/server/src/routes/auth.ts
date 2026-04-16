import { Router } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/store';
import UserModel from '../models/User';

export const authRouter = Router();

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev-secret-changeme';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// GET /api/auth/nonce  — returns a sign message for the wallet
authRouter.get('/nonce', (req, res) => {
  const { address } = req.query as { address?: string };
  if (!address) { res.status(400).json({ error: 'address required' }); return; }
  const nonce = uuidv4();
  const message = `Sign in to FairChain\nNonce: ${nonce}\nAddress: ${address.toLowerCase()}`;
  db.nonces.set(address.toLowerCase(), message);
  res.json({ message });
});

// POST /api/auth/login — verify SIWE signature, return JWT
authRouter.post('/login', async (req, res) => {
  const { walletAddress, signature } = req.body as { walletAddress?: string; signature?: string };
  if (!walletAddress || !signature) {
    res.status(400).json({ error: 'walletAddress and signature required' }); return;
  }
  const addr = walletAddress.toLowerCase();
  const message = db.nonces.get(addr);
  if (!message) { res.status(400).json({ error: 'No nonce found — request a new one' }); return; }

  try {
    const recovered = ethers.utils.verifyMessage(message, signature).toLowerCase();
    if (recovered !== addr) { res.status(401).json({ error: 'Signature mismatch' }); return; }
  } catch {
    res.status(401).json({ error: 'Invalid signature' }); return;
  }

  db.nonces.delete(addr);
  const user = await UserModel.findOne({ walletAddress: addr });
  if (!user) { res.status(404).json({ error: 'User not registered' }); return; }

  const token = jwt.sign(
    { sub: user._id, walletAddress: user.walletAddress, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
  res.cookie('fc_token', token, COOKIE_OPTS);
  res.json({ user, token });
});

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const { walletAddress, name, email, role } = req.body as {
    walletAddress?: string; name?: string; email?: string; role?: string;
  };
  if (!walletAddress || !name || !role) {
    res.status(400).json({ error: 'walletAddress, name, role required' }); return;
  }
  const addr = walletAddress.toLowerCase();
  const existing = await UserModel.findOne({ walletAddress: addr });
  if (existing) { res.status(409).json({ error: 'Wallet already registered' }); return; }

  const user = await UserModel.create({
    walletAddress: addr,
    name,
    email,
    role: role as 'Artisan' | 'Middleman' | 'Seller',
    kycStatus: 'none',
  });

  const token = jwt.sign(
    { sub: user._id, walletAddress: user.walletAddress, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
  res.cookie('fc_token', token, COOKIE_OPTS);
  res.status(201).json({ user, token });
});

// GET /api/auth/me — validate session
authRouter.get('/me', (req, res) => {
  const token = (req.cookies as Record<string, string>)['fc_token']
    ?? req.headers['authorization']?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    UserModel.findById(payload.sub).then(user => {
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
      res.json({ user });
    }).catch(() => res.status(500).json({ error: 'DB error' }));
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('fc_token');
  res.json({ ok: true });
});
