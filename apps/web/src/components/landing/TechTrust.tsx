const TECH = [
  {
    id: 'polygon',
    name: 'Polygon',
    tagline: 'Low-fee, fast smart contracts',
    color: '#8247E5',
    icon: (
      <svg width="32" height="32" viewBox="0 0 38 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M29.018 10.133a2.448 2.448 0 0 0-2.432 0L20.9 13.6l-3.82 2.148-5.648 3.467a2.448 2.448 0 0 1-2.432 0l-4.446-2.587a2.506 2.506 0 0 1-1.216-2.148V9.914c0-.862.468-1.67 1.216-2.089l4.41-2.533a2.448 2.448 0 0 1 2.431 0l4.41 2.533c.748.419 1.216 1.227 1.216 2.09v3.466l3.82-2.203v-3.52A2.56 2.56 0 0 0 19.625 5.5L13.23 1.817a2.448 2.448 0 0 0-2.432 0L4.337 5.5A2.56 2.56 0 0 0 3.121 7.65v7.312c0 .862.468 1.67 1.216 2.09l6.442 3.736a2.448 2.448 0 0 0 2.432 0l5.648-3.412 3.82-2.203 5.648-3.413a2.448 2.448 0 0 1 2.432 0l4.41 2.533c.748.419 1.216 1.228 1.216 2.09v4.566c0 .862-.468 1.67-1.216 2.089l-4.374 2.533a2.448 2.448 0 0 1-2.432 0l-4.41-2.533a2.506 2.506 0 0 1-1.216-2.09v-3.465l-3.82 2.203v3.52c0 .861.468 1.669 1.216 2.089l6.442 3.735a2.448 2.448 0 0 0 2.432 0l6.442-3.735a2.506 2.506 0 0 0 1.216-2.09V12.222a2.506 2.506 0 0 0-1.198-2.09Z" fill="#8247E5"/>
      </svg>
    ),
  },
  {
    id: 'ipfs',
    name: 'IPFS',
    tagline: 'Tamper-proof decentralised storage',
    color: '#65C2CB',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" stroke="#65C2CB" strokeWidth="2" />
        <polygon points="16,6 25,21 7,21" fill="none" stroke="#65C2CB" strokeWidth="1.8" strokeLinejoin="round" />
        <polygon points="16,26 7,11 25,11" fill="none" stroke="#65C2CB" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'razorpay',
    name: 'Razorpay / UPI',
    tagline: 'Instant INR payments & escrow',
    color: '#3395FF',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#3395FF" fillOpacity="0.15" stroke="#3395FF" strokeWidth="1.5"/>
        <path d="M8 22L14 10h10L20 16h-6l-2 6H8Z" fill="#3395FF" />
      </svg>
    ),
  },
] as const;

export function TechTrust() {
  return (
    <section className="py-20" aria-labelledby="tech-trust-title">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
        <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-slate-500">
          Powered By
        </p>

        <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-4">
          {TECH.map((tech) => (
            <div
              key={tech.id}
              className="glass flex w-full flex-col items-center gap-4 p-8 text-center transition-all duration-300 md:w-72"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: `${tech.color}15`, border: `1px solid ${tech.color}30` }}
              >
                {tech.icon}
              </div>
              <div>
                <p className="text-base font-semibold text-white">{tech.name}</p>
                <p className="mt-1 text-sm text-slate-400">{tech.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
