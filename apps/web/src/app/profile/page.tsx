'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { ProfileCard } from '@/components/user/ProfileCard';
import { PageHeader, Card, Badge, Spinner } from '@/components/ui';
import type { User } from '@fairchain/shared';

export default function ProfilePage() {
  const { user, isLoading, login } = useAuth();
  const { connect, isConnected } = useWallet();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit form state
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: user?.bio ?? '',
    location: user?.location ?? '',
    speciality: user?.speciality ?? '',
  });

  // Sync form when user loads
  const startEdit = () => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? '',
      location: user?.location ?? '',
      speciality: user?.speciality ?? '',
    });
    setIsEditing(true);
    setSaveError(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as { data?: User; error?: string };
      if (!res.ok) { setSaveError(data.error ?? 'Save failed'); return; }
      if (data.data) { login(data.data, 'cookie-session'); }
      setIsEditing(false);
    } catch {
      setSaveError('Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="section-pad flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="section-pad mx-auto max-w-xl animate-fade-in">
        <PageHeader title="My Profile" subtitle="Connect your wallet to view and manage your profile." />
        <Card className="text-center">
          <p className="mb-4 text-slate-400">No wallet connected yet.</p>
          <button onClick={connect} className="btn-primary mx-auto" type="button" id="btn-profile-connect">
            Connect Wallet
          </button>
        </Card>
      </div>
    );
  }

  // ── Not registered (wallet connected but no profile) ──────────────────────
  if (!user) {
    return (
      <div className="section-pad mx-auto max-w-xl animate-fade-in">
        <PageHeader title="My Profile" subtitle="You haven't created a FairChain profile yet." />
        <Card className="text-center">
          <Link href="/onboard" className="btn-primary mx-auto" id="btn-go-onboard">
            Create Profile
          </Link>
        </Card>
      </div>
    );
  }

  // ── Authenticated profile view ────────────────────────────────────────────
  return (
    <div className="section-pad mx-auto max-w-4xl animate-fade-in">
      <PageHeader
        title="My Profile"
        subtitle="Your identity on the FairChain network."
        actions={
          !isEditing ? (
            <button onClick={startEdit} className="btn-ghost" id="btn-edit-profile" type="button">
              Edit Profile
            </button>
          ) : null
        }
      />

      <div className="grid gap-6 md:grid-cols-5">
        {/* Left: Profile Card */}
        <div className="md:col-span-2">
          <ProfileCard user={user} />

          {/* KYC status */}
          <Card className="mt-4" noHover>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">KYC Status</p>
            <Badge
              variant={user.kycStatus === 'verified' ? 'verified' : user.kycStatus === 'pending' ? 'pending' : 'default'}
            >
              {user.kycStatus === 'none' ? 'Not Started' : user.kycStatus === 'pending' ? 'Under Review' : 'Verified'}
            </Badge>
            {user.kycStatus === 'none' && (
              <p className="mt-2 text-xs text-slate-500">Start KYC verification to unlock contract creation.</p>
            )}
          </Card>

          {/* Contracts count placeholder */}
          <Card className="mt-4" noHover>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Contracts</p>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="mt-1 text-xs text-slate-500">No contracts yet.</p>
            <Link href="/contract/new" className="mt-3 inline-block text-xs text-accent-500 hover:underline">
              Create your first →
            </Link>
          </Card>
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-3">
          <Card noHover>
            <h2 className="mb-6 text-base font-semibold text-white">
              {isEditing ? 'Edit Details' : 'Profile Details'}
            </h2>

            {isEditing ? (
              <form onSubmit={handleSave} id="profile-edit-form" className="space-y-5">
                {saveError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {saveError}
                  </div>
                )}

                {[
                  { id: 'edit-name', label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                  { id: 'edit-email', label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
                  { id: 'edit-location', label: 'Location', key: 'location', type: 'text', placeholder: 'City, Country' },
                  { id: 'edit-speciality', label: 'Speciality', key: 'speciality', type: 'text', placeholder: 'e.g. Block Printing' },
                ].map(({ id, label, key, type, placeholder }) => (
                  <div key={key}>
                    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {label}
                    </label>
                    <input
                      id={id}
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30"
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="edit-bio" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Bio
                  </label>
                  <textarea
                    id="edit-bio"
                    rows={4}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell the chain about yourself…"
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" id="btn-save-profile" disabled={isSaving} className="btn-primary disabled:opacity-60">
                    {isSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="space-y-4 text-sm">
                {[
                  { label: 'Name', value: user.name },
                  { label: 'Email', value: user.email ?? '—' },
                  { label: 'Location', value: user.location ?? '—' },
                  { label: 'Speciality', value: user.speciality ?? '—' },
                  { label: 'Bio', value: user.bio ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4">
                    <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
