'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import styles from '@/styles/referral.module.css'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatarUrl?: string
  points: number
  level: number
  levelName: string
  levelIcon: string
}

interface LeaderboardTopCardsProps {
  top3: LeaderboardEntry[]
}

export function LeaderboardTopCards({ top3 }: LeaderboardTopCardsProps) {
  if (!top3 || top3.length === 0) return null

  // Reorder to: 2nd, 1st, 3rd for podium effect (if we have at least 2)
  const rank1 = top3.find(e => e.rank === 1)
  const rank2 = top3.find(e => e.rank === 2)
  const rank3 = top3.find(e => e.rank === 3)

  const PodiumCard = ({ entry, isFirst }: { entry?: LeaderboardEntry, isFirst?: boolean }) => {
    if (!entry) return <div className="flex-1 opacity-0 pointer-events-none"></div>

    const rankClass = isFirst ? styles.rankCircle1st : entry.rank === 2 ? styles.rankCircle2nd : styles.rankCircle3rd
    const cardClass = isFirst ? `${styles.eliteCard} ${styles.eliteCard1st}` : styles.eliteCard
    
    return (
      <div className={cardClass}>
        <div className={`${styles.rankCircle} ${rankClass}`}>
          {entry.rank}
        </div>
        
        <Avatar className={`${isFirst ? 'w-16 h-16' : 'w-12 h-12'} mb-1 mt-2 border-2 border-background shadow-md`}>
          <AvatarImage src={entry.avatarUrl || undefined} />
          <AvatarFallback className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            {entry.username ? entry.username.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="w-full">
          <div className="font-semibold text-foreground truncate text-sm">
            {entry.username}
          </div>
          <div className="text-[11px] text-muted-foreground truncate uppercase tracking-wider mb-2">
             Hạng {entry.levelName}
          </div>
          <div className="bg-secondary/50 rounded-md py-1 font-mono text-xs font-bold text-primary">
            {entry.points} đ
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end justify-center gap-2 mb-6 mt-4">
      <PodiumCard entry={rank2} />
      <PodiumCard entry={rank1} isFirst={true} />
      <PodiumCard entry={rank3} />
    </div>
  )
}
