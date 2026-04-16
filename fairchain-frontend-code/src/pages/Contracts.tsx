import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Loader2, Filter } from "lucide-react";
import { ContractsAPI, apiError, type Contract } from "@/lib/api";
import { Button } from "@/components/ui/button";

const STATUSES = ["all", "pending", "locked", "completed"] as const;

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");

  const load = (statusFilter?: string) => {
    setContracts(null);
    setError(null);
    const params: Record<string, string | number> = { limit: 50 };
    if (statusFilter && statusFilter !== "all") params.status = statusFilter;
    ContractsAPI.list(params as never)
      .then((r) => setContracts(r.data.data))
      .catch((e) => setError(apiError(e)));
  };

  useEffect(() => { load(status); }, [status]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Contracts</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">All contracts</h2>
        </div>
        <Button asChild className="rounded-full bg-ink text-paper hover:bg-ink-soft">
          <Link to="/register-product">+ New contract</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              status === s ? "bg-ink text-paper border-ink" : "border-border text-muted-foreground hover:text-ink hover:border-ink/30"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {contracts === null && !error && (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      )}

      {contracts && contracts.length === 0 && (
        <div className="rounded-3xl border hairline bg-paper p-12 text-center shadow-soft">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-display text-xl">No contracts found.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {status !== "all" ? "Try a different filter." : "Create your first contract to get started."}
          </p>
        </div>
      )}

      {contracts && contracts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contracts.map((c, i) => (
            <motion.div
              key={c.contractId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                to={`/contracts/${c.contractId}`}
                className="block rounded-3xl border hairline bg-paper p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg">{c.productName}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    c.status === "locked" ? "bg-success/10 text-success" :
                    c.status === "completed" ? "bg-ink/10 text-ink" :
                    "bg-paper-2"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{c.category}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.participants?.length ?? 0} participants</span>
                  <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                </div>
                {c.totalAmount && (
                  <p className="mt-2 font-display text-sm">₹{c.totalAmount.toLocaleString("en-IN")}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
