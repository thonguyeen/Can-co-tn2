'use client'

import React from 'react'
import { Crown } from 'lucide-react'
import styles from '@/styles/referral.module.css'

interface TierCardProps {
  tier: number
  tierName: string
  totalReferrals: number
  nextTierAt: number | string
}

export function TierCard({ tier, tierName, totalReferrals, nextTierAt }: TierCardProps) {
  let progressPercent = 100
  if (typeof nextTierAt === 'number' && nextTierAt > 0) {
    // Để ý: tiến trình là tính từ lúc bắt đầu 0 tới nextTierAt, hoặc từ tier threshold hiện tại?
    // Cho đơn giản, sẽ lấy totalReferrals / nextTierAt 
    progressPercent = Math.min(100, Math.round((totalReferrals / nextTierAt) * 100))
  }

  // Lấy style động dựa trên tier
  let badgeClass = styles.tierDong
  if (tier === 2) badgeClass = styles.tierBac
  else if (tier === 3) badgeClass = styles.tierVang
  else if (tier === 4) badgeClass = styles.tierBachKim
  else if (tier === 5) badgeClass = styles.tierKimCuong

  return (
    <div className={styles.section}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">CẤP ĐỘ HIỆN TẠI</div>
          <div className={`${styles.tierBadgeCore} ${badgeClass}`}>
            <Crown className="w-3 h-3" />
            Hạng {tierName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Đã giới thiệu</div>
          <div className="font-medium text-lg text-foreground bg-accent/30 px-2 rounded-md">
            {totalReferrals} <span className="text-sm text-muted-foreground font-normal">người</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Tiến trình thăng hạng</span>
          <span>{typeof nextTierAt === 'number' ? `${totalReferrals} / ${nextTierAt}` : 'MAX'}</span>
        </div>
        <div className="w-full bg-border/50 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        {typeof nextTierAt === 'number' && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Còn <span className="font-medium text-foreground">{nextTierAt - totalReferrals} lượt</span> nữa để lên Cấp tiếp theo
          </p>
        )}
      </div>
    </div>
  )
}
