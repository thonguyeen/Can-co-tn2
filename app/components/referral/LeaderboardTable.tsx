'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LeaderboardEntry } from './LeaderboardTopCards'
import styles from '@/styles/referral.module.css'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col divide-y divide-border">
      {entries.map((entry) => {
        const isCurrentUser = currentUserId && entry.userId === currentUserId
        
        return (
          <div 
            key={entry.userId} 
            className={`p-4 flex items-center gap-3 transition-colors ${isCurrentUser ? styles.highlightRow : 'hover:bg-secondary/20'}`}
          >
            <div className="w-6 text-center font-bold text-muted-foreground text-sm">
              {isCurrentUser ? <span className="text-primary text-base">★</span> : `#${entry.rank}`}
            </div>

            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={entry.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {entry.username ? entry.username.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="font-medium text-[15px] truncate text-foreground flex items-center gap-2">
                {entry.username} {isCurrentUser && <span className="text-xs bg-primary text-primary-foreground px-1.5 rounded-sm">Bạn</span>}
              </div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">
                Hạng {entry.levelName}
              </div>
            </div>
            
            <div className="flex-shrink-0 font-mono font-semibold text-foreground bg-secondary px-2.5 py-1 rounded-md text-sm shadow-sm border border-border/50">
              {entry.points} <span className="text-[10px] text-muted-foreground font-sans">điểm</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
