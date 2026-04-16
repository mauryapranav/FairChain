import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, CheckCircle, Plus, ShieldCheck, Globe2, Boxes,
  Link2, FileText, ScanLine, ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import landingHero from "@/assets/landing_hero.png";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const STATS = [
  { value: "100%", label: "On-chain verified" },
  { value: "IPFS", label: "Decentralized storage" },
  { value: "Polygon", label: "Amoy testnet" },
  { value: "Fair", label: "Payment splits" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Onboard & Verify",
    desc: "Connect your wallet, create a profile, and complete KYC verification to become a trusted participant.",
    icon: ShieldCheck,
  },
  {
    step: "02",
    title: "Create a Contract",
    desc: "Define your product, add participants with payment splits, set milestones, and lock it on-chain.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Scan & Verify",
    desc: "Anyone can scan a QR code or enter a contract ID to view the full, tamper-proof supply chain journey.",
    icon: ScanLine,
  },
];

const TECH = [
  { icon: Link2, title: "Polygon Blockchain", desc: "Contracts are anchored on Polygon Amoy with cryptographic proof of every participant and payment." },
  { icon: Globe2, title: "IPFS / Filecoin", desc: "Contract metadata is stored on IPFS for decentralized, tamper-evident, permanent records." },
  { icon: Boxes, title: "Escrow & Milestones", desc: "Built-in escrow holds funds and releases them milestone-by-milestone as work is verified." },
  { icon: ShieldCheck, title: "KYC Verification", desc: "Every participant is KYC-verified so buyers and auditors can trust the supply chain." },
];

export default function Landing() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6 pt-20">
        {/* Grid bg */}
        <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='%23000' stroke-width='0.5'/%3E%3C/svg%3E\")", backgroundSize: "40px 40px" }} />

        <div className="container mx-auto grid gap-12 md:grid-cols-2 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-left"
          >
            <h1 className="mb-6 font-display text-5xl tracking-tight md:text-6xl lg:text-7xl">
              Not just <br />
              <span className="italic text-ink-soft">who made it.</span>
            </h1>

            <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-lg">
              Proof of who handled it, who got paid, and what actually happened.
              <br className="hidden md:block" />
              Blockchain-anchored supply chain contracts.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-full bg-ink px-8 py-3 text-paper hover:bg-ink-soft">
                <Link to="/explore">
                  <Search className="mr-2 h-4 w-4" /> Explore
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-ink/20 bg-paper/50 backdrop-blur-md px-8 py-3">
                <Link to="/track">
                  <CheckCircle className="mr-2 h-4 w-4" /> Verify
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border hairline bg-paper-2 shadow-elevated">
              <img src={landingHero} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/5 to-transparent mix-blend-overlay" />
            </div>

            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 rounded-2xl border hairline bg-paper px-6 py-4 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-xs font-semibold uppercase tracking-widest text-ink/70">Network Syncing</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </section>

      {/* ── STATS BANNER ────────────────────────────────────────────────── */}
      <section className="border-y hairline bg-paper-2">
        <div className="container mx-auto grid grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-paper px-6 py-8 text-center">
              <p className="font-display text-2xl md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">How it works</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
            Three steps to a transparent supply chain.
          </h2>
        </motion.div>

        <div className="mt-14 space-y-0">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.step}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className="flex gap-6 border-t hairline py-8"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border hairline bg-paper-2">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Step {item.step}</span>
                <h3 className="mt-1 font-display text-xl">{item.title}</h3>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TECHNOLOGY / TRUST ──────────────────────────────────────────── */}
      <section className="bg-paper-2 border-y hairline">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Built on trust</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
              Technology that keeps everyone honest.
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TECH.map((t, i) => (
              <motion.div
                key={t.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="rounded-3xl border hairline bg-paper p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border hairline bg-paper-2">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl bg-ink p-10 text-paper md:p-16">
          <div className="relative text-center md:text-left md:flex md:items-end md:justify-between md:gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-paper/60">Get started</p>
              <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
                Create your first{" "}
                <span className="italic">fair agreement.</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm text-paper/60">
                Define participants, set payment splits, and lock it on-chain.
                Every step is transparent, verifiable, and permanent.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
              <Button asChild size="lg" className="rounded-full bg-paper px-8 text-ink hover:bg-paper-2">
                <Link to="/register-product">
                  <Plus className="mr-2 h-4 w-4" /> Create Contract
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-paper/30 bg-transparent px-8 text-paper hover:bg-paper/10 hover:text-paper">
                <Link to="/about">Learn more</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
