'use client'

import { useState, useEffect, useCallback } from 'react'
import s from '@/styles/admin.module.css'
import ReferralGrowthChart from '@/components/admin/ReferralGrowthChart'
import TierDistributionChart from '@/components/admin/TierDistributionChart'
import PendingRedemptionList from '@/components/admin/PendingRedemptionList'

interface ReferralStats {
  summary: {
    totalReferralsToday: number
    totalReferralsThisMonth: number
    totalReferralsAllTime: number
  }
  tierDistribution: { tier: number; tierName: string; count: number }[]
  topReferrers: { id: string; name: string; avatarUrl: string | null; totalReferrals: number; tier: number; tierName: string }[]
  dailyStats: { date: string; count: number }[]
}

export default function AdminReferralTab() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/referrals')
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json: ReferralStats = await res.json()
      setStats(json)
    } catch (err) {
      console.error('[AdminReferralTab]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--wm-text-dim)' }}>
        <div style={{ fontSize: 14 }}>Đang tải thống kê...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={s.emptyState}>
        <div className={s.emptyIcon}>📊</div>
        <div className={s.emptyText}>Không thể tải dữ liệu thống kê</div>
      </div>
    )
  }

  const vipCount = stats.tierDistribution.find(t => t.tier === 5)?.count ?? 0
  const totalUsers = stats.tierDistribution.reduce((sum, t) => sum + t.count, 0)

  return (
    <div>
      {/* Header */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--wm-text)', marginBottom: 20 }}>
        📊 Tổng Quan Referral
      </h2>

      {/* Summary Cards */}
      <div className={s.summaryGrid}>
        <div className={s.summaryCard}>
          <div className={s.summaryIcon}>📅</div>
          <div className={s.summaryValue}>{stats.summary.totalReferralsToday}</div>
          <div className={s.summaryLabel}>Hôm nay</div>
        </div>
        <div className={s.summaryCard}>
          <div className={s.summaryIcon}>📆</div>
          <div className={s.summaryValue}>{stats.summary.totalReferralsThisMonth.toLocaleString()}</div>
          <div className={s.summaryLabel}>Tháng này</div>
        </div>
        <div className={s.summaryCard}>
          <div className={s.summaryIcon}>🌍</div>
          <div className={s.summaryValue}>{stats.summary.totalReferralsAllTime.toLocaleString()}</div>
          <div className={s.summaryLabel}>Tổng cộng</div>
        </div>
        <div className={s.summaryCard}>
          <div className={s.summaryIcon}>💎</div>
          <div className={s.summaryValue}>{vipCount}</div>
          <div className={s.summaryLabel}>Kim Cương VIP</div>
        </div>
      </div>

      {/* Charts */}
      <div className={s.chartsGrid}>
        <div className={s.chartPanel}>
          <div className={s.chartTitle}>📈 Tăng Trưởng 30 Ngày</div>
          <ReferralGrowthChart data={stats.dailyStats} />
        </div>
        <div className={s.chartPanel}>
          <div className={s.chartTitle}>💎 Phân Bố Hạng</div>
          <TierDistributionChart data={stats.tierDistribution} total={totalUsers} />
        </div>
      </div>

      {/* Pending Redemptions */}
      <PendingRedemptionList />
    </div>
  )
}
