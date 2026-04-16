import { motion } from "framer-motion";
import globe from "@/assets/about-globe.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export default function About() {
  return (
    <>
      <section className="container pb-16 pt-12 md:pt-20">
        <motion.p {...fadeUp} className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Our mission
        </motion.p>
        <motion.h1 {...fadeUp} className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
          A world where every product can <span className="italic">prove its story</span>.
        </motion.h1>
      </section>

      <section className="container">
        <motion.div {...fadeUp} className="overflow-hidden rounded-3xl border hairline shadow-elevated">
          <img src={globe} alt="Hand-drawn globe" loading="lazy" className="h-[420px] w-full object-cover md:h-[560px]" />
        </motion.div>
      </section>

      <section className="container grid gap-12 py-24 md:grid-cols-12 md:py-32">
        <motion.div {...fadeUp} className="md:col-span-5">
          <h2 className="font-display text-3xl md:text-4xl">Why blockchain.</h2>
        </motion.div>
        <motion.div {...fadeUp} className="md:col-span-7 space-y-5 text-base leading-relaxed text-ink-soft">
          <p>
            Supply chains are long, opaque, and full of well-meaning paperwork that doesn't survive
            the journey. FairChain replaces the paperwork with cryptographic receipts: short, public,
            and impossible to forge after the fact.
          </p>
          <p>
            We don't ask you to trust us. We give you primitives — signatures, hashes, and
            timestamps anchored to public ledgers — so trust becomes a property of the data itself.
          </p>
        </motion.div>
      </section>

      <section className="container pb-24">
        <motion.h2 {...fadeUp} className="font-display text-3xl md:text-4xl">The team.</motion.h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "Pranav Maurya", r: "Founding engineer" },
            { n: "Aïsha N.", r: "Network & cryptography" },
            { n: "Devi R.", r: "Logistics & partnerships" },
          ].map((p, i) => (
            <motion.div
              key={p.n}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="rounded-3xl border hairline bg-paper p-7 shadow-soft"
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-ink font-display text-paper">
                {p.n.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <h3 className="mt-5 font-display text-xl">{p.n}</h3>
              <p className="text-sm text-muted-foreground">{p.r}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
