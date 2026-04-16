import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, MapPin, Star, ShieldCheck } from "lucide-react";
import { UsersAPI, apiError, type User } from "@/lib/api";
import { Input } from "@/components/ui/input";

const ROLES = ["All", "Artisan", "Middleman", "Seller"] as const;
type Role = (typeof ROLES)[number];

export default function Explore() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("All");
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params: Record<string, string | number> = { sortBy: "reputation", limit: 50 };
    if (role !== "All") params.role = role;
    try {
      const { data } = await UsersAPI.list(params as never);
      setUsers(data.data ?? []);
    } catch (e) {
      setError(apiError(e));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.walletAddress?.toLowerCase().includes(q) ||
      u.speciality?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Directory</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">Explore artisans & sellers</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover verified craftspeople, traders, and sellers on FairChain.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location, speciality…"
            className="h-11 rounded-xl pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                role === r
                  ? "bg-ink text-paper border-ink"
                  : "border-border text-muted-foreground hover:text-ink hover:border-ink/30"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border hairline bg-paper p-12 text-center shadow-soft">
          <p className="font-display text-xl">No users found.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? `No results for "${search}"` : `No ${role === "All" ? "" : role + " "}users yet.`}
          </p>
          {(search || role !== "All") && (
            <button onClick={() => { setSearch(""); setRole("All"); }} className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="rounded-3xl border hairline bg-paper p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-ink font-display text-paper text-sm">
                    {u.name?.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg truncate">{u.name || "Anonymous"}</h3>
                    <p className="text-xs text-muted-foreground">{u.role || "User"}</p>
                  </div>
                </div>

                {u.speciality && (
                  <p className="mt-3 text-sm text-muted-foreground">{u.speciality}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {u.location && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-xs">
                      <MapPin className="h-3 w-3" /> {u.location}
                    </span>
                  )}
                  {u.kycStatus === "verified" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {(u.reputationScore ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-xs">
                      <Star className="h-3 w-3" /> {u.reputationScore}
                    </span>
                  )}
                </div>

                {u.walletAddress && (
                  <p className="mt-3 font-mono text-xs text-muted-foreground truncate">
                    {u.walletAddress}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
