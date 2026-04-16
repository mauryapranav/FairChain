import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-md bg-ink text-paper">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 8l8-4 8 4-8 4-8-4z" />
          <path d="M4 16l8 4 8-4" />
          <path d="M4 12l8 4 8-4" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">FairChain</span>
    </Link>
  );
}
