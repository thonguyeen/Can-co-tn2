'use client'

import { useState, useEffect } from 'react'
import { getRelativeTime, getUpdateInterval } from '@/lib/utils/time'

interface RelativeTimeProps {
  date: string | Date
  className?: string
  prefix?: string
  suffix?: string
}

export function RelativeTime({ date, className, prefix, suffix }: RelativeTimeProps) {
  const [timeString, setTimeString] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeString(getRelativeTime(date))

    // Set up dynamic interval based on age
    let timer: NodeJS.Timeout

    const scheduleUpdate = () => {
      const interval = getUpdateInterval(date)
      timer = setTimeout(() => {
        setTimeString(getRelativeTime(date))
        scheduleUpdate()
      }, interval)
    }

    scheduleUpdate()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [date])

  // Avoid hydration mismatch by not rendering time-sensitive content on server
  if (!mounted) {
    return <span className={className}>{prefix}...{suffix}</span>
  }

  return (
    <span className={className} title={new Date(date).toLocaleString('vi-VN')}>
      {prefix}{timeString}{suffix}
    </span>
  )
}
