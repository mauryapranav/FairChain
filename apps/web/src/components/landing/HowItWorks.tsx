const STEPS = [
  {
    id: 'discover',
    label: 'Discover',
    description: 'Find artisans and verify their reputation on-chain.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'agree',
    label: 'Agree',
    description: 'Define terms, payment splits, and all participants.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 17a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v7" />
        <path d="M15 17H9" />
        <path d="M9 17v4h6v-4" />
      </svg>
    ),
  },
  {
    id: 'lock',
    label: 'Lock',
    description: 'Anchor the contract to IPFS and Polygon. Funds enter escrow.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: 'verify',
    label: 'Verify',
    description: 'Scan the QR — anyone can verify provenance and payment history.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4 12 14.01l-3-3" />
      </svg>
    ),
  },
] as const;

export function HowItWorks() {
  return (
    <section className="relative py-24" aria-labelledby="how-it-works-title">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent-500">
            The Process
          </p>
          <h2 id="how-it-works-title" className="text-3xl font-bold text-white md:text-4xl">
            How FairChain Works
          </h2>
        </div>

        <div className="relative flex flex-col gap-8 md:flex-row md:items-start">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="relative flex flex-1 flex-col items-center text-center">
              {/* Connector line (desktop only) */}
              {idx < STEPS.length - 1 && (
                <div
                  className="absolute left-[calc(50%+2.5rem)] top-7 hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-accent-500/40 via-accent-500/20 to-transparent md:block"
                  aria-hidden="true"
                />
              )}

              {/* Icon circle */}
              <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-500/30 bg-accent-500/10 text-accent-500 transition-all duration-300 hover:border-accent-500/60 hover:bg-accent-500/20 hover:shadow-glow">
                {step.icon}
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-navy-900">
                  {idx + 1}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white">{step.label}</h3>
              <p className="max-w-[200px] text-sm leading-relaxed text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
