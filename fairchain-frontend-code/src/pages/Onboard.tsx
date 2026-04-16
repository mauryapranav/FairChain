import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ROLES = ["Artisan", "Middleman", "Seller"] as const;
type Role = (typeof ROLES)[number];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Artisan: "I create handcrafted goods and products.",
  Middleman: "I connect artisans with markets and handle logistics.",
  Seller: "I sell and distribute products to end consumers.",
};

export default function Onboard() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Artisan");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setLoading(true);
    setError(null);
    try {
      await register({
        name: name.trim(),
        email: email || undefined,
        password: password || undefined,
        role,
        walletAddress: walletAddress || undefined,
      });
      toast.success("Profile created!");
      nav("/kyc");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Onboarding</p>
        <h2 className="mt-2 font-display text-3xl">Create Your Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us who you are in the supply chain. You can update this later.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border hairline bg-paper p-6 shadow-soft"
      >
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="onboard-name">Full Name *</Label>
            <Input
              id="onboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ritu Sharma"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-email">Email</Label>
            <Input
              id="onboard-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-password">Password</Label>
            <Input
              id="onboard-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-wallet">Wallet Address (optional)</Label>
            <Input
              id="onboard-wallet"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x…"
              className="h-11 rounded-xl font-mono text-xs"
            />
          </div>

          {/* Role selector */}
          <div className="space-y-3">
            <Label>Your Role *</Label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                    role === r
                      ? "border-ink bg-ink/10 text-ink"
                      : "border-border text-muted-foreground hover:border-ink/30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-ink text-paper hover:bg-ink-soft">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {loading ? "Creating profile…" : "Create My Profile"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
