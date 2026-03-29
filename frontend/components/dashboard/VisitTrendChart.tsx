'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VisitTrend } from '@/lib/dashboard'

export default function VisitTrendChart({ data }: { data: VisitTrend[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <defs>
          <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00bd8e" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00bd8e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#0a1e52',
          }}
        />
        <Area
          type="monotone"
          dataKey="visits"
          name="Visits"
          stroke="#00bd8e"
          strokeWidth={2}
          fill="url(#tealGradient)"
          dot={{ r: 3, fill: '#00bd8e', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#00bd8e' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
