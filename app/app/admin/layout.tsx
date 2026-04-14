'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  description: string
  exact?: boolean
  adminOnly?: boolean  // Chỉ ADMIN mới thấy
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Tổng Quan',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    description: 'Hub điều hướng',
    exact: true,
  },
  {
    href: '/admin/members',
    label: 'Thành Viên',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Users & Referral',
  },
  {
    href: '/admin/bots',
    label: 'Quản Lý Bot',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: 'KPI, Config, Crawler',
    adminOnly: true,  // 👑 Chỉ ADMIN
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role ?? 'USER'
  const isAdmin = role === 'ADMIN'

  // Lọc menu: MODERATOR không thấy mục adminOnly
  const visibleNavItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Navigation Bar */}
      <header style={{
        borderBottom: '1px solid rgba(51,65,85,0.6)',
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          height: 56,
        }}>
          {/* Brand */}
          <button
            onClick={() => router.push('/admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#f8fafc',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Quản Trị
            </span>
          </button>

          {/* Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            {visibleNavItems.map((item) => {
              const active = isActive(item)
              return (
                <button
                  key={item.href}
                  id={`admin-nav-${item.href.replace('/admin', '').replace('/', '') || 'hub'}`}
                  onClick={() => router.push(item.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '6px 14px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    transition: 'all 0.15s ease',
                    background: active ? 'rgba(20,184,166,0.12)' : 'transparent',
                    color: active ? '#14b8a6' : '#94a3b8',
                    outline: 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(51,65,85,0.4)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }
                  }}
                >
                  <span style={{ color: active ? '#14b8a6' : 'inherit', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Back to App */}
          <button
            id="admin-back-to-app"
            onClick={() => router.push('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              border: '1px solid rgba(51,65,85,0.8)',
              fontSize: 12,
              fontWeight: 500,
              color: '#64748b',
              background: 'transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(100,116,139,0.6)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#64748b'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(51,65,85,0.8)'
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Về App
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  )
}
