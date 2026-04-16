'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',               label: 'Home'            },
  { href: '/explore',        label: 'Explore'         },
  { href: '/contract/new',   label: 'Create Contract' },
  { href: '/ledger',         label: 'Ledger'          },
  { href: '/scan',           label: '⊡ Scan'          },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-ink/5 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className={`block w-5 h-0.5 bg-ink-soft transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-ink-soft transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-ink-soft transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72
          bg-paper border-r border-ink/10 shadow-elevated
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <span className="text-gradient font-bold text-lg font-display">FairChain</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-ink/5 text-ink-soft"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Links */}
        <nav className="px-4 py-6 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${pathname === href
                  ? 'bg-accent-100 text-accent-600 font-semibold'
                  : 'text-ink-soft hover:text-ink hover:bg-ink/5'}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 px-5 text-center">
          <p className="text-xs text-ink/40">FairChain · Polygon Amoy</p>
        </div>
      </div>
    </>
  );
}
