'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Clock, CheckCircle2, XCircle, Package } from 'lucide-react'

export interface RedemptionItem {
  id: string
  rewardLabel: string
  pointsCost: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED'
  createdAt: string
  adminNote?: string | null
}

interface RedemptionHistoryProps {
  redemptions: RedemptionItem[]
}

export function RedemptionHistory({ redemptions }: RedemptionHistoryProps) {
  if (!redemptions || redemptions.length === 0) return null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Đang xử lý', className: 'text-yellow-500 bg-yellow-500/10', icon: Clock }
      case 'APPROVED':
        return { label: 'Đã duyệt', className: 'text-blue-500 bg-blue-500/10', icon: CheckCircle2 }
      case 'FULFILLED':
        return { label: 'Đã giao', className: 'text-green-500 bg-green-500/10', icon: Package }
      case 'REJECTED':
        return { label: 'Từ chối (Đã hoàn điểm)', className: 'text-red-500 bg-red-500/10', icon: XCircle }
      default:
        return { label: status, className: 'text-muted-foreground bg-secondary', icon: Clock }
    }
  }

  return (
    <div className="mt-8 mb-8">
      <h3 className="font-semibold text-lg mb-4">Lịch sử đổi quà</h3>
      
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col divide-y divide-border">
        {redemptions.map((item) => {
          const statusConfig = getStatusConfig(item.status)
          const StatusIcon = statusConfig.icon
          
          return (
            <div key={item.id} className="p-4 flex flex-col gap-2 hover:bg-secondary/20 transition-colors">
              <div className="flex justify-between items-start">
                <div className="font-medium text-[15px] text-foreground">
                  {item.rewardLabel}
                </div>
                <div className="font-mono text-sm font-semibold text-muted-foreground bg-secondary px-2 rounded">
                  -{item.pointsCost} đ
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusConfig.className}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ''}
                </span>
              </div>
              
              {item.adminNote && (
                <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md mt-1 italic border border-border/50">
                  Phản hồi: {item.adminNote}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
