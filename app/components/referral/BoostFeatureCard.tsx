'use client'

import React from 'react'
import { Rocket, Coins } from 'lucide-react'
import { BOOST_POINTS_COST, BOOST_DURATION_HOURS } from '@/lib/referral/constants'

interface BoostFeatureCardProps {
  userPoints: number
  onBoost: () => void
}

export function BoostFeatureCard({ userPoints, onBoost }: BoostFeatureCardProps) {
  const canAfford = userPoints >= BOOST_POINTS_COST

  return (
    <div className="bg-gradient-to-br from-card to-[#1B4D3E]/10 border border-border rounded-xl p-5 shadow-sm relative overflow-hidden mb-6">
      {/* Decorative bg element */}
      <div className="absolute -right-6 -top-6 text-[#1B4D3E]/5 transform rotate-12">
        <Rocket className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Đẩy bài TOP {BOOST_DURATION_HOURS}H
          </h3>
          <div className="flex items-center gap-1 font-mono font-bold text-yellow-500 bg-background/80 px-2 py-1 rounded-md border border-border">
            {BOOST_POINTS_COST}
            <Coins className="w-4 h-4" />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 max-w-[280px]">
          Sử dụng điểm để ghim bài đăng (cần / có) của bạn lên trang chủ tìm kiếm. Ưu tiên tiếp cận hàng ngàn người dùng!
        </p>

        <button
          onClick={onBoost}
          disabled={!canAfford}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            canAfford 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-secondary text-muted-foreground cursor-not-allowed'
          }`}
        >
          Chọn bài để đẩy ngay
        </button>
      </div>
    </div>
  )
}
