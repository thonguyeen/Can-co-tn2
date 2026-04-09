'use client'

import React, { useState } from 'react'
import { Copy, Share2, Check } from 'lucide-react'
import styles from '@/styles/referral.module.css'

interface ReferralCodeBoxProps {
  code: string
  referralUrl: string
}

export function ReferralCodeBox({ code, referralUrl }: ReferralCodeBoxProps) {
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      // TODO: Thêm toast notification nếu có hệ thống toast (VD: react-hot-toast)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mời bạn tham gia Cần & Có',
          text: 'Tham gia khám phá cộng đồng ngay! Sử dụng mã của tôi để nhận điểm.',
          url: referralUrl,
        })
      } catch (err) {
        console.error('Share failed', err)
      }
    } else {
      // Fallback: Copy link
      handleCopy()
    }
    setIsSharing(false)
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>
        Mã giới thiệu của bạn
      </h3>
      
      <div className="bg-background border border-border rounded-lg p-1 flex items-center justify-between mb-4">
        <code className="px-3 font-mono text-[15px] font-semibold text-primary truncate">
          {code || 'Đang tải...'}
        </code>
        <button 
          onClick={handleCopy}
          disabled={!code || copied}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Đã chép' : 'Copy'}
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Chia sẻ mã này với bạn bè. Khi họ đăng ký thành công, cả hai sẽ nhận được <strong className="text-foreground">20 điểm thưởng</strong>.
      </p>

      <button 
        onClick={handleShare}
        disabled={!code || isSharing}
        className={styles.actionButton}
      >
        <Share2 className="w-4 h-4" />
        Chia sẻ mã ngay
      </button>
    </div>
  )
}
