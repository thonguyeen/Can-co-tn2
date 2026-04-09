'use client'

import { useState, useEffect, useCallback } from 'react'
import s from '@/styles/admin.module.css'
import RedemptionActionModal from './RedemptionActionModal'

interface Redemption {
  id: string
  userId: string
  pointsCost: number
  status: string
  createdAt: string
  user: {
    displayName: string | null
    avatarUrl: string | null
    user: { email: string } | null
  } | null
  rewardItem: {
    label: string
    pointsCost: number
  } | null
}

interface RedemptionResponse {
  redemptions: Redemption[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function PendingRedemptionList() {
  const [data, setData] = useState<RedemptionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [modalTarget, setModalTarget] = useState<{
    redemption: Redemption
    action: 'approved' | 'rejected'
  } | null>(null)

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/redemptions?status=pending&limit=50')
      if (!res.ok) throw new Error('Lỗi tải')
      const json: RedemptionResponse = await res.json()
      setData(json)
    } catch (err) {
      console.error('[PendingRedemptionList]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (redemptionId: string, status: 'approved' | 'rejected', adminNote: string) => {
    try {
      const res = await fetch(`/api/admin/redemptions/${redemptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote })
      })

      const json = await res.json()
      if (!res.ok) {
        showToast(json.error ?? 'Lỗi xử lý đơn', 'error')
        return
      }

      showToast(json.message, 'success')
      setModalTarget(null)
      fetchPending() // refresh list
    } catch {
      showToast('Lỗi kết nối server', 'error')
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'var(--wm-text-dim)', fontSize: 13 }}>
        Đang tải đơn đổi quà...
      </div>
    )
  }

  const pending = data?.redemptions ?? []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--wm-text)' }}>
          🎁 Đơn Đổi Quà Chờ Duyệt ({pending.length} đơn)
        </h3>
      </div>

      {pending.length === 0 ? (
        <div className={s.emptyState} style={{ padding: 32 }}>
          <div className={s.emptyIcon}>✅</div>
          <div className={s.emptyText}>Không có đơn nào chờ duyệt</div>
        </div>
      ) : (
        <div style={{ background: 'var(--wm-surface)', border: '1px solid var(--wm-border)', borderRadius: 8 }}>
          {pending.map(item => (
            <div key={item.id} className={s.redemptionRow}>
              <div className={s.userAvatar} style={{ width: 36, height: 36, fontSize: 12 }}>
                {item.user?.avatarUrl ? (
                  <img src={item.user.avatarUrl} alt="" />
                ) : (
                  getInitials(item.user?.displayName ?? null)
                )}
              </div>
              <div className={s.redemptionInfo}>
                <div className={s.redemptionReward}>
                  {item.user?.displayName ?? 'Chưa đặt tên'} — {item.rewardItem?.label ?? 'Phần thưởng'}
                </div>
                <div className={s.redemptionCost}>
                  {item.pointsCost} điểm • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <button
                className={s.approveBtn}
                onClick={() => setModalTarget({ redemption: item, action: 'approved' })}
              >
                ✅ Duyệt
              </button>
              <button
                className={s.rejectBtn}
                onClick={() => setModalTarget({ redemption: item, action: 'rejected' })}
              >
                ❌ Từ chối
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {modalTarget && (
        <RedemptionActionModal
          redemption={modalTarget.redemption}
          action={modalTarget.action}
          onConfirm={(note) => handleAction(modalTarget.redemption.id, modalTarget.action, note)}
          onClose={() => setModalTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={toast.type === 'success' ? s.toastSuccess : s.toastError}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
