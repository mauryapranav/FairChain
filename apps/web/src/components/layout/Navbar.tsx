'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { WalletButton } from './WalletButton';
import { MobileNav } from './MobileNav';

const NAV_LINKS = [
  { href: '/explore',      label: 'Explore'         },
  { href: '/contract/new', label: 'Create Contract'  },
  { href: '/scan',         label: 'Scan'             },
  { href: '/verify',       label: 'Verify Product'   },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0A0F1E]/80 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2" aria-label="FairChain home">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00E5A0]/30 bg-[#00E5A0]/15 transition-colors group-hover:bg-[#00E5A0]/25"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="text-[#00E5A0]">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight">
            <span className="text-gradient">Fair</span>
            <span className="text-white">Chain</span>
          </span>
        </Link>

        {/* Centre nav links — desktop only */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn('nav-link rounded-md px-3 py-2 text-sm transition-all', isActive && 'active bg-[#00E5A0]/10')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right — profile + wallet + mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="btn-ghost hidden sm:inline-flex" id="btn-profile" aria-label="View profile">
            Profile
          </Link>
          <WalletButton />
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
