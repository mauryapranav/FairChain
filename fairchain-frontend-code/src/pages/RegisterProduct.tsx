import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, PackagePlus, Plus, Trash2 } from "lucide-react";
import { ContractsAPI, IpfsAPI, apiError, type Participant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const CATEGORIES = [
  "Textiles", "Jewellery", "Handicrafts", "Spices", "Pottery",
  "Woodwork", "Leather", "Electronics", "Agriculture", "Other",
];
const ROLES = ["Artisan", "Middleman", "Seller"];

type MilestoneInput = { index: number; description: string; amount: number };

export default function RegisterProduct() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);

  // Step 1: Product
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCid, setImageCid] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Step 2: Participants
  const [participants, setParticipants] = useState<Participant[]>([
    { walletAddress: "", role: "Artisan", paymentSplit: 100, userId: "" },
  ]);

  // Step 3: Milestones
  const [milestonesEnabled, setMilestonesEnabled] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { index: 0, description: "", amount: 0 },
  ]);
  const [totalAmount, setTotalAmount] = useState("");

  // Step 4: Terms
  const [terms, setTerms] = useState("");

  const splitTotal = participants.reduce((s, p) => s + p.paymentSplit, 0);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const { data } = await IpfsAPI.uploadImage(file);
      setImageCid(data.cid);
      toast.success("Image uploaded to IPFS!");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addParticipant = () => {
    setParticipants((p) => [...p, { walletAddress: "", role: "Middleman", paymentSplit: 0, userId: "" }]);
  };

  const removeParticipant = (i: number) => {
    setParticipants((p) => p.filter((_, idx) => idx !== i));
  };

  const updateParticipant = (i: number, field: keyof Participant, value: string | number) => {
    setParticipants((p) => p.map((pt, idx) => (idx === i ? { ...pt, [field]: value } : pt)));
  };

  const addMilestone = () => {
    setMilestones((m) => [...m, { index: m.length, description: "", amount: 0 }]);
  };

  const updateMilestone = (i: number, field: keyof MilestoneInput, value: string | number) => {
    setMilestones((m) => m.map((ms, idx) => (idx === i ? { ...ms, [field]: value } : ms)));
  };

  const onSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!productName || !description || !category || !terms) {
      setError("All required fields must be filled.");
      return;
    }
    if (Math.abs(splitTotal - 100) > 0.01) {
      setError(`Payment splits must total 100% (currently ${splitTotal}%)`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await ContractsAPI.create({
        productName: productName.trim(),
        description: description.trim(),
        category,
        terms: terms.trim(),
        participants,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        milestonesEnabled,
        milestones: milestonesEnabled ? milestones : [],
        imageCid: imageCid ?? undefined,
      });
      setCreated({ id: data.data.contractId, name: data.data.productName });
      toast.success("Contract created on-chain");
    } catch (e) {
      const msg = apiError(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const STEP_LABELS = ["Product", "Participants", "Milestones", "Terms", "Review"];

  if (created) {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-start gap-4 rounded-3xl border hairline bg-paper p-6 shadow-soft"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-display text-lg">"{created.name}" contract created.</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">id · {created.id}</p>
            <div className="mt-3 flex gap-3">
              <Link to={`/contracts/${created.id}`} className="text-sm underline-offset-4 hover:underline">
                View contract →
              </Link>
              <button
                onClick={() => {
                  setCreated(null);
                  setStep(1);
                  setProductName("");
                  setDescription("");
                  setCategory("");
                  setTerms("");
                }}
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Create another
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">New contract</p>
      <h2 className="mt-2 font-display text-3xl md:text-4xl">Create a supply chain contract.</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Define product, participants, payment splits, and lock it on-chain.
      </p>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-1">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => i + 1 < step && setStep(i + 1)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                step === i + 1
                  ? "text-ink"
                  : i + 1 < step
                  ? "text-muted-foreground hover:text-ink cursor-pointer"
                  : "text-muted-foreground/40 cursor-default"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  step === i + 1
                    ? "bg-ink text-paper"
                    : i + 1 < step
                    ? "bg-muted text-ink"
                    : "bg-paper-2 text-muted-foreground/40"
                }`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 1: Product */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h3 className="font-display text-lg">Product Details</h3>
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Hand-woven Pashmina Shawl" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the product and its origin…" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Product Image (optional)</Label>
            <div className="flex items-center gap-3">
              <input type="file" id="product-image" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); uploadImage(f); } }} />
              <label htmlFor="product-image" className="cursor-pointer text-sm text-muted-foreground hover:text-ink">
                📎 {imageFile ? imageFile.name : "Upload image"}
              </label>
              {uploading && <span className="text-xs text-muted-foreground animate-pulse">Uploading…</span>}
              {imageCid && <span className="text-xs text-success">✓ Pinned</span>}
            </div>
          </div>
          <Button onClick={() => { if (!productName || !description || !category) { setError("Fill required fields"); return; } setError(null); setStep(2); }} className="w-full h-11 rounded-xl bg-ink text-paper hover:bg-ink-soft">
            Next: Participants →
          </Button>
        </motion.div>
      )}

      {/* Step 2: Participants */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h3 className="font-display text-lg">Participants</h3>
          <p className="text-xs text-muted-foreground">Add all parties in the supply chain. Splits must total 100%.</p>
          <div className="space-y-3">
            {participants.map((p, i) => (
              <div key={i} className="rounded-xl border hairline p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Participant {i + 1}</span>
                  {participants.length > 1 && (
                    <button onClick={() => removeParticipant(i)} className="text-xs text-destructive hover:text-destructive/80">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Input value={p.walletAddress} onChange={(e) => updateParticipant(i, "walletAddress", e.target.value)} placeholder="0x… wallet address" className="h-9 rounded-lg font-mono text-xs" />
                <div className="flex gap-2">
                  <select value={p.role} onChange={(e) => updateParticipant(i, "role", e.target.value)} className="flex-1 h-9 rounded-lg border border-input bg-background px-2 text-xs">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="flex items-center gap-1 border border-input rounded-lg px-2 h-9">
                    <input type="number" value={p.paymentSplit} min={0} max={100} onChange={(e) => updateParticipant(i, "paymentSplit", parseFloat(e.target.value) || 0)} className="w-12 bg-transparent text-xs focus:outline-none" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={addParticipant} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-ink">
              <Plus className="h-3.5 w-3.5" /> Add participant
            </button>
            <span className={`text-xs font-semibold ${Math.abs(splitTotal - 100) < 0.01 ? "text-success" : "text-destructive"}`}>
              Total: {splitTotal}%
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl">← Back</Button>
            <Button onClick={() => { if (Math.abs(splitTotal - 100) > 0.01) { setError("Splits must total 100%"); return; } setError(null); setStep(3); }} className="flex-1 h-11 rounded-xl bg-ink text-paper hover:bg-ink-soft">Next →</Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Milestones */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h3 className="font-display text-lg">Payment & Milestones</h3>
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Contract Value (₹)</Label>
            <Input id="totalAmount" type="number" value={totalAmount} min={1} onChange={(e) => setTotalAmount(e.target.value)} placeholder="e.g. 5000" className="h-11 rounded-xl" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setMilestonesEnabled((v) => !v)} className={`w-10 h-5 rounded-full transition-colors relative ${milestonesEnabled ? "bg-success" : "bg-muted"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-paper rounded-full shadow transition-transform ${milestonesEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm">Enable milestone-based payments</span>
          </label>
          {milestonesEnabled && (
            <div className="space-y-3">
              {milestones.slice(0, 5).map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                  <Input value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)} placeholder="Milestone description" className="flex-1 h-9 rounded-lg text-xs" />
                  <div className="flex items-center gap-1 border border-input rounded-lg px-2 h-9 shrink-0">
                    <span className="text-xs text-muted-foreground">₹</span>
                    <input type="number" value={m.amount} min={0} onChange={(e) => updateMilestone(i, "amount", parseFloat(e.target.value) || 0)} className="w-16 bg-transparent text-xs focus:outline-none" />
                  </div>
                </div>
              ))}
              {milestones.length < 5 && (
                <button onClick={addMilestone} className="text-xs text-muted-foreground hover:text-ink">+ Add milestone</button>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11 rounded-xl">← Back</Button>
            <Button onClick={() => { setError(null); setStep(4); }} className="flex-1 h-11 rounded-xl bg-ink text-paper hover:bg-ink-soft">Next →</Button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Terms */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h3 className="font-display text-lg">Contract Terms</h3>
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions *</Label>
            <textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} rows={8} placeholder="Describe obligations, delivery conditions, quality standards, dispute procedures…" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-11 rounded-xl">← Back</Button>
            <Button onClick={() => { if (!terms.trim()) { setError("Terms are required"); return; } setError(null); setStep(5); }} className="flex-1 h-11 rounded-xl bg-ink text-paper hover:bg-ink-soft">Review →</Button>
          </div>
        </motion.div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5 rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h3 className="font-display text-lg">Review & Create</h3>
          <div className="space-y-2 text-sm">
            <Row label="Product" value={productName} />
            <Row label="Category" value={category} />
            <Row label="Participants" value={`${participants.length} parties`} />
            <Row label="Total Value" value={totalAmount ? `₹${parseFloat(totalAmount).toLocaleString("en-IN")}` : "Not set"} />
            <Row label="Milestones" value={milestonesEnabled ? `${milestones.length} milestones` : "Single payment"} />
            <Row label="Image" value={imageCid ? "✓ Pinned to IPFS" : "No image"} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(4)} className="flex-1 h-11 rounded-xl">← Back</Button>
            <Button onClick={() => onSubmit()} disabled={loading} className="flex-1 h-11 rounded-xl bg-ink text-paper hover:bg-ink-soft">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><PackagePlus className="mr-2 h-4 w-4" /> Create Contract</>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b hairline last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
