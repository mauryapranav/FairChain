import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PackagePlus, Search, FileText, Users,
  Bell, LogOut, ShieldCheck, User2, QrCode, ScanLine,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const mainItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/contracts", label: "Contracts", icon: FileText },
  { to: "/register-product", label: "New Contract", icon: PackagePlus },
  { to: "/explore", label: "Explore", icon: Users },
  { to: "/track", label: "Track", icon: Search },
  { to: "/scan", label: "QR Scanner", icon: ScanLine },
];

const accountItems = [
  { to: "/profile", label: "My Profile", icon: User2 },
  { to: "/kyc", label: "KYC Verification", icon: ShieldCheck },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email?.[0] ?? "G").toUpperCase();

  return (
    <div className="min-h-screen w-full">
      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r hairline bg-paper/60 md:flex md:flex-col">
          <div className="flex h-16 items-center border-b hairline px-5">
            <Logo />
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Main navigation */}
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Navigation</p>
              {mainItems.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2"
                    }`
                  }
                >
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </NavLink>
              ))}
            </div>

            {/* Account section */}
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Account</p>
              {accountItems.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-2"
                    }`
                  }
                >
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="border-t hairline p-3">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-medium text-paper">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{user?.name || user?.email || "Guest"}</p>
                <div className="flex items-center gap-1">
                  {user?.role && (
                    <span className="text-xs text-muted-foreground">{user.role}</span>
                  )}
                  {user?.kycStatus === "verified" && (
                    <ShieldCheck className="h-3 w-3 text-success" />
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => { logout(); nav("/login"); }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        <div className="flex min-h-screen w-full flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b hairline glass px-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">FairChain</p>
              <h1 className="font-display text-lg">Console</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full p-2 hover:bg-paper-2" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </button>
              <NavLink to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-medium text-paper hover:opacity-90 transition-opacity">
                {initials}
              </NavLink>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
