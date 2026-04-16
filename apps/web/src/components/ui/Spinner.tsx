import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

/**
 * Accessible loading spinner — uses border animation, respects reduced-motion.
 */
export function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span
        className={cn(
          'animate-spin rounded-full border-transparent border-t-accent-500',
          'border-r-accent-500/30',
          sizeMap[size]
        )}
        style={{ borderStyle: 'solid' }}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
