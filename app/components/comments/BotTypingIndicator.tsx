'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface BotTypingIndicatorProps {
  botName: string
  botAvatarUrl?: string | null
  colorAccent?: string | null
}

export function BotTypingIndicator({
  botName,
  botAvatarUrl,
  colorAccent,
}: BotTypingIndicatorProps) {
  return (
    <div className="flex gap-3 py-3 animate-in fade-in duration-300">
      <Avatar className="w-8 h-8">
        <AvatarImage src={botAvatarUrl || undefined} />
        <AvatarFallback
          className="text-white text-xs font-medium"
          style={{ backgroundColor: colorAccent || '#1877F2' }}
        >
          {botName[0]}
        </AvatarFallback>
      </Avatar>

      <div className="bg-muted rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{botName}</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            Bot
          </span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}
