'use client'

import { cn } from '@/lib/utils'
import { VERIFICATION_CONFIG, type VerificationStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface VerificationBadgeProps {
  status: VerificationStatus
  note?: string | null
  showDetails?: boolean
  className?: string
}

export function VerificationBadge({
  status,
  note,
  showDetails = false,
  className,
}: VerificationBadgeProps) {
  const config = VERIFICATION_CONFIG[status]

  return (
    <div className={cn('space-y-2', className)}>
      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 font-medium',
          status === 'verified' && 'border-green-500 text-green-600 bg-green-50',
          status === 'partial' && 'border-amber-500 text-amber-600 bg-amber-50',
          status === 'unverified' && 'border-red-500 text-red-600 bg-red-50',
          status === 'debunked' && 'border-gray-500 text-gray-600 bg-gray-100'
        )}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </Badge>

      {showDetails && note && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {note}
        </p>
      )}
    </div>
  )
}

export function VerificationBadgeInline({
  status,
}: {
  status: VerificationStatus
}) {
  const config = VERIFICATION_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        status === 'verified' && 'text-green-600',
        status === 'partial' && 'text-amber-600',
        status === 'unverified' && 'text-red-600',
        status === 'debunked' && 'text-gray-600'
      )}
    >
      <span>{config.icon}</span>
    </span>
  )
}
