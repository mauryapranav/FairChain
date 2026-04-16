import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, ShieldCheck, Lock, AlertCircle, ArrowLeft,
  CheckCircle2, Clock, User2, Send,
} from "lucide-react";
import {
  ContractsAPI, EscrowAPI, ChatAPI, apiError,
  type Contract, type Escrow, type Dispute, type ChatMessage,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockingLoading, setLockingLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ContractsAPI.get(id)
      .then((r) => {
        setContract(r.data.data);
        setEscrow(r.data.escrow);
        setDispute(r.data.dispute);
      })
      .catch((e) => setError(apiError(e)))
      .finally(() => setLoading(false));

    // Load chat
    ChatAPI.getMessages(id)
      .then((r) => setMessages(r.data.data ?? []))
      .catch(() => {});
  }, [id]);

  const handleLock = async () => {
    if (!id) return;
    setLockingLoading(true);
    try {
      const { data } = await ContractsAPI.lock(id);
      setContract(data.data);
      toast.success("Contract locked on-chain!");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLockingLoading(false);
    }
  };

  const handleReleaseMilestone = async (milestoneIndex: number) => {
    if (!id) return;
    try {
      const { data } = await EscrowAPI.releaseMilestone(id, milestoneIndex);
      setEscrow(data.escrow);
      toast.success(`Milestone ${milestoneIndex + 1} released!`);
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const handleSendChat = async () => {
    if (!id || !chatInput.trim()) return;
    setSendingChat(true);
    try {
      const { data } = await ChatAPI.send(id, chatInput.trim());
      setMessages((prev) => [...prev, data.data]);
      setChatInput("");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/contracts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-ink mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to contracts
        </Link>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Contract not found</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/contracts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to contracts
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border hairline bg-paper p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Contract</p>
            <h1 className="mt-1 font-display text-3xl">{contract.productName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{contract.description}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            contract.status === "locked" ? "bg-success/10 text-success" :
            contract.status === "completed" ? "bg-ink/10 text-ink" :
            "bg-paper-2"
          }`}>
            {contract.status}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Category</dt>
            <dd className="mt-1">{contract.category}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Participants</dt>
            <dd className="mt-1">{contract.participants?.length} parties</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Value</dt>
            <dd className="mt-1">{contract.totalAmount ? `₹${contract.totalAmount.toLocaleString("en-IN")}` : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Created</dt>
            <dd className="mt-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : "—"}</dd>
          </div>
        </dl>

        {/* Lock button */}
        {contract.status === "pending" && (
          <Button onClick={handleLock} disabled={lockingLoading} className="mt-6 rounded-full bg-ink text-paper hover:bg-ink-soft">
            {lockingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Lock on-chain
          </Button>
        )}

        {/* IPFS/Proof */}
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
              <p className="text-sm font-medium">On-chain Proof Tx</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{contract.proofTxHash}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Participants */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
        <h2 className="font-display text-lg">Participants</h2>
        <div className="mt-4 space-y-2">
          {contract.participants?.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border hairline p-3 text-sm">
              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4 text-muted-foreground" />
                <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs">{p.role}</span>
                <span className="font-mono text-xs text-muted-foreground">{p.walletAddress || "—"}</span>
              </div>
              <span className="text-xs font-semibold">{p.paymentSplit}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Escrow */}
      {escrow && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h2 className="font-display text-lg">Escrow</h2>
          <p className="mt-1 text-sm text-muted-foreground">Status: <span className="font-semibold text-ink">{escrow.status}</span></p>
          {escrow.milestones?.length > 0 && (
            <div className="mt-4 space-y-2">
              {escrow.milestones.map((m) => (
                <div key={m.index} className="flex items-center justify-between rounded-xl border hairline p-3 text-sm">
                  <div>
                    <span className="font-medium">Milestone {m.index + 1}</span>
                    {m.description && <span className="ml-2 text-muted-foreground">— {m.description}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {m.releasedAt ? (
                      <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Released</span>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs" onClick={() => handleReleaseMilestone(m.index)}>
                        Release
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Dispute */}
      {dispute && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="font-display text-lg text-destructive">Active Dispute</h2>
          <p className="mt-2 text-sm">{dispute.reason || "No reason provided"}</p>
          <p className="mt-2 text-xs text-muted-foreground">Status: {dispute.status}</p>
        </motion.div>
      )}

      {/* Terms */}
      {contract.terms && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h2 className="font-display text-lg">Terms & Conditions</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{contract.terms}</p>
        </motion.div>
      )}

      {/* Chat */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
        <h2 className="font-display text-lg">Contract Chat</h2>
        <div className="mt-4 max-h-64 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">No messages yet. Start the conversation.</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className="rounded-xl border hairline p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{m.sender?.slice(0, 10)}…</span>
                <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-1">{m.message}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message…"
            className="h-10 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
          />
          <Button onClick={handleSendChat} disabled={sendingChat || !chatInput.trim()} className="h-10 rounded-xl bg-ink text-paper hover:bg-ink-soft">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
