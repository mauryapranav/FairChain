import type { Server } from 'socket.io';

export function setupSocket(io: Server): void {
  io.on('connection', (socket) => {
    console.info(`[socket] connected: ${socket.id}`);

    // Join a contract room for real-time updates
    socket.on('join_contract', (contractId: string) => {
      void socket.join(contractId);
      console.info(`[socket] ${socket.id} joined room: ${contractId}`);
    });

    socket.on('leave_contract', (contractId: string) => {
      void socket.leave(contractId);
    });

    socket.on('disconnect', () => {
      console.info(`[socket] disconnected: ${socket.id}`);
    });
  });
}
