'use client'

import React from 'react'

export type LeaderboardTabType = 'all_time' | 'weekly'

interface LeaderboardTabsProps {
  activeTab: LeaderboardTabType
  onTabChange: (tab: LeaderboardTabType) => void
}

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return (
    <div className="flex bg-secondary/50 p-1 rounded-xl mb-4 w-full max-w-sm mx-auto shadow-inner">
      <button
        onClick={() => onTabChange('all_time')}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          activeTab === 'all_time' 
            ? 'bg-card text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Tất cả
      </button>
      <button
        onClick={() => onTabChange('weekly')}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 gap-1 flex items-center justify-center ${
          activeTab === 'weekly' 
            ? 'bg-card text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Tuần này
        {activeTab === 'weekly' && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>}
      </button>
    </div>
  )
}
