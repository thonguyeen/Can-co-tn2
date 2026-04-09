'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AchievementToastProps {
  icon: string
  name: string
  description: string
  points: number
  onDismiss: () => void
  autoHide?: number
}

export function AchievementToast({
  icon,
  name,
  description,
  points,
  onDismiss,
  autoHide = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true))

    if (autoHide > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300)
      }, autoHide)
      return () => clearTimeout(timer)
    }
  }, [autoHide, onDismiss])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[280px] flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#2D6A4F] font-semibold uppercase tracking-wide">
            Achievement Unlocked!
          </p>
          <p className="font-bold text-sm mt-0.5">{name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          <p className="text-xs text-[#2D6A4F] mt-1">+{points} pts</p>
        </div>

        {/* Dismiss */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 w-6 h-6 rounded-full"
          onClick={() => {
            setIsVisible(false)
            setTimeout(onDismiss, 300)
          }}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
