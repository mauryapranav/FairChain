import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional right-side actions */
  actions?: ReactNode;
  className?: string;
  /** Apply gradient text to title */
  gradient?: boolean;
}

/**
 * Consistent top-of-page header with optional subtitle and action slot.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
  gradient = false,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-10 animate-slide-up', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={cn(
              'text-3xl font-bold tracking-tight md:text-4xl',
              gradient ? 'text-gradient' : 'text-white'
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-base text-slate-400">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="mt-4 flex shrink-0 items-center gap-3 sm:mt-0">{actions}</div>
        )}
      </div>
      {/* Decorative divider */}
      <div className="mt-6 h-px w-full bg-gradient-to-r from-accent-500/30 via-white/5 to-transparent" />
    </header>
  );
}
