'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HubStats {
  totalUsers: number
  vipUsers: number
  activeToday: number
  totalBots: number
  activeBots: number
  kpiProgressPercent: number
  postsToday: number
  totalQuota: number
}

export default function AdminHubPage() {
  const router = useRouter()
  const [stats, setStats] = useState<HubStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, botsRes] = await Promise.all([
          fetch('/api/admin/users?page=1&limit=1'),
          fetch('/api/bots'),
        ])

        const usersData = usersRes.ok ? await usersRes.json() : null
        const botsData = botsRes.ok ? await botsRes.json() : null

        const bots: { is_envoy: boolean; daily_quota: number; posts_today: number }[] =
          botsData?.success ? botsData.data : []
        const envoyBots = bots.filter((b) => b.is_envoy)
        const totalQuota = envoyBots.reduce((s, b) => s + (b.daily_quota || 0), 0)
        const postsToday = envoyBots.reduce((s, b) => s + (b.posts_today || 0), 0)

        const tierStats: Record<number, number> = usersData?.tierStats ?? {}
        const vipUsers = (tierStats[4] ?? 0) + (tierStats[5] ?? 0)

        setStats({
          totalUsers: usersData?.total ?? 0,
          vipUsers,
          activeToday: 0, // placeholder — no dedicated endpoint yet
          totalBots: bots.length,
          activeBots: envoyBots.length,
          kpiProgressPercent: totalQuota > 0 ? Math.round((postsToday / totalQuota) * 100) : 0,
          postsToday,
          totalQuota,
        })
      } catch (err) {
        console.error('[AdminHub]', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cardStyle = (hovered: boolean): React.CSSProperties => ({
    background: hovered ? 'rgba(30,41,59,0.9)' : 'rgba(30,41,59,0.6)',
    border: `1px solid ${hovered ? 'rgba(20,184,166,0.35)' : 'rgba(51,65,85,0.6)'}`,
    borderRadius: 16,
    padding: '36px 40px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: hovered
      ? '0 0 0 1px rgba(20,184,166,0.2), 0 20px 40px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.15)',
    transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
    backdropFilter: 'blur(8px)',
    flex: 1,
  })

  const [hoveredCard, setHoveredCard] = useState<'members' | 'bots' | null>(null)

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: '#0f172a',
      padding: '48px 24px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Page Title */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <h1 id="admin-hub-title" style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Trung Tâm Quản Trị
          </h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>
            Chọn phạm vi quản trị để bắt đầu
          </p>
        </div>

        {/* Overview Cards */}
        <div style={{ display: 'flex', gap: 24 }}>

          {/* Card 1: Members */}
          <div
            id="admin-hub-members-card"
            style={cardStyle(hoveredCard === 'members')}
            onMouseEnter={() => setHoveredCard('members')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push('/admin/members')}
          >
            {/* Icon */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px 0' }}>
              Quản Lý Thành Viên
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 28px 0', lineHeight: 1.5 }}>
              Xem danh sách, điểm thưởng, khóa tài khoản và thống kê hệ thống referral.
            </p>

            {/* Mini Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              <div style={{
                background: 'rgba(15,23,42,0.5)',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid rgba(51,65,85,0.5)',
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#f8fafc', fontVariantNumeric: 'tabular-nums' }}>
                  {loading ? '—' : stats?.totalUsers.toLocaleString('vi-VN') ?? '0'}
                </div>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                  Tổng thành viên
                </div>
              </div>
              <div style={{
                background: 'rgba(15,23,42,0.5)',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid rgba(51,65,85,0.5)',
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#a5b4fc', fontVariantNumeric: 'tabular-nums' }}>
                  {loading ? '—' : stats?.vipUsers ?? '0'}
                </div>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                  Hạng VIP+
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: hoveredCard === 'members' ? '#818cf8' : '#64748b',
              fontSize: 13,
              fontWeight: 600,
              transition: 'color 0.15s',
            }}>
              <span>Quản Lý Ngay</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* Card 2: Bots */}
          <div
            id="admin-hub-bots-card"
            style={cardStyle(hoveredCard === 'bots')}
            onMouseEnter={() => setHoveredCard('bots')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push('/admin/bots')}
          >
            {/* Icon */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(20,184,166,0.25), rgba(15,118,110,0.15))',
              border: '1px solid rgba(20,184,166,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px 0' }}>
              Quản Lý Bot
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 28px 0', lineHeight: 1.5 }}>
              Theo dõi KPI, điều chỉnh nhân sự Bot, cấu hình AI, quản lý nguồn cào dữ liệu.
            </p>

            {/* Mini Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              <div style={{
                background: 'rgba(15,23,42,0.5)',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid rgba(51,65,85,0.5)',
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#f8fafc', fontVariantNumeric: 'tabular-nums' }}>
                  {loading ? '—' : stats?.activeBots ?? '0'}
                </div>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                  Bot Môi giới
                </div>
              </div>
              <div style={{
                background: 'rgba(15,23,42,0.5)',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid rgba(51,65,85,0.5)',
              }}>
                <div style={{
                  fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                  color: (stats?.kpiProgressPercent ?? 0) >= 80 ? '#4ade80' : '#2dd4bf',
                }}>
                  {loading ? '—' : `${stats?.kpiProgressPercent ?? 0}%`}
                </div>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                  KPI Hôm nay
                </div>
              </div>
            </div>

            {/* KPI Progress bar */}
            {!loading && stats && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginBottom: 6 }}>
                  <span>Tiến độ đăng bài</span>
                  <span style={{ color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                    {stats.postsToday}/{stats.totalQuota} bài
                  </span>
                </div>
                <div style={{
                  width: '100%', height: 4, background: 'rgba(30,41,59,0.8)',
                  borderRadius: 999, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(100, stats.kpiProgressPercent)}%`,
                    height: '100%',
                    background: stats.kpiProgressPercent >= 100
                      ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                      : 'linear-gradient(90deg, #14b8a6, #0d9488)',
                    borderRadius: 999,
                    transition: 'width 0.8s ease',
                    boxShadow: '0 0 8px rgba(20,184,166,0.6)',
                  }} />
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: hoveredCard === 'bots' ? '#2dd4bf' : '#64748b',
              fontSize: 13,
              fontWeight: 600,
              transition: 'color 0.15s',
            }}>
              <span>Theo Dõi Ngay</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 40 }}>
          Dùng thanh điều hướng phía trên để di chuyển nhanh giữa các khu vực
        </p>
      </div>
    </div>
  )
}

