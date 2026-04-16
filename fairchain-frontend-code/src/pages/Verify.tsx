import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Loader2, AlertCircle, ExternalLink, User2 } from "lucide-react";
import { ContractsAPI, apiError, type Contract, type Escrow } from "@/lib/api";

const IPFS_GW = "https://ipfs.io/ipfs";
const POLYGONSCAN = "https://amoy.polygonscan.com/tx";

export default function Verify() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    ContractsAPI.get(id)
      .then((r) => {
        setContract(r.data.data);
        setEscrow(r.data.escrow);
      })
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="font-display text-2xl">Product Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This product could not be verified. The contract ID may be invalid or not yet registered on FairChain.
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground bg-paper-2 rounded-lg px-3 py-2">{id}</p>
        </div>
      </div>
    );
  }

  const isVerified = ["locked", "completed"].includes(contract.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Verified Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border-2 p-6 flex items-center gap-4 ${
          isVerified ? "border-success/40 bg-success/5" : "border-yellow-500/40 bg-yellow-500/5"
        }`}
      >
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl ${
          isVerified ? "bg-success/20" : "bg-yellow-500/20"
        }`}>
          {isVerified ? "✓" : "⏳"}
        </div>
        <div>
          <h1 className={`font-display text-xl ${isVerified ? "text-success" : "text-yellow-600"}`}>
            {isVerified ? "Verified on Blockchain" : "Pending Verification"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isVerified
              ? `Registered on Polygon Amoy · ${contract.lockedAt ? new Date(contract.lockedAt).toLocaleDateString("en-IN", { dateStyle: "long" }) : "Recently"}`
              : "Contract is pending finalization by the creator"}
          </p>
        </div>
      </motion.div>

      {/* Product Identity */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border hairline bg-paper p-6 space-y-4 shadow-soft">
        <h2 className="font-display text-lg">Product Identity</h2>

        {contract.imageCid && (
          <img
            src={`${IPFS_GW}/${contract.imageCid}`}
            alt={contract.productName}
            className="w-full h-48 object-cover rounded-2xl border hairline"
            loading="lazy"
          />
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Product Name</p>
            <p className="mt-1 font-display text-xl">{contract.productName}</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Category</p>
              <span className="mt-1 inline-block rounded-full bg-paper-2 px-2.5 py-1 text-xs">{contract.category}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Created</p>
              <p className="mt-1 text-sm">{contract.createdAt ? new Date(contract.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}</p>
            </div>
          </div>
          {contract.description && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Description</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{contract.description}</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Supply Chain Journey */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border hairline bg-paper p-6 space-y-4 shadow-soft">
        <h2 className="font-display text-lg">Supply Chain Journey</h2>
        <div className="space-y-3">
          {contract.participants?.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative flex flex-col items-center">
                <div className={`grid h-10 w-10 place-items-center rounded-full border-2 ${
                  isVerified ? "border-success/40 bg-success/10" : "border-border bg-paper-2"
                }`}>
                  <User2 className="h-4 w-4" />
                </div>
                {i < (contract.participants?.length ?? 0) - 1 && (
                  <div className="w-0.5 h-6 bg-border" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.role}</p>
                <p className="font-mono text-xs text-muted-foreground">{p.walletAddress || "—"}</p>
              </div>
              <span className="text-sm font-semibold text-success">{p.paymentSplit}%</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Payment Transparency */}
      {contract.totalAmount && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border hairline bg-paper p-6 space-y-4 shadow-soft">
          <h2 className="font-display text-lg">Payment Transparency</h2>
          <p className="font-display text-2xl">
            ₹{contract.totalAmount.toLocaleString("en-IN")}
            <span className="text-sm font-body text-muted-foreground ml-2">total contract value</span>
          </p>
          <div className="space-y-2 pt-2 border-t hairline">
            {contract.participants?.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{p.role}</span>
                <div className="text-right">
                  <span className="font-medium">{p.paymentSplit}%</span>
                  <span className="ml-2 text-xs text-success">
                    ₹{Math.round(contract.totalAmount! * p.paymentSplit / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Blockchain Proof */}
      {isVerified && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border hairline bg-paper p-6 space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Blockchain Proof
            </h2>
            {contract.ipfsCid && (
              <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-600 border border-purple-500/20">
                Stored on Filecoin
              </span>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <ProofRow label="Contract ID" value={contract.contractId.slice(0, 16) + "…"} />
            {contract.txHash && (
              <ProofRow label="Payment Tx" href={`${POLYGONSCAN}/${contract.txHash}`} linkText={`${contract.txHash.slice(0, 10)}… ↗`} />
            )}
            {contract.ipfsCid && (
              <ProofRow label="IPFS Metadata" href={`${IPFS_GW}/${contract.ipfsCid}`} linkText={`${contract.ipfsCid.slice(0, 10)}… ↗`} />
            )}
            {contract.proofTxHash && (
              <ProofRow label="Proof Registry" href={`${POLYGONSCAN}/${contract.proofTxHash}`} linkText={`${contract.proofTxHash.slice(0, 10)}… ↗`} />
            )}
            {contract.lockedAt && (
              <ProofRow label="Registered On" value={new Date(contract.lockedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />
            )}
          </div>
        </motion.section>
      )}

      {/* Escrow */}
      {escrow && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-3xl border hairline bg-paper p-6 space-y-3 shadow-soft">
          <h2 className="font-display text-lg">Escrow Status</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-600 border border-yellow-500/20 capitalize">
              {escrow.status?.replace(/_/g, " ")}
            </span>
          </div>
          {escrow.milestones?.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t hairline">
              {escrow.milestones.map((m) => (
                <div key={m.index} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={`grid h-4 w-4 place-items-center rounded-full ${
                      m.releasedAt ? "bg-success/20 text-success" : "bg-paper-2 text-muted-foreground"
                    }`}>
                      {m.releasedAt ? "✓" : m.index + 1}
                    </span>
                    {m.description}
                  </span>
                  <span className="font-medium">₹{m.amount?.toLocaleString("en-IN") ?? "0"}</span>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}

      <p className="text-center text-xs text-muted-foreground pb-4">
        Powered by FairChain · Polygon Amoy · IPFS
      </p>
    </div>
  );
}

function ProofRow({ label, value, href, linkText }: { label: string; value?: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b hairline last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-success hover:underline">
          {linkText} <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-xs font-mono">{value}</span>
      )}
    </div>
  );
}
