'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react'
import { LeaderboardTabs, LeaderboardTabType } from '@/components/referral/LeaderboardTabs'
import { LeaderboardTopCards, LeaderboardEntry } from '@/components/referral/LeaderboardTopCards'
import { LeaderboardTable } from '@/components/referral/LeaderboardTable'
import styles from '@/styles/referral.module.css'

export default function LeaderboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<LeaderboardTabType>('all_time')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Optionally fetch current user if needed to highlight row. 
    // We can get it from /api/auth/session or we passed it in some context.
    // For now we'll fetch stats to get current userId implicitly if we wanted to 
    // or we can rely on standard session. Wait, let's fetch session here.
    fetch('/api/auth/session').then(res => res.json()).then(session => {
      if (session?.user?.id) setCurrentUser(session.user)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/leaderboard?type=${activeTab}&limit=50`)
        if (!res.ok) throw new Error('Failed to fetch leaderboard')
        const data = await res.json()
        setEntries(data.entries || [])
      } catch (err) {
        console.error(err)
        setError('Đã có lỗi xảy ra khi tải bảng xếp hạng.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [activeTab])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className={styles.container}>
      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary rounded-full text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Bảng Xếp Hạng
        </h1>
      </div>

      <LeaderboardTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Đang rà soát vị trí...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Chưa có dữ liệu bảng xếp hạng.</div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LeaderboardTopCards top3={top3} />
          
          <div className="mt-8 mb-4 px-1 flex justify-between items-end">
            <h3 className="font-semibold text-lg">Xếp hạng khác</h3>
            {currentUser && !entries.some(e => e.userId === currentUser.id) && (
              <span className="text-xs text-muted-foreground mb-1">
                Bạn chưa lọt top 50
              </span>
            )}
          </div>
          
          <LeaderboardTable entries={rest} currentUserId={currentUser?.id} />
        </div>
      )}
    </div>
  )
}
