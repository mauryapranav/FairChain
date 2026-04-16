import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

// In-memory chat store: contractId → messages[]
const chatMessages = new Map<string, Array<{ from: string; text: string; ts: number }>>();

export const chatRouter = Router();

// GET /api/chat/:contractId
chatRouter.get('/:contractId', requireAuth, (req, res) => {
  const msgs = chatMessages.get(req.params['contractId']!) ?? [];
  res.json({ data: msgs });
});

// POST /api/chat/:contractId
chatRouter.post('/:contractId', requireAuth, (req, res) => {
  const { text } = req.body as { text?: string };
  if (!text) { res.status(400).json({ error: 'text required' }); return; }
  const msg = { from: req.user!.walletAddress, text, ts: Date.now() };
  const key = req.params['contractId']!;
  const list = chatMessages.get(key) ?? [];
  list.push(msg);
  chatMessages.set(key, list);
  // Broadcast via Socket.IO
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { io } = require('../index') as { io: import('socket.io').Server };
    io.to(key).emit('chat_message', msg);
  } catch { /* Socket not available in test */ }
  res.status(201).json({ data: msg });
});
