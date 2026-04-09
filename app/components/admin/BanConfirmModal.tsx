'use client'

import { useState } from 'react'
import s from '@/styles/admin.module.css'

interface Props {
  userName: string
  isBanned: boolean
  onConfirm: (ban: boolean, reason: string) => Promise<void>
  onClose: () => void
}

export default function BanConfirmModal({ userName, isBanned, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const willBan = !isBanned // toggle current state

  const handleSubmit = async () => {
    if (willBan && reason.trim().length < 5) return
    setSubmitting(true)
    await onConfirm(willBan, reason.trim())
    setSubmitting(false)
  }

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={e => e.stopPropagation()}>
        <div className={s.modalTitle}>
          {willBan ? '🔴 Khóa Tài Khoản' : '🟢 Mở Khóa Tài Khoản'}
        </div>

        <div style={{ fontSize: 13, color: 'var(--wm-text-secondary)', marginBottom: 16 }}>
          {willBan
            ? `Bạn có chắc muốn khóa tài khoản "${userName}"? User sẽ không thể truy cập hệ thống.`
            : `Bạn có chắc muốn mở khóa tài khoản "${userName}"?`}
        </div>

        {willBan && (
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Lý do khóa (bắt buộc ≥ 5 ký tự)</label>
            <input
              className={s.searchInput}
              style={{ paddingLeft: 14 }}
              placeholder="VD: Spam bài viết, vi phạm quy định..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
        )}

        <div className={s.modalActions}>
          <button className={s.cancelBtn} onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button
            className={willBan ? s.dangerBtn : s.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || (willBan && reason.trim().length < 5)}
          >
            {submitting
              ? 'Đang xử lý...'
              : willBan ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
          </button>
        </div>
      </div>
    </div>
  )
}
