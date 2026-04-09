'use client'

import React from 'react'
import styles from '@/styles/referral.module.css'
import { Users, Coins, TrendingDown } from 'lucide-react'

interface StatsRowProps {
  totalReferrals: number
  points: number
  pointsSpent: number
}

export function StatsRow({ totalReferrals, points, pointsSpent }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
        <Users className="w-5 h-5 text-primary mb-1 opacity-80" />
        <div className={styles.statsNumber}>{totalReferrals}</div>
        <div className={styles.statsLabel}>Lượt mời</div>
      </div>
      
      <div className="bg-card border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
        {/* Glow effect cho điểm hiện tại */}
        <div className="absolute inset-x-0 -bottom-4 h-8 bg-primary/20 blur-xl"></div>
        <Coins className="w-5 h-5 text-yellow-500 mb-1 opacity-80 relative z-10" />
        <div className={`${styles.statsNumber} text-yellow-500 relative z-10`}>{points}</div>
        <div className={`${styles.statsLabel} relative z-10`}>Điểm dư</div>
      </div>

      <div className="bg-card border border-border p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
        <TrendingDown className="w-5 h-5 text-muted-foreground mb-1 opacity-60" />
        <div className={styles.statsNumber}>{pointsSpent}</div>
        <div className={styles.statsLabel}>Đã tiêu</div>
      </div>
    </div>
  )
}
