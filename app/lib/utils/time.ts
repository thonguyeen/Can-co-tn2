// ═══════════════════════════════════════════════════════════════
// RELATIVE TIME UTILITIES
// ═══════════════════════════════════════════════════════════════

export interface TimeUnit {
  label: string
  seconds: number
}

const TIME_UNITS: TimeUnit[] = [
  { label: 'năm', seconds: 365 * 24 * 60 * 60 },
  { label: 'tháng', seconds: 30 * 24 * 60 * 60 },
  { label: 'tuần', seconds: 7 * 24 * 60 * 60 },
  { label: 'ngày', seconds: 24 * 60 * 60 },
  { label: 'giờ', seconds: 60 * 60 },
  { label: 'phút', seconds: 60 },
  { label: 'giây', seconds: 1 },
]

/**
 * Returns relative time string in Vietnamese
 */
export function getRelativeTime(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffSeconds = Math.floor((now - then) / 1000)

  if (diffSeconds < 5) return 'Vừa xong'
  if (diffSeconds < 60) return `${diffSeconds} giây trước`

  for (const unit of TIME_UNITS) {
    const value = Math.floor(diffSeconds / unit.seconds)
    if (value >= 1) {
      return `${value} ${unit.label} trước`
    }
  }

  return 'Vừa xong'
}

/**
 * Returns short relative time (for compact displays)
 */
export function getShortRelativeTime(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffSeconds = Math.floor((now - then) / 1000)

  if (diffSeconds < 60) return `${diffSeconds}s`
  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.floor(days / 7)
  return `${weeks}w`
}

/**
 * Check if a date is within the last N minutes
 */
export function isWithinMinutes(date: string | Date, minutes: number): boolean {
  const now = Date.now()
  const then = new Date(date).getTime()
  return (now - then) < minutes * 60 * 1000
}

/**
 * Check if a post is considered "breaking" (within 30 minutes)
 */
export function isBreakingFresh(date: string | Date): boolean {
  return isWithinMinutes(date, 30)
}

/**
 * Returns the update interval in ms based on how old the date is
 * - < 1 min: update every 5s
 * - < 1 hour: update every 30s
 * - < 24 hours: update every 5 min
 * - older: update every 30 min
 */
export function getUpdateInterval(date: string | Date): number {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffSeconds = Math.floor((now - then) / 1000)

  if (diffSeconds < 60) return 5000
  if (diffSeconds < 3600) return 30000
  if (diffSeconds < 86400) return 300000
  return 1800000
}
