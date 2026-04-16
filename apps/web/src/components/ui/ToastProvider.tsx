'use client';

import { useEffect, useState } from 'react';
import { subscribeToasts, type Toast } from '@/lib/toast';

const ICONS: Record<Toast['type'], string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const COLORS: Record<Toast['type'], string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  error:   'border-red-500/40    bg-red-500/10    text-red-300',
  warning: 'border-amber-500/40  bg-amber-500/10  text-amber-300',
  info:    'border-sky-500/40    bg-sky-500/10    text-sky-300',
};

const ICON_COLORS: Record<Toast['type'], string> = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  warning: 'text-amber-400',
  info:    'text-sky-400',
};

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
        transition-all duration-300 ${COLORS[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <span className={`text-base font-bold mt-0.5 ${ICON_COLORS[toast.type]}`}>
        {ICONS[toast.type]}
      </span>
      <p className="text-sm font-medium leading-snug">{toast.message}</p>
    </div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
