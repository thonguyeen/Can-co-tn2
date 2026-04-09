'use client';

import { useState, useEffect } from 'react';
import BotHRTab from './components/BotHRTab';
import CrawlSourcesTab from './components/CrawlSourcesTab';
import OrchestratorTab from './components/OrchestratorTab';
import BotDashboardTab from './components/BotDashboardTab';
import BotOperationsTab from './components/BotOperationsTab';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ops' | 'bots' | 'sources' | 'system'>('dashboard');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      if (data.success) {
        setBots(data.data);
      }
    } catch (error) {
      console.error('Error fetching bots:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchBots();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl text-teal-500 font-medium animate-pulse">Đang tải trung tâm điều hành...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans selection:bg-teal-500/30">
      <div className="max-w-[1400px] mx-auto">
        {/* Header & Tabs */}
        <div className="mb-8 border-b border-slate-700/60 pb-4">
          <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Quản Trị Hệ Thống</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-800 text-teal-400 border-t-2 border-teal-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              📈 Báo Cáo KPI
            </button>
            <button
              onClick={() => setActiveTab('ops')}
              className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'ops' 
                  ? 'bg-slate-800 text-teal-400 border-t-2 border-teal-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              ⚙️ Vận Hành
            </button>
            <button
              onClick={() => setActiveTab('bots')}
              className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'bots' 
                  ? 'bg-slate-800 text-teal-400 border-t-2 border-teal-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              👨‍💼 Nhân Sự Bot
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'sources' 
                  ? 'bg-slate-800 text-teal-400 border-t-2 border-teal-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              🌐 Nguồn Cào
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-all ${
                activeTab === 'system' 
                  ? 'bg-slate-800 text-teal-400 border-t-2 border-teal-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              ⚙️ Lõi Hệ Thống
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && <BotDashboardTab bots={bots} />}
          {activeTab === 'ops' && <BotOperationsTab />}
          {activeTab === 'bots' && <BotHRTab bots={bots} onUpdate={fetchBots} />}
          {activeTab === 'sources' && <CrawlSourcesTab />}
          {activeTab === 'system' && <OrchestratorTab bots={bots} fetchBots={fetchBots} />}
        </div>
      </div>
    </div>
  );
}
