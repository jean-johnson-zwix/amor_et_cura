'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts'

export default function VisitTrendChart({ data }: { data: { date: string; visits: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-base text-[#9ca3af]">No visits recorded yet.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          labelStyle={{ color: '#111827', fontWeight: 600 }}
          formatter={(value) => [value, 'Visits']}
        />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="#F2673C"
          strokeWidth={2.5}
          dot={<Dot r={4} fill="#F2673C" strokeWidth={0} />}
          activeDot={{ r: 6, fill: '#F2673C', strokeWidth: 2, stroke: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
