'use client'

import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
  className?: string
  showLabel?: boolean
}

export function StreakBadge({ streak, className = '', showLabel = true }: StreakBadgeProps) {
  if (streak <= 0) return null

  const getFireLevel = () => {
    if (streak >= 100) return { color: 'text-purple-500', bg: 'bg-purple-500/10' }
    if (streak >= 30) return { color: 'text-red-500', bg: 'bg-red-500/10' }
    if (streak >= 7) return { color: 'text-orange-500', bg: 'bg-orange-500/10' }
    return { color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
  }

  const { color, bg } = getFireLevel()

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${bg} ${className}`}>
      <Flame className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-xs font-bold ${color}`}>{streak}</span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">ngay</span>
      )}
    </div>
  )
}
