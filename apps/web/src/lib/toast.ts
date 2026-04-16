// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// ── Store ─────────────────────────────────────────────────────────────────────

type Listener = (toasts: Toast[]) => void;
const listeners = new Set<Listener>();
let toasts: Toast[] = [];

function emit() {
  listeners.forEach(fn => fn([...toasts]));
}

function remove(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  emit();
}

function add(type: ToastType, message: string, duration = 4000) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message }];
  emit();
  setTimeout(() => remove(id), duration);
}

// ── Public API ────────────────────────────────────────────────────────────────

export const toast = {
  success: (msg: string, d?: number) => add('success', msg, d),
  error:   (msg: string, d?: number) => add('error',   msg, d),
  warning: (msg: string, d?: number) => add('warning', msg, d),
  info:    (msg: string, d?: number) => add('info',    msg, d),
  dismiss: (id: string)              => remove(id),
};

export function subscribeToasts(fn: Listener): () => void {
  listeners.add(fn);
  fn([...toasts]); // immediately emit current state
  return () => listeners.delete(fn);
}
