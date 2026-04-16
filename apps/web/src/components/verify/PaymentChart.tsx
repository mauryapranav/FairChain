'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  type TooltipProps,
} from 'recharts';

interface Participant {
  name?: string;
  role: string;
  paymentSplit: number;
  amount?: number; // INR
}

interface Props {
  participants: Participant[];
  totalAmount?: number;
}

const COLORS = ['#00E5A0', '#38BDF8', '#F59E0B', '#A78BFA', '#F472B6'];

const ROLE_ABBREV: Record<string, string> = {
  Artisan:   'Artisan',
  Middleman: 'Middleman',
  Seller:    'Seller',
};

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload as { name: string; role: string; split: number; amount?: number };
  return (
    <div className="glass px-4 py-3 rounded-xl text-sm space-y-0.5 border border-white/[0.1]">
      <p className="font-semibold text-white">{d.name || d.role}</p>
      <p className="text-slate-400">{d.split}% share</p>
      {d.amount != null && <p className="text-[#00E5A0] font-semibold">₹{d.amount.toLocaleString('en-IN')}</p>}
    </div>
  );
}

export function PaymentChart({ participants, totalAmount }: Props) {
  const data = participants.map((p, i) => ({
    name:   p.name ?? (ROLE_ABBREV[p.role] ?? p.role),
    role:   p.role,
    split:  p.paymentSplit,
    amount: totalAmount ? Math.round((totalAmount * p.paymentSplit) / 100) : undefined,
    fill:   COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={Math.max(80, data.length * 56)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
        >
          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`}
            tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={80}
            tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="split" radius={[0, 6, 6, 0]} maxBarSize={32} label={{
            position: 'right', formatter: (v: number) => `${v}%`,
            fill: '#94A3B8', fontSize: 11,
          }}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
