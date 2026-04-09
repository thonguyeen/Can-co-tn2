'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import s from '@/styles/admin.module.css'

const TIER_NAMES = ['Đồng', 'Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương']
const TIER_EMOJI = ['🥉', '🥈', '🥇', '💠', '💎']

interface AdminUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  tier: number
  tierName: string
  totalReferrals: number
  points: number
  isBanned: boolean
  createdAt: string
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
  tierStats: Record<number, number>
}

export default function AdminUsersTab() {
  const router = useRouter()
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (tierFilter) params.set('tier', tierFilter)
      if (statusFilter) params.set('banned', statusFilter === 'banned' ? 'true' : 'false')

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Lỗi tải dữ liệu')
      const json: UsersResponse = await res.json()
      setData(json)
    } catch (err) {
      console.error('[AdminUsersTab]', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, tierFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleTierChange = (val: string) => {
    setTierFilter(val)
    setPage(1)
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    setPage(1)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--wm-text)' }}>
          👥 Quản Lý Thành Viên
        </h2>
        {data && (
          <span style={{ fontSize: 12, color: 'var(--wm-text-dim)' }}>
            {data.total} thành viên
          </span>
        )}
      </div>

      {/* Search & Filters */}
      <div className={s.searchBar}>
        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>🔍</span>
          <input
            className={s.searchInput}
            placeholder="Tìm tên hoặc email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className={s.filterSelect}
          value={tierFilter}
          onChange={(e) => handleTierChange(e.target.value)}
        >
          <option value="">Tất cả hạng</option>
          {TIER_NAMES.map((name, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {TIER_EMOJI[i]} {name}
            </option>
          ))}
        </select>
        <select
          className={s.filterSelect}
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">✅ Hoạt động</option>
          <option value="banned">❌ Bị khóa</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--wm-text-dim)' }}>
          <div style={{ fontSize: 14, animation: 'pulse 1.5s infinite' }}>Đang tải...</div>
        </div>
      ) : !data || data.users.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>👤</div>
          <div className={s.emptyText}>Không tìm thấy thành viên nào</div>
        </div>
      ) : (
        <>
          <table className={s.dataTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Người dùng</th>
                <th>Hạng</th>
                <th>Điểm</th>
                <th>Lượt GT</th>
                <th>Trạng thái</th>
                <th>Ngày TG</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, idx) => (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <td style={{ color: 'var(--wm-text-dim)', fontSize: 12 }}>
                    {(data.page - 1) * data.limit + idx + 1}
                  </td>
                  <td>
                    <div className={s.userCell}>
                      <div className={s.userAvatar}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div>
                        <div className={s.userName}>{user.name}</div>
                        <div className={s.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={s.tierBadge} data-tier={user.tier}>
                      {TIER_EMOJI[user.tier - 1]} {TIER_NAMES[user.tier - 1]}
                    </span>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {user.points.toLocaleString('vi-VN')}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {user.totalReferrals}
                  </td>
                  <td>
                    <span className={`${s.statusChip} ${user.isBanned ? s.statusBanned : s.statusActive}`}>
                      {user.isBanned ? '❌ Bị khóa' : '✅ Hoạt động'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--wm-text-dim)', whiteSpace: 'nowrap' }}>
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={s.pagination}>
            <span className={s.paginationInfo}>
              Trang {data.page}/{data.totalPages} • {data.total} kết quả
            </span>
            <div className={s.paginationButtons}>
              <button
                className={s.pageBtn}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={data.page <= 1}
              >
                ◀ Trước
              </button>
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(data.page - 2, data.totalPages - 4)) + i
                if (pageNum > data.totalPages) return null
                return (
                  <button
                    key={pageNum}
                    className={`${s.pageBtn} ${pageNum === data.page ? s.pageBtnActive : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                className={s.pageBtn}
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
              >
                Tiếp ▶
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
