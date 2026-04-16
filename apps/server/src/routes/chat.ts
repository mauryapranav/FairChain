import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

// In-memory chat store: contractId → messages[]
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderWallet: string;
  content: string;
  timestamp: string;
}

const chatStore = new Map<string, ChatMessage[]>();

function getIO() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require('../index') as { io: import('socket.io').Server }).io;
}

export const chatRouter = Router();

// GET /api/chat/:contractId/history  ← what ChatDrawer actually calls
chatRouter.get('/:contractId/history', requireAuth, (req, res) => {
  const msgs = chatStore.get(req.params['contractId']!) ?? [];
  res.json({ data: msgs });
});

// GET /api/chat/:contractId  (legacy / direct access)
chatRouter.get('/:contractId', requireAuth, (req, res) => {
  const msgs = chatStore.get(req.params['contractId']!) ?? [];
  res.json({ data: msgs });
});

// POST /api/chat/:contractId  — send a message via HTTP (fallback; socket is preferred)
chatRouter.post('/:contractId', requireAuth, (req, res) => {
  const { content, senderName } = req.body as { content?: string; senderName?: string };
  if (!content) { res.status(400).json({ error: 'content required' }); return; }

  const msg: ChatMessage = {
    id:           `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    senderId:     req.user!.sub,
    senderName:   senderName ?? 'Unknown',
    senderWallet: req.user!.walletAddress ?? '',
    content,
    timestamp:    new Date().toISOString(),
  };

  const key  = req.params['contractId']!;
  const list = chatStore.get(key) ?? [];
  list.push(msg);
  chatStore.set(key, list);

  // Broadcast via Socket.IO using the event name ChatDrawer listens for
  try {
    getIO().to(key).emit('receive_message', msg);
  } catch { /* Socket not available in test */ }

  res.status(201).json({ data: msg });
});
