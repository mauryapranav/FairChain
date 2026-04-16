'use client';

import { io, type Socket } from 'socket.io-client';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

let _socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!_socket) {
    _socket = io(API_URL, {
      auth:       { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    _socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server forced disconnect — do not auto-reconnect
        _socket = null;
      }
    });
  }
  return _socket;
}

export function disconnectSocket(): void {
  _socket?.disconnect();
  _socket = null;
}
