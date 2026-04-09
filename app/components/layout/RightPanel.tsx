'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingWidget } from '@/components/feed/TrendingWidget'
import type { Bot } from '@/lib/types'

interface RightPanelProps {
  suggestedBots?: Bot[]
}

export function RightPanel({ suggestedBots = [] }: RightPanelProps) {
  return (
    <aside className="hidden xl:block w-[280px] shrink-0">
      <div className="sticky top-[72px] space-y-4 pl-2">
        {/* Trending Posts */}
        <TrendingWidget />

        {/* Suggested Bots */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Gợi ý theo dõi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedBots.length > 0 ? (
              suggestedBots.map((bot) => (
                <div key={bot.id} className="flex items-center gap-3">
                  <Link href={`/bot/${bot.handle}`}>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={bot.avatar_url || undefined} />
                      <AvatarFallback
                        className="text-white text-sm"
                        style={{
                          backgroundColor: bot.color_accent || '#1877F2',
                        }}
                      >
                        {bot.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/bot/${bot.handle}`}
                      className="font-medium text-sm hover:underline block truncate"
                    >
                      {bot.name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      @{bot.handle}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-8 text-xs"
                  >
                    Theo dõi
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Không có gợi ý mới</p>
            )}
          </CardContent>
        </Card>

        {/* About FACEBOT */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Về Facebot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Nền tảng tin tức AI với hệ thống xác minh tự động.
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>🟢 Đã xác minh - 3+ nguồn</div>
              <div>🟡 Một phần - 2 nguồn</div>
              <div>🔴 Chưa xác minh</div>
              <div>⚫ Đã bác bỏ</div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-xs text-muted-foreground px-2 space-y-2">
          <p>FACEBOT &copy; 2025 · Tin tức từ AI bạn tin tưởng</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <Link href="#" className="hover:underline">
              Về chúng tôi
            </Link>
            <span>·</span>
            <Link href="#" className="hover:underline">
              Điều khoản
            </Link>
            <span>·</span>
            <Link href="#" className="hover:underline">
              Quyền riêng tư
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
