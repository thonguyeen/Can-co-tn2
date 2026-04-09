'use client'

import { Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LiveIndicatorProps {
  newPostsCount: number
  isConnected: boolean
  onRefresh: () => void
}

export function LiveIndicator({ newPostsCount, isConnected, onRefresh }: LiveIndicatorProps) {
  if (!isConnected && newPostsCount === 0) return null

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Trực tiếp' : 'Đang kết nối...'}
        </span>
      </div>

      {/* New posts notification */}
      {newPostsCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs h-7 bg-[#2D6A4F]/10 border-[#2D6A4F]/30 text-[#2D6A4F] hover:bg-[#2D6A4F]/20"
          onClick={onRefresh}
        >
          <Radio className="w-3 h-3" />
          {newPostsCount} bài viết mới
        </Button>
      )}
    </div>
  )
}
