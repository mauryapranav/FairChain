import { FormEvent, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, MapPin, Clock, Hash, User2, AlertCircle, ShieldCheck, Lock } from "lucide-react";
import { ContractsAPI, apiError, type Contract, type Escrow, type Dispute } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Track() {
  const [params, setParams] = useSearchParams();
  const [id, setId] = useState(params.get("id") ?? "");
  const [contract, setContract] = useState<Contract | null>(null);
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (cid: string) => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    setContract(null);
    setEscrow(null);
    setDispute(null);
    try {
      const { data } = await ContractsAPI.get(cid);
      setContract(data.data);
      setEscrow(data.escrow);
      setDispute(data.dispute);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = params.get("id");
    if (q) search(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setParams(id ? { id } : {});
    search(id);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Tracker</p>
      <h2 className="mt-2 font-display text-3xl md:text-4xl">Verify a contract, end to end.</h2>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter contract ID (UUID)"
          className="h-11 rounded-xl"
        />
        <Button type="submit" disabled={loading || !id} className="h-11 rounded-xl bg-ink px-5 text-paper hover:bg-ink-soft">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Search className="mr-2 h-4 w-4" /> Track</>)}
        </Button>
      </form>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-medium">Couldn't load this contract.</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {contract && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl border hairline bg-paper p-6 shadow-soft md:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Contract</p>
              <h3 className="mt-1 font-display text-2xl">{contract.productName}</h3>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${
              contract.status === "locked" ? "bg-success/10 text-success" :
              contract.status === "completed" ? "bg-ink/10 text-ink" :
              "bg-paper-2"
            }`}>
              {contract.status}
            </span>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Category</dt>
              <dd className="mt-1 inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {contract.category}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Participants</dt>
              <dd className="mt-1 inline-flex items-center gap-2"><User2 className="h-3.5 w-3.5" /> {contract.participants?.length ?? 0} parties</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">Contract ID</dt>
              <dd className="mt-1 inline-flex items-center gap-2 font-mono text-xs"><Hash className="h-3.5 w-3.5" /> {contract.contractId}</dd>
            </div>
          </dl>

          {contract.description && (
            <div className="mt-6">
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Description</h4>
              <p className="mt-2 text-sm text-muted-foreground">{contract.description}</p>
            </div>
          )}

          {/* Participants */}
          {contract.participants && contract.participants.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Participants</h4>
              <div className="mt-3 space-y-2">
                {contract.participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border hairline p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs">{p.role}</span>
                      <span className="font-mono text-xs text-muted-foreground">{p.walletAddress?.slice(0, 10)}…</span>
                    </div>
                    <span className="text-xs font-semibold">{p.paymentSplit}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IPFS Proof */}
          {contract.ipfsCid && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border hairline p-4">
              <ShieldCheck className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">IPFS Proof</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{contract.ipfsCid}</p>
              </div>
            </div>
          )}

          {contract.proofTxHash && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border hairline p-4">
              <Lock className="h-5 w-5 text-ink-soft" />
              <div>
                <p className="text-sm font-medium">On-chain proof</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{contract.proofTxHash}</p>
              </div>
            </div>
          )}

          {contract.lockedAt && (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Locked at {new Date(contract.lockedAt).toLocaleString()}
            </p>
          )}
        </motion.div>
      )}

      {/* Escrow */}
      {escrow && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h3 className="font-display text-lg">Escrow</h3>
          <p className="mt-1 text-sm text-muted-foreground">Status: <span className="font-semibold text-ink">{escrow.status}</span></p>
          {escrow.milestones?.length > 0 && (
            <div className="mt-4 space-y-2">
              {escrow.milestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border hairline p-3 text-sm">
                  <span>Milestone {m.index + 1}: {m.description || "—"}</span>
                  <span className={m.releasedAt ? "text-success text-xs" : "text-muted-foreground text-xs"}>
                    {m.releasedAt ? "✓ Released" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Dispute */}
      {dispute && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl border border-destructive/20 bg-destructive/5 p-6">
          <h3 className="font-display text-lg text-destructive">Active Dispute</h3>
          <p className="mt-1 text-sm">{dispute.reason || "No reason provided"}</p>
          <p className="mt-2 text-xs text-muted-foreground">Status: {dispute.status}</p>
        </motion.div>
      )}

      {!contract && !error && !loading && (
        <div className="mt-12 rounded-3xl border hairline bg-paper p-10 text-center shadow-soft">
          <p className="font-display text-xl">Enter a contract ID to begin.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try one from your <Link to="/dashboard" className="underline underline-offset-4">dashboard</Link>, or create a new contract first.
          </p>
        </div>
      )}
    </div>
  );
}
