import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Camera, Loader2, Search } from "lucide-react";
import { ContractsAPI, apiError, type Contract } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

type Tab = "scan" | "generate";

export default function Scan() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("scan");
  const [manual, setManual] = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Load contracts for generate tab
  useEffect(() => {
    if (tab !== "generate" || !user) return;
    setLoadingContracts(true);
    ContractsAPI.list({ limit: 50 })
      .then((r) => {
        setContracts(r.data.data ?? []);
        if (r.data.data?.length) setSelectedId(r.data.data[0].contractId);
      })
      .catch(() => {})
      .finally(() => setLoadingContracts(false));
  }, [tab, user]);

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manual.trim();
    if (!id) return;
    const match = id.match(/\/verify\/([a-f0-9-]{36})/);
    nav(`/verify/${match ? match[1] : id}`);
  };

  const verifyUrl = selectedId ? `${window.location.origin}/verify/${selectedId}` : "";

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="text-center">
        <QrCode className="mx-auto h-10 w-10 text-ink" />
        <h2 className="mt-3 font-display text-2xl">FairChain QR</h2>
        <p className="mt-1 text-sm text-muted-foreground">Scan a product or generate your own QR</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border hairline bg-paper p-1 shadow-soft">
        {(["scan", "generate"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-ink text-paper" : "text-muted-foreground hover:text-ink"
            }`}
          >
            {t === "scan" ? (
              <span className="flex items-center justify-center gap-1.5"><Camera className="h-3.5 w-3.5" /> Scan</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5"><QrCode className="h-3.5 w-3.5" /> Generate</span>
            )}
          </button>
        ))}
      </div>

      {/* Scan tab */}
      {tab === "scan" && (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border hairline bg-paper overflow-hidden shadow-soft">
            <div className="aspect-square grid place-items-center bg-paper-2">
              <div className="text-center space-y-3">
                <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Camera scanning requires a secure context (HTTPS)</p>
                <p className="text-xs text-muted-foreground">Use manual entry below instead</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or enter manually</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleManual} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="manual-id">Contract ID or Verify URL</Label>
              <Input
                id="manual-id"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-…"
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>
            <Button type="submit" disabled={!manual.trim()} className="w-full h-11 rounded-xl bg-ink text-paper hover:bg-ink-soft">
              <Search className="mr-2 h-4 w-4" /> Verify
            </Button>
          </form>
        </>
      )}

      {/* Generate tab */}
      {tab === "generate" && (
        <>
          {!user ? (
            <div className="rounded-3xl border hairline bg-paper p-8 text-center shadow-soft space-y-3">
              <p className="text-3xl">🔐</p>
              <p className="font-display text-lg">Login required</p>
              <p className="text-sm text-muted-foreground">Sign in to generate QR codes for your contracts.</p>
            </div>
          ) : loadingContracts ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="rounded-3xl border hairline bg-paper p-8 text-center shadow-soft space-y-3">
              <p className="text-3xl">📦</p>
              <p className="font-display text-lg">No contracts yet</p>
              <p className="text-sm text-muted-foreground">Create a contract first to generate its QR code.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-select">Select contract</Label>
                <select
                  id="contract-select"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {contracts.map((c) => (
                    <option key={c.contractId} value={c.contractId}>
                      {c.productName} — {c.status}
                    </option>
                  ))}
                </select>
              </div>

              {selectedId && (
                <div className="rounded-3xl border hairline bg-paper p-6 text-center shadow-soft space-y-4">
                  {/* QR code placeholder — in production use a QR library */}
                  <div className="mx-auto grid h-48 w-48 place-items-center rounded-2xl border hairline bg-paper-2">
                    <div className="text-center">
                      <QrCode className="mx-auto h-16 w-16 text-ink" />
                      <p className="mt-2 text-xs text-muted-foreground">QR Code</p>
                    </div>
                  </div>
                  <p className="font-display">{contracts.find((c) => c.contractId === selectedId)?.productName}</p>
                  <div className="rounded-lg bg-paper-2 p-2">
                    <p className="font-mono text-xs text-muted-foreground break-all">{verifyUrl}</p>
                  </div>
                  <Button onClick={() => navigator.clipboard.writeText(verifyUrl)} variant="outline" className="rounded-full">
                    📋 Copy verify link
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        FairChain · Scan any product QR code to verify its supply chain
      </p>
    </div>
  );
}
