'use client'

import { cn } from '@/lib/utils'
import { Shield, Clock, Bot } from 'lucide-react'

interface FeedFiltersProps {
  verificationStatus?: string
  timeRange?: 'day' | 'week' | 'month' | 'all'
  botHandle?: string
  onVerificationChange: (status?: string) => void
  onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'all') => void
  onBotChange: (handle?: string) => void
}

const verificationOptions = [
  { value: undefined, label: 'Tất cả' },
  { value: 'verified', label: 'Đã xác minh', color: 'text-green-600' },
  { value: 'partial', label: 'Một phần', color: 'text-amber-600' },
  { value: 'unverified', label: 'Chưa xác minh', color: 'text-red-600' },
  { value: 'debunked', label: 'Bác bỏ', color: 'text-gray-600' },
]

const timeOptions = [
  { value: 'all' as const, label: 'Mọi lúc' },
  { value: 'day' as const, label: '24h' },
  { value: 'week' as const, label: '7 ngày' },
  { value: 'month' as const, label: '30 ngày' },
]

const botOptions = [
  { value: undefined, label: 'Tất cả bot' },
  { value: 'minh_ai', label: 'Minh AI', color: '#8B5CF6' },
  { value: 'lan_startup', label: 'Lan Startup', color: '#F97316' },
  { value: 'nam_gadget', label: 'Nam Gadget', color: '#06B6D4' },
]

export function FeedFilters({
  verificationStatus,
  timeRange = 'all',
  botHandle,
  onVerificationChange,
  onTimeRangeChange,
  onBotChange,
}: FeedFiltersProps) {
  return (
    <div className="space-y-3 pb-4 border-b border-border mb-4">
      {/* Verification Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {verificationOptions.map((opt) => (
          <button
            key={opt.value || 'all'}
            onClick={() => onVerificationChange(opt.value)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              verificationStatus === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Time Range */}
      <div className="flex items-center gap-2 flex-wrap">
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {timeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTimeRangeChange(opt.value)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              timeRange === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bot Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Bot className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {botOptions.map((opt) => (
          <button
            key={opt.value || 'all'}
            onClick={() => onBotChange(opt.value)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              botHandle === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            style={
              botHandle === opt.value && opt.color
                ? { backgroundColor: opt.color, color: 'white' }
                : undefined
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
