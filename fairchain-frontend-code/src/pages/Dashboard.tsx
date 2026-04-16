import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, Activity, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ContractsAPI, apiError, type Contract } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ContractsAPI.list({ limit: 50 })
      .then((r) => setContracts(r.data.data))
      .catch((e) => setError(apiError(e)));
  }, []);

  const stats = useMemo(() => {
    const total = contracts?.length ?? 0;
    const locked = contracts?.filter((c) => c.status === "locked").length ?? 0;
    const completed = contracts?.filter((c) => c.status === "completed").length ?? 0;
    return [
      { label: "Total contracts", value: total, icon: FileText },
      { label: "Locked on-chain", value: locked, icon: ShieldCheck },
      { label: "Completed", value: completed, icon: Activity },
    ];
  }, [contracts]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().slice(0, 10);
      const count =
        contracts?.filter((c) => c.createdAt?.slice(0, 10) === key).length ?? 0;
      return { day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count };
    });
    return days;
  }, [contracts]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Overview</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Your supply chain, at a glance.</h2>
        </div>
        <Button asChild className="rounded-full bg-ink text-paper hover:bg-ink-soft">
          <Link to="/register-product">New contract <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-3xl border hairline bg-paper p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-ink-soft" />
            </div>
            <p className="mt-4 font-display text-4xl">
              {contracts === null ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-paper-2" /> : s.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg">Contracts · last 14 days</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--ink))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--ink))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--ink))" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
          <h3 className="font-display text-lg">Status</h3>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-success" />
              <div>
                <p>Network healthy.</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-ink" />
              <div>
                <p>{contracts?.length ?? 0} contracts tracked.</p>
                <p className="text-xs text-muted-foreground">Live from backend</p>
              </div>
            </li>
            {error && (
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-destructive" />
                <div>
                  <p className="text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> API unreachable
                  </p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border hairline bg-paper p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg">Recent contracts</h3>
          <Link to="/contracts" className="text-xs text-muted-foreground hover:text-ink">View all →</Link>
        </div>

        {contracts === null && !error && (
          <div className="grid place-items-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {error && <p className="py-6 text-sm text-destructive">{error}</p>}
        {contracts && contracts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No contracts yet.</p>
            <Button asChild className="mt-4 rounded-full bg-ink text-paper hover:bg-ink-soft">
              <Link to="/register-product">Create your first contract</Link>
            </Button>
          </div>
        )}
        {contracts && contracts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Participants</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts.slice(0, 8).map((c) => (
                  <tr key={c.contractId} className="border-t hairline">
                    <td className="py-3 pr-4 font-medium">{c.productName}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.category}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.participants?.length ?? 0}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        c.status === "locked" ? "bg-success/10 text-success" :
                        c.status === "completed" ? "bg-ink/10 text-ink" :
                        "bg-paper-2"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Link to={`/contracts/${c.contractId}`} className="text-xs underline-offset-4 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
