'use client'

import React from 'react'
import { Coins, Gift } from 'lucide-react'
import Image from 'next/image'

export interface RewardItem {
  id: string
  label: string
  description?: string | null
  pointsCost: number
  stock?: number | null
  imageUrl?: string | null
}

interface RewardCardProps {
  reward: RewardItem
  userPoints: number
  onRedeem: (reward: RewardItem) => void
}

export function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const canAfford = userPoints >= reward.pointsCost
  const outOfStock = reward.stock !== null && reward.stock <= 0

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group relative">
      {/* Cửa sổ báo Hết hàng */}
      {outOfStock && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
          <div className="bg-background/90 text-foreground border border-border px-4 py-2 rounded-lg font-bold text-sm shadow-xl transform -rotate-12">
            HẾT HÀNG
          </div>
        </div>
      )}

      {/* Product Image Area */}
      <div className="aspect-square bg-secondary/30 relative flex items-center justify-center p-4">
        {reward.imageUrl ? (
          <Image 
            src={reward.imageUrl} 
            alt={reward.label} 
            fill 
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Gift className="w-16 h-16 text-muted-foreground/30" />
        )}
        
        {/* Cost Badge */}
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-border/50">
          <span className="font-mono font-bold text-sm">{reward.pointsCost}</span>
          <Coins className="w-3.5 h-3.5 text-yellow-500" />
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3 flex flex-col flex-1">
        <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight mb-1">
          {reward.label}
        </h4>
        {reward.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {reward.description}
          </p>
        )}
        
        <div className="mt-auto">
          <button
            onClick={() => onRedeem(reward)}
            disabled={!canAfford || outOfStock}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
              canAfford && !outOfStock
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
            }`}
          >
            Đổi ngay
          </button>
        </div>
      </div>
    </div>
  )
}
