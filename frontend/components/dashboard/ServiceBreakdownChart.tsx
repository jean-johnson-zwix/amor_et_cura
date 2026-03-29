'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { ServiceBreakdown } from '@/lib/dashboard'

const COLORS = ['#00bd8e', '#eb3690', '#0a1e52', '#f59e0b', '#0ea5e9', '#7b3fa8', '#10b981', '#ef4444']

export default function ServiceBreakdownChart({ data }: { data: ServiceBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-base text-[#9ca3af]">No visits recorded yet.</p>
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            strokeWidth={2}
            stroke="#fff"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Visible legend — name + count + percentage */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
          return (
            <div key={item.name} className="flex items-center gap-2.5">
              <div
                className="h-3.5 w-3.5 shrink-0 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm text-[#374151] flex-1 truncate">{item.name}</span>
              <span className="text-sm font-bold text-navy tabular-nums">{pct}%</span>
              <span className="text-sm text-[#6b7280] tabular-nums">({item.count})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
