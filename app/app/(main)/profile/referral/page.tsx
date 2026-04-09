'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Info } from 'lucide-react'
import { TierCard } from '@/components/referral/TierCard'
import { StatsRow } from '@/components/referral/StatsRow'
import { ReferralCodeBox } from '@/components/referral/ReferralCodeBox'
import { ReferralLogTable, ReferralLog } from '@/components/referral/ReferralLogTable'
import { TierInfoModal } from '@/components/referral/TierInfoModal'
import styles from '@/styles/referral.module.css'

export default function ReferralDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isTierModalOpen, setIsTierModalOpen] = useState(false)

  // Data states
  const [stats, setStats] = useState<any>(null)
  const [codeData, setCodeData] = useState<any>(null)
  
  // Logs state
  const [logs, setLogs] = useState<ReferralLog[]>([])
  const [logTotal, setLogTotal] = useState(0)
  const [logPage, setLogPage] = useState(1)
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [hasMoreLogs, setHasMoreLogs] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, codeRes] = await Promise.all([
        fetch('/api/referral/stats'),
        fetch('/api/referral/code')
      ])

      if (!statsRes.ok || !codeRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const statsJson = await statsRes.json()
      const codeJson = await codeRes.json()

      setStats(statsJson)
      setCodeData(codeJson)

      // Fetch first page of logs
      await fetchLogs(1)
    } catch (err) {
      console.error(err)
      setError('Đã có lỗi xảy ra khi tải dữ liệu.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLogs = async (pageToFetch: number) => {
    try {
      setIsLogsLoading(true)
      const res = await fetch(`/api/referral/logs?page=${pageToFetch}&limit=10`)
      if (!res.ok) throw new Error('Failed to fetch logs')
      
      const data = await res.json()
      
      if (pageToFetch === 1) {
        setLogs(data.logs)
      } else {
        setLogs(prev => [...prev, ...data.logs])
      }
      
      setLogTotal(data.total)
      setLogPage(data.page)
      setHasMoreLogs(data.logs.length === data.limit)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLogsLoading(false)
    }
  }

  const handleLoadMoreLogs = () => {
    if (!isLogsLoading && hasMoreLogs) {
      fetchLogs(logPage + 1)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-secondary rounded-xl"></div>
          <div className="h-24 bg-secondary rounded-xl"></div>
          <div className="h-48 bg-secondary rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Giới Thiệu Bạn Bè</h1>
        <button 
          onClick={() => setIsTierModalOpen(true)}
          className="p-2 bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
          title="Thông tin cấp bậc"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <TierCard 
        tier={stats?.tier || 1}
        tierName={stats?.tierName || 'Đồng'}
        totalReferrals={stats?.totalReferrals || 0}
        nextTierAt={stats?.nextTierAt || '-'}
      />

      <StatsRow 
        totalReferrals={stats?.totalReferrals || 0}
        points={stats?.points || 0}
        pointsSpent={stats?.pointsSpent || 0}
      />

      <ReferralCodeBox 
        code={codeData?.code || ''}
        referralUrl={codeData?.referralUrl || ''}
      />

      <div className="flex gap-4 mt-2">
        <button 
          onClick={() => router.push('/rewards')}
          className="flex-1 bg-secondary text-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          🎁 Đổi quà
        </button>
        <button 
          onClick={() => router.push('/leaderboard')}
          className="flex-1 bg-secondary text-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          🏆 Bảng xếp hạng
        </button>
      </div>

      <ReferralLogTable 
        logs={logs}
        total={logTotal}
        page={logPage}
        hasMore={hasMoreLogs}
        isLoading={isLogsLoading}
        onLoadMore={handleLoadMoreLogs}
      />

      <TierInfoModal 
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
      />
    </div>
  )
}
