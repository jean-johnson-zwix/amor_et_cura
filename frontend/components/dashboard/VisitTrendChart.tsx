'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VisitTrend } from '@/lib/dashboard'

export default function VisitTrendChart({ data }: { data: VisitTrend[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-card)',
            color: 'var(--color-card-foreground)',
          }}
        />
        <Line
          type="monotone"
          dataKey="visits"
          name="Visits"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--color-primary)' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
