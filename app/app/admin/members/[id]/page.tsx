'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import s from '@/styles/admin.module.css'
import PointAdjustForm from '@/components/admin/PointAdjustForm'
import BanConfirmModal from '@/components/admin/BanConfirmModal'

const TIER_NAMES = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương']
const TIER_EMOJI = ['🥉', '🥈', '🥇', '💠', '💎']

interface UserDetail {
  profile: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    tier: number
    totalReferrals: number
    referralCode: string | null
    referredBy: string | null
    isBanned: boolean
    banReason: string | null
    bannedAt: string | null
    createdAt: string
  }
  stats: {
    points: number
    totalPointsEarned: number
    totalPointsSpent: number
    referralPoints: number
  }
  recentTransactions: {
    id: string
    amount: number
    type: string
    reason: string | null
    createdAt: string
  }[]
  referralTree: {
    referredBy: { displayName: string | null; avatarUrl: string | null } | null
    referrals: { name: string; avatarUrl: string | null; createdAt: string }[]
  }
  achievements: { id: string; achievementKey: string; unlockedAt: string }[]
}

type TabKey = 'info' | 'history' | 'tree' | 'achievements'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('info')
  const [showBanModal, setShowBanModal] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json: UserDetail = await res.json()
      setData(json)
    } catch (err) {
      console.error('[UserDetail]', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleBan = async (ban: boolean, reason: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban, reason })
      })
      const json = await res.json()
      if (!res.ok) {
        showToast(json.error ?? 'Lỗi', 'error')
        return
      }
      showToast(json.message, 'success')
      setShowBanModal(false)
      fetchUser() // refresh
    } catch {
      showToast('Lỗi kết nối server', 'error')
    }
  }

  const handlePointsSuccess = (newBalance: number) => {
    if (data) {
      setData({
        ...data,
        stats: { ...data.stats, points: newBalance }
      })
      // Refresh for updated transaction log
      fetchUser()
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const formatRelative = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} ngày trước`
    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks} tuần trước`
    return formatDate(dateStr)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const getTxnColorClass = (type: string, amount: number) => {
    if (type === 'manual') return s.txnManual
    if (type === 'refund') return s.txnRefund
    return amount > 0 ? s.txnPositive : s.txnNegative
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">
        <div className="max-w-[1400px] mx-auto">
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--wm-text-dim)' }}>
            Đang tải thông tin user...
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">
        <div className="max-w-[1400px] mx-auto">
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>❌</div>
            <div className={s.emptyText}>Không tìm thấy user</div>
            <button className={s.cancelBtn} style={{ marginTop: 16 }} onClick={() => router.push('/admin/members')}>
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { profile: p, stats: st } = data

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'info', label: '📋 Thông tin' },
    { key: 'history', label: '📜 Lịch sử điểm' },
    { key: 'tree', label: '🌳 Cây GT' },
    { key: 'achievements', label: '🏆 Thành tựu' },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans selection:bg-teal-500/30">
      <div className="max-w-[1400px] mx-auto">
        {/* Back Link */}
        <button className={s.backLink} onClick={() => router.push('/admin/members')}>
          ← Quay lại danh sách
        </button>

        {/* Header */}
        <div className={s.detailHeader}>
          <div className={s.detailAvatar}>
            {p.avatarUrl ? (
              <img src={p.avatarUrl} alt={p.name} />
            ) : (
              getInitials(p.name)
            )}
          </div>
          <div className={s.detailInfo}>
            <div className={s.detailName}>
              {p.name}
              {p.isBanned && (
                <span className={`${s.statusChip} ${s.statusBanned}`} style={{ marginLeft: 12, fontSize: 10 }}>
                  ❌ Bị khóa
                </span>
              )}
            </div>
            <div className={s.detailMeta}>
              <span>{p.email}</span>
              <span>•</span>
              <span className={s.tierBadge} data-tier={p.tier}>
                {TIER_EMOJI[p.tier - 1]} {TIER_NAMES[p.tier - 1]}
              </span>
              <span>•</span>
              <span>{p.totalReferrals} lượt GT</span>
              <span>•</span>
              <span>TG: {formatDate(p.createdAt)}</span>
            </div>
          </div>
          <button
            className={p.isBanned ? s.submitBtn : s.dangerBtn}
            onClick={() => setShowBanModal(true)}
          >
            {p.isBanned ? '🟢 Mở khóa' : '🔴 Khóa tài khoản'}
          </button>
        </div>

        {/* Tabs */}
        <div className={s.tabBar}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={activeTab === t.key ? s.tabActive : s.tab}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* ═══ TAB: Thông tin ═══ */}
          {activeTab === 'info' && (
            <div>
              {/* Stat Cards */}
              <div className={s.statGrid}>
                <div className={s.statCard}>
                  <div className={s.statValue}>{st.points.toLocaleString('vi-VN')}</div>
                  <div className={s.statLabel}>Điểm hiện tại</div>
                </div>
                <div className={s.statCard}>
                  <div className={s.statValue}>{st.totalPointsEarned.toLocaleString('vi-VN')}</div>
                  <div className={s.statLabel}>Đã kiếm</div>
                </div>
                <div className={s.statCard}>
                  <div className={s.statValue}>{st.totalPointsSpent.toLocaleString('vi-VN')}</div>
                  <div className={s.statLabel}>Đã tiêu</div>
                </div>
                <div className={s.statCard}>
                  <div className={s.statValue}>{st.referralPoints.toLocaleString('vi-VN')}</div>
                  <div className={s.statLabel}>Điểm GT</div>
                </div>
              </div>

              {/* Point Adjust */}
              <PointAdjustForm
                userId={userId}
                currentPoints={st.points}
                onSuccess={handlePointsSuccess}
              />

              {/* Ban Info */}
              {p.isBanned && p.banReason && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: 'color-mix(in srgb, #EF4444 8%, var(--wm-surface))',
                  border: '1px solid color-mix(in srgb, #EF4444 20%, transparent)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#EF4444'
                }}>
                  <strong>Lý do khóa:</strong> {p.banReason}
                  {p.bannedAt && (
                    <span style={{ marginLeft: 12, fontSize: 11, opacity: 0.7 }}>
                      ({formatDate(p.bannedAt)})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ TAB: Lịch sử điểm ═══ */}
          {activeTab === 'history' && (
            <div>
              {data.recentTransactions.length === 0 ? (
                <div className={s.emptyState}>
                  <div className={s.emptyIcon}>📜</div>
                  <div className={s.emptyText}>Chưa có giao dịch điểm nào</div>
                </div>
              ) : (
                <div style={{ background: 'var(--wm-surface)', border: '1px solid var(--wm-border)', borderRadius: 8 }}>
                  {data.recentTransactions.map(txn => (
                    <div key={txn.id} className={s.txnRow}>
                      <span className={`${s.txnAmount} ${getTxnColorClass(txn.type, txn.amount)}`}>
                        {txn.amount > 0 ? '+' : ''}{txn.amount}
                      </span>
                      <span className={s.txnType}>{txn.type}</span>
                      <span className={s.txnReason}>{txn.reason ?? '—'}</span>
                      <span className={s.txnDate}>{formatRelative(txn.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ TAB: Cây GT ═══ */}
          {activeTab === 'tree' && (
            <div>
              {/* Referred By */}
              <div className={s.treeSection}>
                <div className={s.treeSectionTitle}>👆 Được giới thiệu bởi</div>
                {data.referralTree.referredBy ? (
                  <div className={s.referralCard}>
                    <div className={s.userAvatar} style={{ width: 28, height: 28, fontSize: 10 }}>
                      {data.referralTree.referredBy.avatarUrl ? (
                        <img src={data.referralTree.referredBy.avatarUrl} alt="" />
                      ) : (
                        getInitials(data.referralTree.referredBy.displayName ?? '?')
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--wm-text)' }}>
                      {data.referralTree.referredBy.displayName ?? 'Chưa đặt tên'}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--wm-text-dim)' }}>Không có</div>
                )}
              </div>

              {/* Referrals Made */}
              <div className={s.treeSection}>
                <div className={s.treeSectionTitle}>
                  👇 Đã giới thiệu ({data.referralTree.referrals.length} người)
                </div>
                {data.referralTree.referrals.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--wm-text-dim)' }}>Chưa giới thiệu ai</div>
                ) : (
                  <div className={s.referralGrid}>
                    {data.referralTree.referrals.map((ref, i) => (
                      <div key={i} className={s.referralCard}>
                        <div className={s.userAvatar} style={{ width: 28, height: 28, fontSize: 10 }}>
                          {ref.avatarUrl ? (
                            <img src={ref.avatarUrl} alt="" />
                          ) : (
                            getInitials(ref.name)
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--wm-text)' }}>{ref.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--wm-text-dim)' }}>
                            {formatDate(ref.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ TAB: Thành tựu ═══ */}
          {activeTab === 'achievements' && (
            <div>
              {data.achievements.length === 0 ? (
                <div className={s.emptyState}>
                  <div className={s.emptyIcon}>🏆</div>
                  <div className={s.emptyText}>Chưa có thành tựu nào</div>
                </div>
              ) : (
                <div style={{ background: 'var(--wm-surface)', border: '1px solid var(--wm-border)', borderRadius: 8 }}>
                  {data.achievements.map(ach => (
                    <div key={ach.id} className={s.achievementRow}>
                      <span className={s.achievementIcon}>🏅</span>
                      <div>
                        <div className={s.achievementName}>{ach.achievementKey}</div>
                        <div className={s.achievementDate}>
                          Mở khóa: {formatDate(ach.unlockedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ban Modal */}
        {showBanModal && (
          <BanConfirmModal
            userName={p.name}
            isBanned={p.isBanned}
            onConfirm={handleBan}
            onClose={() => setShowBanModal(false)}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className={toast.type === 'success' ? s.toastSuccess : s.toastError}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  )
}
