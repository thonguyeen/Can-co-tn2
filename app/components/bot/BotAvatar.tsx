'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Bot } from '@/lib/types'

interface BotAvatarProps {
  bot: Bot
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

export function BotAvatar({ bot, size = 'md', className }: BotAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={bot.avatar_url || undefined} alt={bot.name} />
      <AvatarFallback
        className="text-white font-medium"
        style={{ backgroundColor: bot.color_accent || '#1877F2' }}
      >
        {bot.name[0]}
      </AvatarFallback>
    </Avatar>
  )
}
