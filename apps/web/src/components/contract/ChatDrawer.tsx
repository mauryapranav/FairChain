'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderWallet: string;
  content: string;
  timestamp: string;
}

interface Props {
  contractId: string;
  open: boolean;
  onClose: () => void;
}

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '';

export function ChatDrawer({ contractId, open, onClose }: Props) {
  const { user, token } = useAuth();
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [typing, setTyping]         = useState<string | null>(null);
  const [connected, setConnected]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history
  useEffect(() => {
    if (!open || !token) return;
    fetch(`${API}/api/chat/${contractId}/history`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: { data: Message[] }) => setMessages(d.data ?? []))
      .catch(() => {});
  }, [open, contractId, token]);

  // Socket setup
  useEffect(() => {
    if (!open || !token) return;
    const socket = getSocket(token);

    socket.on('connect',      () => setConnected(true));
    socket.on('disconnect',   () => setConnected(false));
    socket.emit('join_room', contractId);

    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setTyping(null);
    });

    socket.on('user_typing', (data: { wallet: string }) => {
      setTyping(data.wallet);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(null), 3000);
    });

    return () => {
      socket.emit('leave_room', contractId);
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [open, token, contractId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !token) return;
    const socket = getSocket(token);
    socket.emit('send_message', {
      contractId,
      content:    input.trim(),
      senderName: user?.name ?? 'Anonymous',
    });
    setInput('');
  }, [input, token, contractId, user]);

  const emitTyping = useCallback(() => {
    if (!token) return;
    getSocket(token).emit('user_typing', contractId);
  }, [token, contractId]);

  const isMine = (msg: Message) => msg.senderId === user?.id;

  return (
    <div
      className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col
        bg-[#0D1424] border-l border-white/[0.07] shadow-2xl
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      aria-label="Contract chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Contract Chat</span>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-600'}`} aria-label={connected ? 'Connected' : 'Disconnected'} />
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl" aria-label="Close chat">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-600 text-sm">
            <p className="text-3xl mb-3">💬</p>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col gap-0.5 ${isMine(msg) ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-600 px-1">
              {isMine(msg) ? 'You' : msg.senderName}
            </span>
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMine(msg)
                  ? 'bg-[#00E5A0]/20 text-white rounded-br-sm border border-[#00E5A0]/20'
                  : 'bg-white/[0.06] text-slate-200 rounded-bl-sm border border-white/[0.06]'}`}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-slate-700 px-1">
              {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {typing && (
          <div className="flex items-start gap-2">
            <div className="bg-white/[0.06] border border-white/[0.06] px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
              <span className="flex gap-0.5">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
            <span className="text-[10px] text-slate-600 mt-2">{typing.slice(0, 8)}… is typing</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-3 border-t border-white/[0.07]">
        {!token ? (
          <p className="text-xs text-slate-600 text-center py-2">Connect wallet to chat</p>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => { setInput(e.target.value); emitTyping(); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Message…"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/40"
              aria-label="Chat message input"
              maxLength={2000}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="btn-primary px-3.5"
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
