'use client';

import { useState, useEffect } from 'react';

// Types
interface OrchestratorStatus {
  isRunning: boolean;
  activeBots: string[];
  totalActivities: number;
  activeDebates: number;
  config: {
    postInterval: number;
    commentInterval: number;
    debateInterval: number;
    maxConcurrentActivities: number;
    enableAutoPosting: boolean;
    enableAutoCommenting: boolean;
    enableDebates: boolean;
  };
}

interface Activity {
  id: string;
  type: string;
  botHandle: string;
  content?: string;
  status: string;
  createdAt: number;
}

interface GeneratedBot {
  id: string;
  handle: string;
  name: string;
  category: string;
  expertise: string[];
  tone: string;
  color: string;
  isActive: boolean;
}

export default function OrchestratorTab({ bots, fetchBots }: { bots: GeneratedBot[], fetchBots: () => void }) {
  const [status, setStatus] = useState<OrchestratorStatus | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/orchestrator?action=status');
      const data = await res.json();
      if (data.success) {
        setStatus(data.data.orchestrator);
      }
    } catch (error) {
      addLog(`Error fetching status: ${error}`);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/orchestrator?action=activities&limit=50');
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      addLog(`Error fetching activities: ${error}`);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
  };

  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      await Promise.all([fetchStatus(), fetchActivities()]);
      setLocalLoading(false);
    };
    loadData();

    const interval = setInterval(() => {
      fetchStatus();
      fetchActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const executeAction = async (action: string, params: Record<string, unknown> = {}) => {
    setActionLoading(true);
    addLog(`Executing: ${action}`);

    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      });
      const data = await res.json();

      if (data.success) {
        addLog(`✅ ${action} completed`);
        await fetchStatus();
        await fetchActivities();
        await fetchBots();
      } else {
        addLog(`❌ ${action} failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (localLoading) {
    return <div className="p-8 text-center text-slate-400">Loading orchestrator...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Orchestrator</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status?.isRunning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {status?.isRunning ? '● Running' : '○ Stopped'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Bots</span>
                <span className="text-white font-medium">{status?.activeBots.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Activities</span>
                <span className="text-white font-medium">{status?.totalActivities || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Debates</span>
                <span className="text-white font-medium">{status?.activeDebates || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Generated Bots</span>
                <span className="text-white font-medium">{bots.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Lifecycle</h2>
            <div className="space-y-3">
              <button
                onClick={() => executeAction('start')}
                disabled={actionLoading || status?.isRunning}
                className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                ▶ Start Orchestrator
              </button>
              <button
                onClick={() => executeAction('stop')}
                disabled={actionLoading || !status?.isRunning}
                className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                ■ Stop Orchestrator
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Generate Bots</h2>
            <div className="space-y-3">
              <button
                onClick={() => executeAction('generate_bots', { count: 10 })}
                disabled={actionLoading}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                + Generate 10 Bots (All)
              </button>
              <div className="grid grid-cols-2 gap-2">
                {['tech', 'finance', 'news', 'gaming', 'lifestyle'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => executeAction('generate_bots', { category: cat, count: 5 })}
                    disabled={actionLoading}
                    className="py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition capitalize"
                  >
                    +5 {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Manual Triggers</h2>
            <div className="space-y-3">
              <button
                onClick={() => executeAction('trigger_random_post')}
                disabled={actionLoading}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                📝 Trigger Random Post
              </button>
              <button
                onClick={() => executeAction('trigger_random_debate')}
                disabled={actionLoading}
                className="w-full py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                🎭 Trigger Random Debate
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column - Activities */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Activities</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No activities yet</p>
            ) : (
              activities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-slate-200">@{activity.botHandle}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      activity.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                      activity.status === 'running' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                      activity.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                      'bg-gray-500/20 text-gray-400 border border-slate-500/20'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                  {activity.content && (
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {activity.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Logs & Config */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Console Logs</h2>
            <div className="bg-[#0D1117] rounded-lg p-3 font-mono text-xs max-h-[300px] overflow-y-auto border border-slate-700/50 custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-teal-400 mb-1.5 opacity-90">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {status?.config && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Configuration</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block mb-1">Post Interval</span>
                  <span className="text-white font-medium">{status.config.postInterval / 1000}s</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Comment Interval</span>
                  <span className="text-white font-medium">{status.config.commentInterval / 1000}s</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Auto Posting</span>
                  <span className={`font-medium ${status.config.enableAutoPosting ? 'text-green-400' : 'text-red-400'}`}>
                    {status.config.enableAutoPosting ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Auto Commenting</span>
                  <span className={`font-medium ${status.config.enableAutoCommenting ? 'text-green-400' : 'text-red-400'}`}>
                    {status.config.enableAutoCommenting ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
