import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Disable the default hover glow effect */
  noHover?: boolean;
  as?: 'div' | 'article' | 'section';
}

/**
 * Glass-morphism surface card.
 * Composes via className — no variant system needed; use Tailwind utilities.
 */
export function Card({ children, className, noHover = false, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={cn(
        'glass p-6 transition-all duration-300',
        !noHover && 'hover:shadow-card-hover',
        className
      )}
    >
      {children}
    </Tag>
  );
}
