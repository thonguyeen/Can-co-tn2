'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; count: number }[]
}

export default function ReferralGrowthChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }))

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReferral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3E4042" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#8A8D91', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#3E4042' }}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#8A8D91', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#242526',
              border: '1px solid #3E4042',
              borderRadius: 6,
              fontSize: 12,
              color: '#E4E6EB'
            }}
            labelFormatter={(label) => `Ngày ${label}`}
            formatter={(value) => [`${value} lượt`, 'Giới thiệu']}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2D6A4F"
            strokeWidth={2}
            fill="url(#colorReferral)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
