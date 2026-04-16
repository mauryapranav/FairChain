import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'verified' | 'pending';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-white/10 text-slate-300 border border-white/10',
  verified:
    'bg-accent-500/15 text-accent-500 border border-accent-500/30',
  pending:
    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  verified: 'bg-accent-500',
  pending: 'bg-amber-400',
};

/**
 * Status badge with three variants: default · verified · pending
 */
export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          dotStyles[variant],
          variant === 'verified' && 'animate-pulse-accent'
        )}
      />
      {children}
    </span>
  );
}
