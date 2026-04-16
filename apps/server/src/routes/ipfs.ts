import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadJSON, gatewayUrl } from '../lib/ipfs';

export const ipfsRouter = Router();

// POST /api/ipfs/upload
ipfsRouter.post('/upload', requireAuth, async (req, res) => {
  const { data, name } = req.body as { data?: unknown; name?: string };
  if (!data) { res.status(400).json({ error: 'data required' }); return; }
  const cid = await uploadJSON(data, name ?? 'upload');
  res.json({ cid, url: gatewayUrl(cid) });
});

// GET /api/ipfs/:cid  — proxy/redirect helper
ipfsRouter.get('/:cid', (req, res) => {
  res.redirect(gatewayUrl(req.params['cid']!));
});
