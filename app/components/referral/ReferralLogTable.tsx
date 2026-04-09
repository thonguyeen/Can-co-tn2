'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users } from 'lucide-react'

export interface ReferralLog {
  id: string
  refereeName: string
  refereeAvatar?: string | null
  pointsAwarded: number
  createdAt: string
}

interface ReferralLogTableProps {
  logs: ReferralLog[]
  total: number
  page: number
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
}

export function ReferralLogTable({ logs, total, page, hasMore, isLoading, onLoadMore }: ReferralLogTableProps) {
  if (logs.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card border border-border rounded-xl shadow-sm mt-6 mb-6">
        <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-lg font-medium">Bạn chưa mời ai</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          Hãy chia sẻ mã giới thiệu để nhận 20 điểm thưởng cho mỗi lượt cài đặt mới nhé!
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
        <span>Người bạn đã mời</span>
        <span className="text-sm font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
          {total} người
        </span>
      </h3>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col divide-y divide-border">
        {logs.map((log) => (
          <div key={log.id} className="p-4 flex items-center gap-3 hover:bg-secondary/20 transition-colors">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={log.refereeAvatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {log.refereeName ? log.refereeName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[15px] truncate text-foreground">{log.refereeName}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: vi }) : 'Gần đây'}
              </div>
            </div>
            
            <div className="flex-shrink-0 font-medium text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full text-xs">
              +{log.pointsAwarded}đ
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="p-3 text-center">
            <button 
              onClick={onLoadMore} 
              disabled={isLoading}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {isLoading ? 'Đang tải...' : 'Xem thêm'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
