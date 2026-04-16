import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t hairline py-10 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Logo />
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <Link to="/explore" className="hover:text-ink transition-colors">Explore</Link>
            <Link to="/register-product" className="hover:text-ink transition-colors">Create Contract</Link>
            <Link to="/scan" className="hover:text-ink transition-colors">Scan</Link>
            <Link to="/track" className="hover:text-ink transition-colors">Verify Product</Link>
            <Link to="/about" className="hover:text-ink transition-colors">About</Link>
          </div>
        </div>
        <p className="mt-6">© {new Date().getFullYear()} FairChain. Built for transparent, fair supply chains.</p>
      </div>
    </footer>
  );
}
