import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackOrderBar } from '@/components/landing/TrackOrderBar';

import { CircuitGrid } from '@/components/landing/CircuitGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { StatsBanner } from '@/components/landing/StatsBanner';
import { TechTrust } from '@/components/landing/TechTrust';

export const metadata: Metadata = {
  title: 'FairChain — Not just who made it.',
  description:
    'Proof of who handled it, who got paid, and what actually happened. Blockchain-anchored supply chain contracts for fair trade.',
};

export default function HomePage() {
  return (
    <>
      {/* ── Section 1: Hero ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <CircuitGrid />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl animate-slide-up">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse-accent" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-500">
              Live on Polygon Amoy
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
            Not just{' '}
            <span className="text-gradient">who made it.</span>
          </h1>

          {/* Subline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
            Proof of who handled it, who got paid, and what actually happened.
            <br className="hidden md:block" />
            Blockchain-anchored supply chain contracts — with fairness built in.
          </p>

            {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Link href="/explore" id="cta-explore" className="btn-primary text-base px-8 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Explore Participants
            </Link>
            <Link href="/verify/demo" id="cta-verify" className="btn-ghost text-base px-8 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
              </svg>
              Verify a Product
            </Link>
          </div>

          {/* Track Order */}
          <TrackOrderBar />
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" className="text-slate-600">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* ── Section 2: Stats ─────────────────────────────────────────────── */}
      <StatsBanner />

      {/* ── Section 3: How It Works ──────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Section 4: Tech Trust ────────────────────────────────────────── */}
      <TechTrust />

      {/* ── Section 5: Final CTA ─────────────────────────────────────────── */}
      <section className="py-28 text-center" aria-labelledby="final-cta-title">
        <div className="mx-auto max-w-2xl px-6">
          <h2 id="final-cta-title" className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Create your first{' '}
            <span className="text-gradient">fair agreement.</span>
          </h2>
          <p className="mb-8 text-slate-400">
            Define participants, set payment splits, and lock it on-chain. Every step is transparent,
            verifiable, and permanent.
          </p>
          <Link href="/contract/new" id="cta-create-contract" className="btn-primary text-base px-10 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>
    </>
  );
}
