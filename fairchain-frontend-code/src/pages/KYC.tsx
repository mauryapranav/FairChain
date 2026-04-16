import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { KycAPI, apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type KycStatus = "none" | "pending" | "verified";

const STATUS_UI: Record<KycStatus, { icon: string; title: string; subtitle: string }> = {
  none: {
    icon: "🪪",
    title: "Verify Your Identity",
    subtitle: "KYC verification lets you participate in contracts and be listed as a trusted artisan or middleman.",
  },
  pending: {
    icon: "⏳",
    title: "Verification In Progress",
    subtitle: "Your identity is being verified. This typically takes a few seconds in development and a few minutes in production.",
  },
  verified: {
    icon: "✅",
    title: "Identity Verified",
    subtitle: "Your KYC is complete. You can now create and participate in FairChain contracts.",
  },
};

export default function KYC() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await KycAPI.getStatus();
      setStatus(data.kycStatus as KycStatus);
      setUserName(data.name);
      setUserRole(data.role);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchStatus(); }, [fetchStatus]);

  // Poll while pending
  useEffect(() => {
    if (status !== "pending") return;
    const interval = setInterval(() => { void fetchStatus(); }, 3000);
    return () => clearInterval(interval);
  }, [status, fetchStatus]);

  // Redirect to profile when verified
  useEffect(() => {
    if (status === "verified") {
      const t = setTimeout(() => nav("/profile"), 3000);
      return () => clearTimeout(t);
    }
  }, [status, nav]);

  const handleInitiate = async () => {
    setInitiating(true);
    setError(null);
    try {
      const { data } = await KycAPI.initiate();
      setStatus("pending");
      if (data.redirectUrl) window.open(data.redirectUrl, "_blank");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setInitiating(false);
    }
  };

  const ui = status ? STATUS_UI[status] : null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Identity</p>
        <h2 className="mt-2 font-display text-3xl">KYC Verification</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Prove your identity to unlock full FairChain participation
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : ui && status ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl border p-6 space-y-4 ${
            status === "verified" ? "border-success/30 bg-success/5" :
            status === "pending" ? "border-yellow-500/30 bg-yellow-500/5" :
            "hairline bg-paper"
          } shadow-soft`}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">{ui.icon}</div>
            <div>
              <p className={`font-display text-lg ${
                status === "verified" ? "text-success" :
                status === "pending" ? "text-yellow-600" : ""
              }`}>{ui.title}</p>
              {userName && (
                <p className="text-xs text-muted-foreground mt-0.5">{userName} · {userRole}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{ui.subtitle}</p>

          {status === "pending" && (
            <div className="flex items-center gap-2 text-xs text-yellow-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Auto-refreshing…
            </div>
          )}
          {status === "verified" && (
            <p className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Redirecting to your profile…
            </p>
          )}
        </motion.div>
      ) : null}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {status === "none" && !loading && (
        <Button
          onClick={handleInitiate}
          disabled={initiating}
          className="w-full h-12 rounded-xl bg-ink text-paper hover:bg-ink-soft"
        >
          {initiating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
          {initiating ? "Starting verification…" : "Start Identity Verification"}
        </Button>
      )}

      {status === "verified" && (
        <Button asChild className="w-full h-12 rounded-xl bg-ink text-paper hover:bg-ink-soft">
          <Link to="/profile">Go to My Profile →</Link>
        </Button>
      )}

      {/* Steps */}
      <div className="rounded-3xl border hairline bg-paper p-5 space-y-3 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What happens</p>
        {[
          { step: "1", label: 'Click "Start Verification"', done: status !== "none" },
          { step: "2", label: "Identity check runs (auto in dev mode)", done: status === "verified" || status === "pending" },
          { step: "3", label: "KYC badge added to your profile", done: status === "verified" },
        ].map(({ step, label, done }) => (
          <div key={step} className="flex items-center gap-3 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              done ? "bg-success/10 text-success border border-success/30" : "bg-paper-2 text-muted-foreground"
            }`}>
              {done ? "✓" : step}
            </div>
            <span className={done ? "" : "text-muted-foreground"}>{label}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        FairChain uses mock KYC in development. Production connects to DigiLocker / HyperVerge.
      </p>
    </div>
  );
}
