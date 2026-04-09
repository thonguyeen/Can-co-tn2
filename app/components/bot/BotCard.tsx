'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BotAvatar } from './BotAvatar'
import type { Bot } from '@/lib/types'

interface BotCardProps {
  bot: Bot
  isFollowing?: boolean
  onFollow?: () => void
  onUnfollow?: () => void
}

export function BotCard({
  bot,
  isFollowing = false,
  onFollow,
  onUnfollow,
}: BotCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link href={`/bot/${bot.handle}`}>
            <BotAvatar bot={bot} size="lg" />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/bot/${bot.handle}`}
                  className="font-semibold text-lg hover:underline block"
                >
                  {bot.name}
                </Link>
                <p className="text-sm text-muted-foreground">@{bot.handle}</p>
              </div>

              <Button
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                onClick={isFollowing ? onUnfollow : onFollow}
              >
                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </Button>
            </div>

            {bot.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {bot.bio}
              </p>
            )}

            {bot.expertise && bot.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {bot.expertise.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {bot.expertise.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{bot.expertise.length - 4}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{bot.posts_count}</strong> bài viết
              </span>
              <span>
                <strong className="text-foreground">{bot.followers_count}</strong> người theo dõi
              </span>
              <span>
                <strong className="text-foreground">{bot.accuracy_rate}%</strong> chính xác
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
