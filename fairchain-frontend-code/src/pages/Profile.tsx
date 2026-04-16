import { useState, FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User2, MapPin, Star, ShieldCheck, Edit3, Save, X, Loader2 } from "lucide-react";
import { UsersAPI, apiError, type User } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    speciality: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        speciality: user.speciality ?? "",
      });
    }
  }, [user]);

  const startEdit = () => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        speciality: user.speciality ?? "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await UsersAPI.update(user.id, form);
      toast.success("Profile updated!");
      setIsEditing(false);
      // Refresh page to get updated user
      window.location.reload();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md text-center py-12">
        <p className="font-display text-xl">No profile yet.</p>
        <p className="mt-2 text-sm text-muted-foreground">Create your FairChain profile to get started.</p>
        <Button asChild className="mt-4 rounded-full bg-ink text-paper hover:bg-ink-soft">
          <Link to="/onboard">Create Profile</Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Account</p>
          <h2 className="mt-2 font-display text-3xl">My Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your identity on the FairChain network.</p>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={startEdit} className="rounded-full">
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Left: Profile Card */}
        <div className="md:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-ink font-display text-xl text-paper">
                {initials}
              </div>
              <div>
                <h3 className="font-display text-xl">{user.name || "Anonymous"}</h3>
                <p className="text-sm text-muted-foreground">{user.role || "User"}</p>
              </div>
            </div>
            {user.bio && <p className="mt-4 text-sm text-muted-foreground">{user.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {user.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-xs">
                  <MapPin className="h-3 w-3" /> {user.location}
                </span>
              )}
              {user.speciality && (
                <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-xs">
                  <Star className="h-3 w-3" /> {user.speciality}
                </span>
              )}
            </div>
            {user.walletAddress && (
              <p className="mt-3 font-mono text-xs text-muted-foreground truncate">{user.walletAddress}</p>
            )}
          </motion.div>

          {/* KYC Status */}
          <div className="rounded-3xl border hairline bg-paper p-5 shadow-soft">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">KYC Status</p>
            <div className="flex items-center gap-2">
              {user.kycStatus === "verified" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs text-success">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              ) : user.kycStatus === "pending" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-600">
                  ⏳ Under Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1 text-xs text-muted-foreground">
                  Not Started
                </span>
              )}
            </div>
            {user.kycStatus !== "verified" && (
              <Link to="/kyc" className="mt-3 block text-xs text-ink underline-offset-4 hover:underline">
                Start KYC verification →
              </Link>
            )}
          </div>

          {/* Reputation */}
          {(user.reputationScore ?? 0) > 0 && (
            <div className="rounded-3xl border hairline bg-paper p-5 shadow-soft">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Reputation</p>
              <p className="font-display text-3xl">{user.reputationScore}</p>
            </div>
          )}
        </div>

        {/* Right: Details / Edit Form */}
        <div className="md:col-span-3">
          <div className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
            <h3 className="font-display text-lg mb-6">{isEditing ? "Edit Details" : "Profile Details"}</h3>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-5">
                {[
                  { id: "edit-name", label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
                  { id: "edit-email", label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
                  { id: "edit-location", label: "Location", key: "location", type: "text", placeholder: "City, Country" },
                  { id: "edit-speciality", label: "Speciality", key: "speciality", type: "text", placeholder: "e.g. Block Printing" },
                ].map(({ id, label, key, type, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={id}>{label}</Label>
                    <Input
                      id={id}
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="h-11 rounded-xl"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <textarea
                    id="edit-bio"
                    rows={4}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell the chain about yourself…"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSaving} className="rounded-xl bg-ink text-paper hover:bg-ink-soft">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? "Saving…" : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="space-y-4 text-sm">
                {[
                  { label: "Name", value: user.name },
                  { label: "Email", value: user.email ?? "—" },
                  { label: "Role", value: user.role ?? "—" },
                  { label: "Location", value: user.location ?? "—" },
                  { label: "Speciality", value: user.speciality ?? "—" },
                  { label: "Bio", value: user.bio ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 border-b hairline pb-3 last:border-0 last:pb-0">
                    <dt className="w-24 shrink-0 text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
