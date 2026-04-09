'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Coins, Loader2 } from 'lucide-react'
import { RewardCard, RewardItem } from '@/components/referral/RewardCard'
import { BoostFeatureCard } from '@/components/referral/BoostFeatureCard'
import { ConfirmSpendModal } from '@/components/referral/ConfirmSpendModal'
import { RedemptionHistory, RedemptionItem } from '@/components/referral/RedemptionHistory'
import styles from '@/styles/referral.module.css'
import { BOOST_POINTS_COST } from '@/lib/referral/constants'

export default function RewardsPage() {
  const router = useRouter()
  
  // Data state
  const [points, setPoints] = useState(0)
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal logic state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'REDEEM' | 'BOOST' | null>(null)
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Message / Toast state (basic implementation)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, rewardsRes, historyRes] = await Promise.all([
        fetch('/api/referral/stats'),
        fetch('/api/rewards'),
        fetch('/api/rewards/my-redemptions')
      ])

      if (statsRes.ok) {
        const d = await statsRes.json()
        setPoints(d.points || 0)
      }
      if (rewardsRes.ok) {
        const d = await rewardsRes.json()
        setRewards(d.rewards || [])
      }
      if (historyRes.ok) {
        const d = await historyRes.json()
        setRedemptions(d.redemptions || [])
      }
    } catch (err) {
      console.error(err)
      setError('Đã có lỗi xảy ra khi tải dữ liệu.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleOpenRedeemModal = (reward: RewardItem) => {
    setModalType('REDEEM')
    setSelectedReward(reward)
    setIsModalOpen(true)
  }

  const handleOpenBoostModal = () => {
    setModalType('BOOST')
    setIsModalOpen(true)
  }

  const handleConfirm = async () => {
    if (modalType === 'REDEEM' && selectedReward) {
      await processRedeem(selectedReward.id)
    } else if (modalType === 'BOOST') {
      // In a full implementation, we'd open an Intent Selector.
      // For this spec, we just mock the selection or show a message.
      showMessage('Chức năng chọn bài để Đẩy đang được nâng cấp.', 'success')
      setIsModalOpen(false)
      // await processBoost(selectedIntentId)
    }
  }

  const processRedeem = async (rewardItemId: string) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardItemId })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra')
      }
      
      showMessage('🎉 Đã gửi đơn đổi quà thành công!', 'success')
      setIsModalOpen(false)
      
      // Update data immediately
      fetchData() // Re-fetch to update points, history, and stock
      router.refresh() // Tell NextJS to invalidate server cache if any
    } catch (err: any) {
      showMessage(err.message || 'Không thể đổi quà lúc này', 'error')
      // Note: We intentionally don't close modal on error so they can read it, or we could close it.
      setIsModalOpen(false) 
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-full text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Cửa Hàng Quà</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 shadow-sm">
          <span className="font-mono font-bold text-lg text-yellow-500">
            {isLoading ? '...' : points}
          </span>
          <Coins className="w-5 h-5 text-yellow-500" />
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 border font-medium flex items-center justify-center animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Đang tải cửa hàng...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <BoostFeatureCard 
            userPoints={points} 
            onBoost={handleOpenBoostModal} 
          />

          <h3 className="font-semibold text-lg mb-4">Quà Tặng</h3>
          {rewards.length === 0 ? (
            <div className="text-center py-10 bg-secondary/30 rounded-xl text-muted-foreground">
              Hiện chưa có quà. Vui lòng quay lại sau!
            </div>
          ) : (
            <div className={styles.grid2}>
              {rewards.map(reward => (
                <RewardCard 
                  key={reward.id} 
                  reward={reward} 
                  userPoints={points} 
                  onRedeem={handleOpenRedeemModal} 
                />
              ))}
            </div>
          )}

          <RedemptionHistory redemptions={redemptions} />
        </div>
      )}

      <ConfirmSpendModal 
        isOpen={isModalOpen}
        title={modalType === 'REDEEM' ? 'Xác nhận đổi quà' : 'Đẩy bài lên TOP'}
        description={
          modalType === 'REDEEM' 
            ? `Bạn có chắc muốn dùng điểm để đổi '${selectedReward?.label}'?`
            : 'Tính năng này sẽ sử dụng điểm để ghim bài đăng của bạn lên trang tìm kiếm.'
        }
        cost={modalType === 'REDEEM' ? (selectedReward?.pointsCost || 0) : BOOST_POINTS_COST}
        isLoading={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  )
}
