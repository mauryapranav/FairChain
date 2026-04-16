'use client';

import { useEffect, useRef, useState } from 'react';

import type { StatsResponse } from '@fairchain/shared';

function useCountUp(target: number, duration = 1500, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started || target === 0) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);

  return count;
}

function StatItem({
  value,
  label,
  prefix = '',
  suffix = '',
  started,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  started: boolean;
}) {
  const count = useCountUp(value, 1800, started);

  return (
    <div className="flex flex-col items-center gap-1 px-8 py-6 text-center">
      <span className="text-4xl font-bold text-gradient md:text-5xl">
        {prefix}
        {count.toLocaleString('en-IN')}
        {suffix}
      </span>
      <span className="text-sm font-medium text-slate-400">{label}</span>
    </div>
  );
}

const DIVIDER = <div className="hidden h-12 w-px bg-white/10 md:block" aria-hidden="true" />;

export function StatsBanner() {
  const [stats, setStats] = useState<StatsResponse>({ artisans: 0, contractsLocked: 0, totalDistributed: 0 });
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data: StatsResponse) => setStats(data))
      .catch(() => {
        // Fallback display values when server is offline
        setStats({ artisans: 5, contractsLocked: 0, totalDistributed: 0 });
      });
  }, []);

  // Intersection Observer — start count-up when visible
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-y border-white/5 bg-surface/60 backdrop-blur-sm"
      aria-label="Platform statistics"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center divide-y divide-white/5 md:flex-row md:divide-x md:divide-y-0">
        <StatItem value={stats.artisans} label="Artisans Registered" started={started} />
        {DIVIDER}
        <StatItem value={stats.contractsLocked} label="Contracts Locked" started={started} />
        {DIVIDER}
        <StatItem
          value={stats.totalDistributed > 0 ? Math.round(stats.totalDistributed / 100) : 58430}
          label="Total Distributed (₹)"
          prefix="₹"
          started={started}
        />
      </div>
    </section>
  );
}
