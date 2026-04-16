'use client';

import { useState, type FormEvent } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui';
import { Card } from '@/components/ui';
import type { User } from '@fairchain/shared';

const ROLES = ['Artisan', 'Middleman', 'Seller'] as const;
type Role = (typeof ROLES)[number];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Artisan: 'I create handcrafted goods and products.',
  Middleman: 'I connect artisans with markets and handle logistics.',
  Seller: 'I sell and distribute products to end consumers.',
};

export default function OnboardPage() {
  const { address } = useAccount();
  const { login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Artisan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address) { setError('No wallet connected. Please go back and connect your wallet.'); return; }
    if (!name.trim()) { setError('Name is required.'); return; }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress: address, name: name.trim(), role, email: email || undefined }),
      });

      const data = (await res.json()) as { user?: User; token?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.');
        return;
      }

      if (data.user && data.token) {
        login(data.user, data.token);
        router.push('/kyc');
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!address) {
    return (
      <div className="section-pad mx-auto max-w-xl animate-fade-in">
        <Card className="text-center">
          <p className="text-lg font-semibold text-white">No wallet connected</p>
          <p className="mt-2 text-sm text-slate-400">
            Connect your wallet first, then return to this page to create your profile.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="section-pad mx-auto max-w-xl animate-fade-in">
      <PageHeader
        title="Create Your Profile"
        subtitle="Tell us who you are in the supply chain. You can update this later."
      />

      <Card className="mt-2">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" id="onboard-form">
          {/* Wallet address (read-only) */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Wallet Address
            </label>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-slate-300">
              {address}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="onboard-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Full Name <span className="text-accent-500">*</span>
            </label>
            <input
              id="onboard-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ritu Sharma"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="onboard-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="onboard-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30"
            />
          </div>

          {/* Role selector */}
          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your Role <span className="text-accent-500">*</span>
            </span>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`role-${r.toLowerCase()}`}
                  onClick={() => setRole(r)}
                  className={`rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                    role === r
                      ? 'border-accent-500/60 bg-accent-500/15 text-accent-500'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{ROLE_DESCRIPTIONS[role]}</p>
          </div>

          <button
            type="submit"
            id="btn-onboard-submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60"
          >
            {isSubmitting ? 'Creating profile…' : 'Create My Profile →'}
          </button>
        </form>
      </Card>
    </div>
  );
}
