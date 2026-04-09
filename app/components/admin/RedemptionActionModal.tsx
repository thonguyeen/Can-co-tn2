'use client'

import { useState } from 'react'
import s from '@/styles/admin.module.css'

interface Props {
  redemption: {
    id: string
    user: { displayName: string | null } | null
    rewardItem: { label: string; pointsCost: number } | null
    pointsCost: number
  }
  action: 'approved' | 'rejected'
  onConfirm: (adminNote: string) => void
  onClose: () => void
}

export default function RedemptionActionModal({ redemption, action, onConfirm, onClose }: Props) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isReject = action === 'rejected'
  const userName = redemption.user?.displayName ?? 'User'
  const rewardLabel = redemption.rewardItem?.label ?? 'Phần thưởng'

  const handleSubmit = async () => {
    if (isReject && note.trim().length < 5) return
    setSubmitting(true)
    await onConfirm(note)
    setSubmitting(false)
  }

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={e => e.stopPropagation()}>
        <div className={s.modalTitle}>
          {isReject ? '❌ Từ Chối Đơn Đổi Quà' : '✅ Duyệt Đơn Đổi Quà'}
        </div>

        <div style={{ fontSize: 13, color: 'var(--wm-text-secondary)', marginBottom: 16 }}>
          <strong>{userName}</strong> muốn đổi <strong>{rewardLabel}</strong> ({redemption.pointsCost} điểm)
        </div>

        {isReject && (
          <div style={{ fontSize: 11, color: '#F59E0B', marginBottom: 12 }}>
            ⚠️ Từ chối sẽ hoàn lại {redemption.pointsCost} điểm cho user
          </div>
        )}

        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>
            Ghi chú {isReject ? '(bắt buộc ≥ 5 ký tự)' : '(không bắt buộc)'}
          </label>
          <input
            className={s.searchInput}
            style={{ paddingLeft: 14 }}
            placeholder={isReject ? 'Lý do từ chối...' : 'Ghi chú thêm (nếu có)...'}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className={s.modalActions}>
          <button className={s.cancelBtn} onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button
            className={isReject ? s.dangerBtn : s.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || (isReject && note.trim().length < 5)}
          >
            {submitting ? 'Đang xử lý...' : isReject ? 'Xác nhận từ chối' : 'Xác nhận duyệt'}
          </button>
        </div>
      </div>
    </div>
  )
}
