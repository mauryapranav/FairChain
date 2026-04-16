import { cn } from '@/lib/utils';
import type { User } from '@fairchain/shared';

// ── Avatar helpers ────────────────────────────────────────────────────────────

const PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#82E0AA',
  '#74B9FF', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00CEC9',
];

function getAvatarStyle(address: string): { bg: string; border: string } {
  const idx = parseInt(address.slice(2, 4), 16) % PALETTE.length;
  const color = PALETTE[idx] ?? '#00E5A0';
  return { bg: `${color}20`, border: `1px solid ${color}50` };
}

function getInitials(address: string): string {
  return address.slice(2, 4).toUpperCase();
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ReputationStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Reputation: ${score} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < Math.round(score) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          className={i < Math.round(score) ? 'text-accent-500' : 'text-slate-600'}
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-slate-400">({score.toFixed(1)})</span>
    </div>
  );
}

// ── Role badge colors ─────────────────────────────────────────────────────────

const ROLE_STYLES = {
  Artisan: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Middleman: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Seller: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
} satisfies Record<string, string>;

// ── Component ─────────────────────────────────────────────────────────────────

interface ProfileCardProps {
  user: User;
  className?: string;
  /** Show compact layout for list views */
  compact?: boolean;
}

export function ProfileCard({ user, className, compact = false }: ProfileCardProps) {
  const avatarStyle = getAvatarStyle(user.walletAddress);

  return (
    <div
      className={cn('glass p-6 transition-all duration-300', compact && 'flex items-center gap-4 p-4', className)}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-2xl font-bold',
          compact ? 'h-12 w-12 text-sm' : 'mb-4 h-20 w-20 text-xl'
        )}
        style={{ background: avatarStyle.bg, border: avatarStyle.border }}
        aria-hidden="true"
      >
        {getInitials(user.walletAddress)}
      </div>

      <div className={cn('min-w-0', !compact && 'flex flex-col gap-2')}>
        {/* Name + verified */}
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
          {user.kycStatus === 'verified' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent-500/30 bg-accent-500/15 px-2 py-0.5 text-[10px] font-semibold text-accent-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* Role badge */}
        <span
          className={cn(
            'inline-block self-start rounded-full border px-2.5 py-0.5 text-xs font-medium',
            ROLE_STYLES[user.role] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/30'
          )}
        >
          {user.role}
        </span>

        {!compact && (
          <>
            {/* Reputation */}
            <ReputationStars score={user.reputationScore} />

            {/* Location + speciality */}
            {user.location && (
              <p className="flex items-center gap-1.5 text-sm text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {user.location}
              </p>
            )}
            {user.speciality && (
              <p className="text-sm text-slate-400">
                <span className="font-medium text-slate-300">Speciality: </span>
                {user.speciality}
              </p>
            )}
            {user.bio && (
              <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-3">{user.bio}</p>
            )}
          </>
        )}

        {/* Wallet address */}
        <p className={cn('font-mono text-xs text-slate-500', !compact && 'mt-1')}>
          {shortenAddress(user.walletAddress)}
        </p>
      </div>
    </div>
  );
}
