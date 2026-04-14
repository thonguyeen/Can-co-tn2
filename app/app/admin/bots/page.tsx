'use client'

import { useState, useEffect } from 'react'
import BotDashboardTab from '../components/BotDashboardTab'
import BotOperationsTab from '../components/BotOperationsTab'
import BotHRTab from '../components/BotHRTab'
import BotConfigTab from '../components/BotConfigTab'
import CrawlSourcesTab from '../components/CrawlSourcesTab'
import OrchestratorTab from '../components/OrchestratorTab'

type TabKey = 'dashboard' | 'ops' | 'hr' | 'config' | 'sources' | 'system'

export default function AdminBotsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/bots')
      const data = await res.json()
      if (data.success) {
        setBots(data.data)
      }
    } catch (error) {
      console.error('[AdminBots] Error fetching bots:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchBots()
      setLoading(false)
    }
    init()
  }, [])

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'KPI Báo Cáo', icon: '📈' },
    { key: 'ops', label: 'Vận Hành', icon: '⚙️' },
    { key: 'hr', label: 'Nhân Sự Bot', icon: '👨‍💼' },
    { key: 'config', label: 'Bot Config', icon: '🧠' },
    { key: 'sources', label: 'Nguồn Cào', icon: '🌐' },
    { key: 'system', label: 'Lõi Hệ Thống', icon: '🛠️' },
  ]

  if (loading) {
    return (
      <div style={{
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#14b8a6',
        fontSize: '14px',
        fontWeight: 500
      }}>
        <div style={{ animation: 'pulse 1.5s infinite' }}>
          Đang nạp trung tâm điều hành Bot...
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 8, marginTop: 0 }}>
          Quản Lý Hệ Thống Bot
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
          Giám sát hiệu suất AI, cấu hình nguồn dữ liệu và điều phối nhân sự Bot.
        </p>
      </div>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        borderBottom: '1px solid rgba(51,65,85,0.8)',
        marginBottom: 24,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #2dd4bf' : '2px solid transparent',
              color: activeTab === tab.key ? '#2dd4bf' : '#64748b',
              fontWeight: activeTab === tab.key ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.key) (e.currentTarget as HTMLElement).style.color = '#94a3b8'
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.key) (e.currentTarget as HTMLElement).style.color = '#64748b'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'dashboard' && <BotDashboardTab bots={bots} />}
        {activeTab === 'ops' && <BotOperationsTab />}
        {activeTab === 'hr' && <BotHRTab bots={bots} onUpdate={fetchBots} />}
        {activeTab === 'config' && <BotConfigTab bots={bots} />}
        {activeTab === 'sources' && <CrawlSourcesTab />}
        {activeTab === 'system' && <OrchestratorTab bots={bots} fetchBots={fetchBots} />}
      </div>
    </div>
  )
}
