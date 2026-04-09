'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, ChevronRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRelativeTime } from '@/lib/utils/time'

interface BreakingItem {
  id: string
  post_id: string
  headline: string
  summary: string
  urgency_level: string
  category: string
  is_active: boolean
  expires_at: string
  created_at: string
}

interface BreakingBannerProps {
  items?: BreakingItem[]
  onDismiss?: (id: string) => void
}

const URGENCY_STYLES = {
  critical: {
    bg: 'bg-red-500/10 border-red-500/30',
    icon: 'text-red-500',
    badge: 'bg-red-500 text-white',
    pulse: 'animate-pulse',
  },
  high: {
    bg: 'bg-orange-500/10 border-orange-500/30',
    icon: 'text-orange-500',
    badge: 'bg-orange-500 text-white',
    pulse: '',
  },
  medium: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: 'text-yellow-500',
    badge: 'bg-yellow-500 text-black',
    pulse: '',
  },
  low: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: 'text-blue-500',
    badge: 'bg-blue-500 text-white',
    pulse: '',
  },
}

export function BreakingBanner({ items = [], onDismiss }: BreakingBannerProps) {
  const [visibleItems, setVisibleItems] = useState<BreakingItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const active = items.filter(item =>
      item.is_active && new Date(item.expires_at).getTime() > Date.now()
    )
    setVisibleItems(active)
    if (currentIndex >= active.length) {
      setCurrentIndex(0)
    }
  }, [items, currentIndex])

  // Auto-rotate through breaking items
  useEffect(() => {
    if (visibleItems.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % visibleItems.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [visibleItems.length])

  if (visibleItems.length === 0) return null

  const current = visibleItems[currentIndex]
  const style = URGENCY_STYLES[current.urgency_level as keyof typeof URGENCY_STYLES] || URGENCY_STYLES.low

  const handleDismiss = (id: string) => {
    setVisibleItems(prev => prev.filter(item => item.id !== id))
    onDismiss?.(id)
  }

  return (
    <div className={`border rounded-lg p-3 mb-4 ${style.bg} ${style.pulse}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 mt-0.5 ${style.icon}`}>
          {current.urgency_level === 'critical' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${style.badge}`}>
              Tin nóng
            </span>
            <span className="text-xs text-muted-foreground">
              {getRelativeTime(current.created_at)}
            </span>
            {visibleItems.length > 1 && (
              <span className="text-xs text-muted-foreground">
                ({currentIndex + 1}/{visibleItems.length})
              </span>
            )}
          </div>

          <Link href={`/demo/post/${current.post_id}`} className="group">
            <h3 className="text-sm font-semibold leading-tight group-hover:underline">
              {current.headline}
            </h3>
            {current.summary && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {current.summary}
              </p>
            )}
          </Link>

          {/* Read more */}
          <Link
            href={`/demo/post/${current.post_id}`}
            className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] hover:underline mt-1.5"
          >
            Xem chi tiết
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 w-6 h-6 rounded-full"
          onClick={() => handleDismiss(current.id)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Dot indicators for multiple items */}
      {visibleItems.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {visibleItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-foreground' : 'bg-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
