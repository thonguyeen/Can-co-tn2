'use client';

import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { BottomNav } from '@/components/intent/BottomNav';
import { cn } from '@/lib/utils';
import { DEMO_INTEGRITY_OVERVIEW, BAD_ACTORS, DEMO_CHAT_ALERTS } from '@/lib/mock/integrity';
import { GRADE_CONFIG } from '@/lib/agents/transparency-score';

const o = DEMO_INTEGRITY_OVERVIEW;

export default function IntegrityPage() {
  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-[var(--wm-primary)]" />
        <h1 className="text-lg font-bold text-foreground">Integrity Dashboard</h1>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="wm-panel p-3 text-center"><div className="tabular-nums text-lg font-bold text-emerald-400">{o.clean}</div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Clean</div></div>
        <div className="wm-panel p-3 text-center"><div className="tabular-nums text-lg font-bold text-yellow-400">{o.low}</div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Low</div></div>
        <div className="wm-panel p-3 text-center"><div className="tabular-nums text-lg font-bold text-orange-400">{o.medium}</div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Medium</div></div>
        <div className="wm-panel p-3 text-center"><div className="tabular-nums text-lg font-bold text-red-400">{o.high}</div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">High</div></div>
      </div>

      <div className="wm-panel p-3 mb-4 text-xs text-muted-foreground space-y-1">
        <p>TB Transparency: <span className="font-bold text-foreground">{o.avgTransparency}/100 ({o.avgGrade})</span></p>
        <p>Reports tuần này: <span className="font-bold text-foreground">{o.reportsThisWeek}</span> ({o.reportsConfirmed} confirmed)</p>
        <p>Auto-hidden: <span className="font-bold text-foreground">{o.autoHidden}</span></p>
      </div>

      {/* Flagged Intents */}
      <div className="wm-panel mb-4">
        <div className="wm-panel-header"><span className="wm-panel-title">Flagged Users</span></div>
        <div className="divide-y divide-[var(--wm-border-subtle,#2F3032)]">
          {BAD_ACTORS.map((ba) => (
            <div key={ba.userId} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('text-xs font-bold', ba.report.risk_level === 'high' ? 'text-red-400' : 'text-orange-400')}>
                  {ba.report.risk_level === 'high' ? '🔴 HIGH' : '🟠 MEDIUM'}
                </span>
                <span className="text-sm font-semibold text-foreground">{ba.name}</span>
                <span className="text-[10px] text-muted-foreground">Score: {ba.report.total_score}</span>
              </div>
              <div className="space-y-0.5 mb-2">
                {ba.report.signals.filter(s => s.score > 0).map((s, i) => (
                  <p key={i} className="text-[10px] text-[var(--wm-text-dim)]">• {s.evidence}</p>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 text-[10px] font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25">Ẩn tin</button>
                <button className="px-2 py-1 text-[10px] font-semibold bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25">Cảnh báo</button>
                <button className="px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground">OK</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Alerts */}
      <div className="wm-panel mb-4">
        <div className="wm-panel-header"><span className="wm-panel-title">Chat Alerts</span></div>
        <div className="divide-y divide-[var(--wm-border-subtle,#2F3032)]">
          {DEMO_CHAT_ALERTS.map((a, i) => (
            <div key={i} className="p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-foreground">{a.evidence}</p>
                <p className="text-[10px] text-muted-foreground">User: {a.user} (Grade {a.grade})</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparency Distribution */}
      <div className="wm-panel p-3 mb-4">
        <p className="wm-panel-title mb-3">Transparency Distribution</p>
        <div className="space-y-1.5">
          {(Object.entries(o.gradeDistribution) as [string, number][]).map(([grade, count]) => {
            const cfg = GRADE_CONFIG[grade as keyof typeof GRADE_CONFIG];
            const pct = (count / 50) * 100;
            return (
              <div key={grade} className="flex items-center gap-2">
                <span className="text-xs font-bold w-6" style={{ color: cfg.color }}>{grade}</span>
                <div className="flex-1 h-3 bg-[var(--wm-border)]">
                  <div className="h-full" style={{ width: `${pct}%`, background: cfg.color }} />
                </div>
                <span className="tabular-nums text-xs text-muted-foreground w-16 text-right">{count} ({Math.round(pct)}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broker Registry */}
      <div className="wm-panel">
        <div className="wm-panel-header"><span className="wm-panel-title">Broker Registry</span></div>
        <div className="p-3 space-y-2">
          <div>
            <p className="text-xs text-foreground font-semibold mb-1">Đã khai báo ({o.brokersDeclared})</p>
            <div className="flex items-center gap-2 p-2 bg-blue-500/5 border-l-2 border-blue-500">
              <span className="text-[10px] font-bold text-blue-400">🔵</span>
              <span className="text-xs text-foreground">Trần Thanh Hằng (ABC Realty) — Grade A, 85/100</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-foreground font-semibold mb-1">Nghi ngờ ({o.brokersSuspected})</p>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">• Nguyễn Văn Toàn — 8 CÓ, 5 quận, no declare</p>
              <p className="text-[10px] text-muted-foreground">• Phạm Đức Long — 10 CẦN, redirect in chat</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
