import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/explore", label: "Explore" },
  { to: "/register-product", label: "Create Contract" },
  { to: "/scan", label: "Scan" },
  { to: "/track", label: "Verify Product" },
] as const;

export function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b hairline bg-paper/80 backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-6 py-3" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="FairChain home">
          <Logo />
        </Link>

        {/* Centre nav — desktop */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = loc.pathname === to || loc.pathname.startsWith(to + "/");
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-ink/10 text-ink" : "text-muted-foreground hover:text-ink hover:bg-paper-2"
                  }`}
                >
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-sm">
              <Link to="/profile">Profile</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-sm">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
          {user ? (
            <Button asChild className="hidden sm:inline-flex rounded-full bg-ink text-paper hover:bg-ink-soft">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="hidden sm:inline-flex rounded-full bg-ink text-paper hover:bg-ink-soft">
              <Link to="/onboard">Get Started</Link>
            </Button>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden rounded-lg p-2 hover:bg-paper-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t hairline bg-paper px-6 py-4 space-y-2">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-ink/10 text-ink" : "text-muted-foreground hover:text-ink"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-2 border-t hairline flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-ink">Profile</Link>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium bg-ink text-paper text-center">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-ink">Sign in</Link>
                <Link to="/onboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium bg-ink text-paper text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
