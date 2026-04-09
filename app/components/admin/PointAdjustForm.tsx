'use client'

import { useState } from 'react'
import s from '@/styles/admin.module.css'

interface Props {
  userId: string
  currentPoints: number
  onSuccess: (newBalance: number) => void
}

export default function PointAdjustForm({ userId, currentPoints, onSuccess }: Props) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async () => {
    setError('')
    const numAmount = parseInt(amount, 10)

    if (isNaN(numAmount) || numAmount === 0) {
      setError('Số điểm phải là số khác 0 (dương = cộng, âm = trừ)')
      return
    }

    if (reason.trim().length < 5) {
      setError('Lý do phải có ít nhất 5 ký tự')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, reason: reason.trim() })
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Lỗi xử lý điểm')
        return
      }

      showToast(json.message, 'success')
      onSuccess(json.newBalance)
      setAmount('')
      setReason('')
    } catch {
      setError('Lỗi kết nối server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={s.adjustForm}>
      <div className={s.adjustTitle}>
        ⚡ Điều Chỉnh Điểm Thủ Công
        <span style={{ fontSize: 11, color: 'var(--wm-text-dim)', fontWeight: 400 }}>
          (Hiện có: {currentPoints.toLocaleString('vi-VN')} điểm)
        </span>
      </div>

      <div className={s.adjustFields}>
        <div className={s.fieldGroup}>
          <label className={s.fieldLabel}>Số điểm</label>
          <input
            className={s.adjustInput}
            type="number"
            placeholder="+100 hoặc -50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className={s.fieldGroup} style={{ flex: 1 }}>
          <label className={s.fieldLabel}>Lý do (≥ 5 ký tự)</label>
          <input
            className={s.adjustInput}
            style={{ width: '100%' }}
            placeholder="VD: Thưởng sự kiện tháng 4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <button
          className={s.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '...' : '💾 Áp dụng'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#EF4444' }}>
          ⚠️ {error}
        </div>
      )}

      {toast && (
        <div className={toast.type === 'success' ? s.toastSuccess : s.toastError}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
