'use client'

import { useState } from 'react'
import AdminUsersTab from '../components/AdminUsersTab'
import AdminReferralTab from '../components/AdminReferralTab'

export default function AdminMembersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'referral'>('users')

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 8, marginTop: 0 }}>
          Thành Viên &amp; Referral
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
          Quản lý người dùng, phân quyền VIP, và theo dõi điểm thưởng giới thiệu.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid rgba(51,65,85,0.8)',
        marginBottom: 24,
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid #14b8a6' : '2px solid transparent',
            color: activeTab === 'users' ? '#f8fafc' : '#94a3b8',
            fontWeight: activeTab === 'users' ? 600 : 500,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          👥 Danh Sách Thành Viên
        </button>
        <button
          onClick={() => setActiveTab('referral')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'referral' ? '2px solid #818cf8' : '2px solid transparent',
            color: activeTab === 'referral' ? '#f8fafc' : '#94a3b8',
            fontWeight: activeTab === 'referral' ? 600 : 500,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          📊 Thống Kê Referral
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'referral' && <AdminReferralTab />}
      </div>
    </div>
  )
}
