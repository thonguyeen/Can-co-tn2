'use client';

import { useMemo } from 'react';

// Reusing Bot interface
interface Bot {
  id: string;
  handle: string;
  name: string;
  category: string;
  color: string;
  is_envoy: boolean;
  assigned_province?: string;
  daily_quota: number;
  posts_today: number;
}

export default function BotDashboardTab({ bots }: { bots: Bot[] }) {
  // 1. Data Aggregation
  const envoyBots = useMemo(() => bots.filter((b) => b.is_envoy), [bots]);

  const totalBots = envoyBots.length;
  const totalQuota = envoyBots.reduce((sum, bot) => sum + (bot.daily_quota || 0), 0);
  const totalPosts = envoyBots.reduce((sum, bot) => sum + (bot.posts_today || 0), 0);
  const quotaProgress = totalQuota > 0 ? Math.round((totalPosts / totalQuota) * 100) : 0;

  // Top 5 Performers
  const topBots = useMemo(() => {
    return [...envoyBots].sort((a, b) => (b.posts_today || 0) - (a.posts_today || 0)).slice(0, 5);
  }, [envoyBots]);

  // Regional Map (Group by province)
  const regionalData = useMemo(() => {
    const data = new Map<string, number>();
    envoyBots.forEach((bot) => {
      const region = bot.assigned_province || 'Chưa phân công';
      data.set(region, (data.get(region) || 0) + 1);
    });
    return Array.from(data.entries()).sort((a, b) => b[1] - a[1]);
  }, [envoyBots]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Tổng Lực Lượng */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-6 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center text-teal-400 text-2xl">
              🤖
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Tổng Lực Lượng</p>
              <h3 className="text-3xl font-bold text-slate-100">{totalBots} <span className="text-sm font-normal text-slate-500">Bot</span></h3>
            </div>
          </div>
        </div>

        {/* Card 2: Tiến độ KPI */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-6 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center text-teal-400 text-2xl">
              🎯
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400 font-medium">Tiến Độ KPI</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-slate-100">{quotaProgress}%</h3>
                <span className={quotaProgress >= 100 ? 'text-green-500 text-sm font-medium' : 'text-teal-400 text-sm font-medium'}>
                  {totalPosts}/{totalQuota} bài
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Cảnh báo / Hoạt động */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-6 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(34,197,94,0.15)] transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center text-green-400 text-2xl">
              ⚡
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Trạng Thái Hệ Thống</p>
              <div className="flex items-center mt-1">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-2"></span>
                <h3 className="text-lg font-bold text-green-400">Đang Thu Thập</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard (Left - Takes up 2 cols) */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center">
              <span className="mr-2">🏆</span> Bảng Xếp Hạng Thi Đua
            </h2>
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">Top 5 Cống Hiến</span>
          </div>

          {topBots.length === 0 ? (
            <div className="py-10 text-center text-slate-500 italic">Chưa có dữ liệu nhân sự để xếp hạng.</div>
          ) : (
            <div className="space-y-5">
              {topBots.map((bot, index) => {
                const percent = bot.daily_quota > 0 ? Math.min(100, (bot.posts_today / bot.daily_quota) * 100) : 0;
                const isMaxed = percent >= 100;
                
                return (
                  <div key={bot.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-500 font-bold w-4 text-center">#{index + 1}</div>
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                          style={{ backgroundColor: bot.color || '#475569' }}
                        >
                          {bot.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-200 group-hover:text-teal-400 transition-colors">{bot.name}</span>
                          <span className="text-xs text-slate-500 ml-2">@{bot.handle}</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium">
                        <span className={isMaxed ? "text-green-500" : "text-teal-400"}>{bot.posts_today}</span>
                        <span className="text-slate-500"> / {bot.daily_quota} bài</span>
                      </div>
                    </div>
                    {/* Progress bar container */}
                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden ml-15 relative">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isMaxed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Regional Map (Right - Takes up 1 col) */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center">
              <span className="mr-2">🗺️</span> Trinh Sát Khu Vực
            </h2>
          </div>

          {regionalData.length === 0 ? (
            <div className="py-10 text-center text-slate-500 italic">Chưa có phân công khu vực.</div>
          ) : (
            <div className="space-y-0">
              {regionalData.map(([region, count], index) => (
                <div 
                  key={region} 
                  className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 px-2 rounded-lg transition-colors cursor-default"
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-slate-400">📍</span>
                    <span className="text-sm font-medium text-slate-300">{region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded">{count} Bot</span>
                    <span className="w-2 h-2 rounded-full animate-pulse bg-green-500"></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
