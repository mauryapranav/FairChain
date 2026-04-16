'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',               label: 'Home'            },
  { href: '/explore',        label: 'Explore'         },
  { href: '/contract/new',   label: 'Create Contract' },
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
        className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
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
          bg-[#0D1424] border-r border-white/[0.07]
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <span className="text-gradient font-bold text-lg">FairChain</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${pathname === href
                  ? 'bg-[--color-accent]/10 text-[--color-accent]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 px-5 text-center">
          <p className="text-xs text-slate-600">FairChain · Polygon Amoy</p>
        </div>
      </div>
    </>
  );
}
