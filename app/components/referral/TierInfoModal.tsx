'use client'

import React from 'react'
import { Crown, X } from 'lucide-react'

interface TierInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

const TIERS = [
  { name: 'Đồng', referrals: 0, benefits: 'Cơ bản', color: 'text-[#EAA676]', bg: 'bg-[#EAA676]/10' },
  { name: 'Bạc', referrals: 3, benefits: '+20% Điểm', color: 'text-[#E0E0E0]', bg: 'bg-[#E0E0E0]/10' },
  { name: 'Vàng', referrals: 10, benefits: '+50% Điểm', color: 'text-[#FFDF00]', bg: 'bg-[#FFDF00]/10' },
  { name: 'Bạch Kim', referrals: 30, benefits: '+100% Điểm', color: 'text-[#F5F5DC]', bg: 'bg-[#F5F5DC]/10' },
  { name: 'Kim Cương', referrals: 100, benefits: '+200% Điểm', color: 'text-[#B9F2FF]', bg: 'bg-[#B9F2FF]/10' }
]

export function TierInfoModal({ isOpen, onClose }: TierInfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Hệ Thống Cấp Bậc
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <p className="text-sm text-muted-foreground mb-4">
            Mời bạn bè tham gia Cần & Có để tăng cấp bậc. Cấp càng cao, bạn càng nhận được nhiều điểm thưởng từ mọi hoạt động!
          </p>
          
          <div className="space-y-3">
            {TIERS.map((tier, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border border-border/50 ${tier.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`font-bold text-lg w-6 text-center ${tier.color}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className={`font-semibold ${tier.color}`}>Hạng {tier.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Cần {tier.referrals} lượt mời
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-0.5">Đặc quyền</div>
                  <div className="font-medium text-sm">{tier.benefits}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-border bg-secondary/30">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}
