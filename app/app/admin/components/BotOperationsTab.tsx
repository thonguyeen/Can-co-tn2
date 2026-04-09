'use client';

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

interface OrchestratorStatus {
  isRunning: boolean;
  mode: 'test' | 'live';
  startedAt: number | null;
  uptimeMs: number;
  activeBots: string[];
  totalActivities: number;
  activeDebates: number;
}

interface Activity {
  id: string;
  type: string;
  botHandle: string;
  content?: string;
  status: string;
  createdAt: number;
}

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════

export default function BotOperationsTab() {
  const [status, setStatus] = useState<OrchestratorStatus | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter States
  const [filterBotHandle, setFilterBotHandle] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // ── FETCH STATUS ──
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/orchestrator?action=status');
      const data = await res.json();
      if (data.success) {
        setStatus(data.data.orchestrator);
      }
    } catch (e) {
      console.error('[Ops] status fetch fail:', e);
    }
  }, []);

  // ── FETCH ACTIVITIES ──
  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/orchestrator?action=activities&limit=30&bot_handle=${filterBotHandle}&status=${filterStatus}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.data || []);
      }
    } catch (e) {
      console.error('[Ops] activities fetch fail:', e);
    }
  }, [filterBotHandle, filterStatus]);

  // ── INITIAL LOAD + POLLING ──
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchStatus(), fetchActivities()]);
      setLoading(false);
    };
    init();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchActivities]);

  // ── ACTIONS ──
  const doAction = async (action: string, params?: Record<string, any>) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
      }
      await fetchStatus();
      await fetchActivities();
    } catch (e) {
      console.error('[Ops] action fail:', e);
    } finally {
      setActionLoading(false);
    }
  };

  // ── HELPERS ──
  const formatUptime = (ms: number) => {
    if (ms <= 0) return '—';
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    if (mins > 0) return `${mins}m ${secs % 60}s`;
    return `${secs}s`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      case 'reply': return '↩️';
      case 'debate': return '🗣️';
      case 'react': return '👍';
      default: return '⚡';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-teal-500 animate-pulse text-lg font-medium">Đang kết nối Phòng Điều Hành...</div>
      </div>
    );
  }

  const isRunning = status?.isRunning ?? false;
  const isTestMode = status?.mode === 'test';

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">⚙️ Vận Hành Bot</h2>
          <p className="text-sm text-slate-400 mt-1">Bảng điều khiển trung tâm — Bật/Tắt và theo dõi hoạt động Bot</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            isTestMode
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {isTestMode ? '🧪 CHẾ ĐỘ TEST' : '🔴 CHẾ ĐỘ LIVE'}
          </span>
          <button
            onClick={() => doAction('set_mode', { mode: isTestMode ? 'live' : 'test' })}
            disabled={actionLoading}
            className="text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
          >
            Chuyển {isTestMode ? 'LIVE' : 'TEST'}
          </button>
        </div>
      </div>

      {/* ── CONTROL CENTER ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* Big Start/Stop Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => doAction(isRunning ? 'stop' : 'start')}
              disabled={actionLoading}
              className={`relative w-28 h-28 rounded-full font-bold text-lg transition-all duration-300 disabled:opacity-60 ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.4)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)]'
              }`}
            >
              {actionLoading ? (
                <span className="animate-spin text-2xl">⏳</span>
              ) : isRunning ? (
                <span className="flex flex-col items-center">
                  <span className="text-2xl">⏹️</span>
                  <span className="text-xs mt-1">STOP</span>
                </span>
              ) : (
                <span className="flex flex-col items-center">
                  <span className="text-2xl">▶️</span>
                  <span className="text-xs mt-1">START</span>
                </span>
              )}

              {/* Pulse ring when running */}
              {isRunning && (
                <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20 pointer-events-none" style={{ animationDuration: '2s' }} />
              )}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* Status */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isRunning ? '🟢' : '⚪'}
              </div>
              <div className="text-xs text-slate-400 mt-1">{isRunning ? 'Đang chạy' : 'Đã dừng'}</div>
            </div>

            {/* Uptime */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-teal-400">
                {formatUptime(status?.uptimeMs ?? 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Thời gian chạy</div>
            </div>

            {/* Active Bots */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-indigo-400">
                {status?.activeBots.length ?? 0}
              </div>
              <div className="text-xs text-slate-400 mt-1">Bot đang Active</div>
            </div>

            {/* Total Activities */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {status?.totalActivities ?? 0}
              </div>
              <div className="text-xs text-slate-400 mt-1">Hoạt động tổng</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVITY LOG ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">📋 Log Hoạt Động</h3>
            <span className="text-xs text-slate-500">Cập nhật mỗi 5 giây</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterBotHandle}
              onChange={(e) => setFilterBotHandle(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-2.5 py-1.5"
            >
              <option value="all">Tất cả Bot</option>
              {status?.activeBots.map((b) => (
                <option key={b} value={b}>@{b}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-2.5 py-1.5"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="completed">Thành công</option>
              <option value="running">Đang chạy</option>
              <option value="failed">Lỗi</option>
            </select>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-3">🤖💤</div>
            <p className="text-sm">Chưa có hoạt động nào. Bấm <strong className="text-emerald-400">START</strong> để đánh thức đội Bot!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 bg-slate-900/40 border border-slate-700/30 rounded-lg px-4 py-3 hover:border-slate-600/50 transition-colors"
              >
                <span className="text-lg flex-shrink-0">{activityIcon(act.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-teal-400">@{act.botHandle}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      act.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      act.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      act.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-600/20 text-slate-400'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                  {act.content && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{act.content.substring(0, 100)}</p>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 flex-shrink-0 whitespace-nowrap">
                  {formatTime(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
