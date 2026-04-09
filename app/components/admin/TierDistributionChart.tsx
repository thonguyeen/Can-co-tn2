'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import s from '@/styles/admin.module.css'

const TIER_COLORS = ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2', '#B9F2FF']
const TIER_EMOJI = ['🥉', '🥈', '🥇', '💠', '💎']

interface TierData {
  tier: number
  tierName: string
  count: number
}

interface Props {
  data: TierData[]
  total: number
}

export default function TierDistributionChart({ data, total }: Props) {
  const chartData = data.map(d => ({
    name: d.tierName,
    value: d.count,
    tier: d.tier
  }))

  return (
    <div>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.tier} fill={TIER_COLORS[index]} fillOpacity={0.8} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={s.pieLegend}>
        {data.map((item, i) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
          return (
            <div key={item.tier} className={s.pieLegendItem}>
              <span className={s.pieLegendDot} style={{ background: TIER_COLORS[i] }} />
              <span>{TIER_EMOJI[i]} {item.tierName}</span>
              <span className={s.pieLegendValue}>{item.count} ({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
