'use client';

import { Bot } from 'lucide-react';
import { BottomNav } from '@/components/intent/BottomNav';
import { BOT_PERSONAS } from '@/lib/agents/personas';
import { cn, formatDistanceToNow } from '@/lib/utils';

const BASE = new Date('2026-03-22T08:00:00Z').getTime();
const mockStats = [
  { comments: 24, lastActive: new Date(BASE - 5 * 60 * 1000).toISOString() },
  { comments: 18, lastActive: new Date(BASE - 30 * 60 * 1000).toISOString() },
  { comments: 6, lastActive: new Date(BASE - 2 * 60 * 60 * 1000).toISOString() },
  { comments: 12, lastActive: new Date(BASE - 15 * 60 * 1000).toISOString() },
  { comments: 8, lastActive: new Date(BASE - 1 * 60 * 60 * 1000).toISOString() },
  { comments: 5, lastActive: new Date(BASE - 3 * 60 * 60 * 1000).toISOString() },
];

const recentActivity = [
  { bot: '🏠', name: 'Nhà Advisor', action: 'commented on "Bán Vinhomes Q7"', time: '5 phút trước' },
  { bot: '🤖', name: 'Match Advisor', action: 'matched CẦN↔CÓ Q7', time: '12 phút trước' },
  { bot: '🛡️', name: 'Trust Checker', action: 'encouraged verify on "Tìm studio"', time: '30 phút trước' },
  { bot: '📊', name: 'Market Analyst', action: 'generated Q7 market report', time: '2 giờ trước' },
  { bot: '🤝', name: 'Connector', action: 'suggested connection Q7 buyers', time: '1 giờ trước' },
  { bot: '🎯', name: 'Concierge', action: 'welcomed new user Bùi Quốc Huy', time: '3 giờ trước' },
];

export default function AgentsPage() {
  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-[var(--wm-primary)]" />
        <h1 className="text-lg font-bold text-foreground">Quản lý AI Agents</h1>
      </div>

      {/* Bot Status Table */}
      <div className="wm-panel mb-4">
        <div className="wm-panel-header">
          <span className="wm-panel-title">Trạng thái 6 Agents</span>
        </div>
        <div className="divide-y divide-[var(--wm-border-subtle,#2F3032)]">
          {BOT_PERSONAS.map((bot, i) => {
            const stat = mockStats[i];
            return (
              <div key={bot.id} className="flex items-center gap-3 p-3">
                <span className="text-xl">{bot.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: bot.color }}>{bot.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 font-bold">ON</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{bot.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="tabular-nums text-sm font-bold text-foreground">{stat.comments}</div>
                  <div className="text-[9px] text-muted-foreground">comments</div>
                </div>
                <div className="text-right shrink-0 w-20">
                  <div className="text-[10px] text-muted-foreground">{formatDistanceToNow(stat.lastActive)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="wm-panel">
        <div className="wm-panel-header">
          <span className="wm-panel-title">Hoạt động gần đây</span>
        </div>
        <div className="divide-y divide-[var(--wm-border-subtle,#2F3032)]">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3">
              <span className="text-sm shrink-0">{a.bot}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  <span className="font-semibold">{a.name}</span>{' '}
                  <span className="text-muted-foreground">{a.action}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
