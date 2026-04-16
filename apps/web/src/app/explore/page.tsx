'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProfileCard } from '@/components/user/ProfileCard';

interface User {
  id: string;
  walletAddress: string;
  name?: string;
  email?: string;
  role: string;
  reputationScore: number;
  kycStatus: string;
  bio?: string;
  location?: string;
  speciality?: string;
  avatarUrl?: string;
}

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '';
const ROLES = ['All', 'Artisan', 'Middleman', 'Seller'] as const;
type Role = typeof ROLES[number];

export default function ExplorePage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole]       = useState<Role>('All');
  const [search, setSearch]   = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sortBy: 'reputation', limit: '50' });
    if (role !== 'All') params.set('role', role);
    try {
      const res  = await fetch(`${API}/api/users?${params.toString()}`);
      const data = await res.json() as { data: User[] };
      setUsers(data.data ?? []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [role]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.walletAddress.toLowerCase().includes(q) ||
      u.speciality?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Explore <span className="text-gradient">Artisans</span>
          </h1>
          <p className="text-slate-400 mt-1">Discover verified craftspeople, traders, and sellers on FairChain</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, location, speciality…"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5A0]/40"
              aria-label="Search users"
              id="explore-search"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  role === r
                    ? 'bg-[#00E5A0]/15 border-[#00E5A0]/40 text-[#00E5A0]'
                    : 'border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                }`}
                aria-pressed={role === r}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass h-48 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-4xl">🧵</div>
            <h2 className="text-lg font-semibold text-white mb-2">No artisans found</h2>
            <p className="text-sm text-slate-400 mb-4">
              {search ? `No results for "${search}"` : `No ${role === 'All' ? '' : role + ' '}users registered yet`}
            </p>
            {(search || role !== 'All') && (
              <button onClick={() => { setSearch(''); setRole('All'); }} className="btn-ghost text-sm" id="btn-clear-filters">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-600">{filtered.length} result{filtered.length !== 1 ? 's' : ''} · sorted by reputation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(u => (
                <ProfileCard key={u.id} user={u as never} compact />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
