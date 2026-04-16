import { io, type Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    const token = localStorage.getItem("fc_token");
    _socket = io(API_URL, {
      auth: { token: token ?? "" },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    _socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
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

// Join a contract room for real-time updates
export function joinContract(contractId: string): void {
  getSocket().emit("join_contract", contractId);
}

export function leaveContract(contractId: string): void {
  getSocket().emit("leave_contract", contractId);
}
