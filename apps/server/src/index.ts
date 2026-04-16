import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { app } from './app';
import { setupSocket } from './socket';

const PORT = Number(process.env['PORT'] ?? 4000);
const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? 'http://localhost:3000';

const httpServer = http.createServer(app);

export const io = new SocketServer(httpServer, {
  cors: {
    origin:      CORS_ORIGIN,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

setupSocket(io);

httpServer.listen(PORT, () => {
  console.info(`🚀 FairChain API  → http://localhost:${PORT}`);
  console.info(`📡 Socket.io      → ws://localhost:${PORT}`);
});
