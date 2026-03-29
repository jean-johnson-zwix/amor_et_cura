'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { ServiceBreakdown } from '@/lib/dashboard'

const BRAND_COLORS = ['#00bd8e', '#eb3690', '#3960a3', '#7b3fa8', '#f59e0b', '#0ea5e9']

export default function ServiceBreakdownChart({ data }: { data: ServiceBreakdown[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 56 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          angle={-35}
          textAnchor="end"
          interval={0}
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
          cursor={{ fill: '#f4fbf9' }}
        />
        <Bar dataKey="count" name="Visits" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
