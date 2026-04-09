'use client';

import { BarChart3 } from 'lucide-react';
import { BottomNav } from '@/components/intent/BottomNav';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/intent-utils';
import { DEMO_METRICS } from '@/lib/mock/analytics';

const m = DEMO_METRICS;

function StatBox({ label, value, color = 'text-foreground' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="wm-panel p-3 text-center">
      <div className={cn('tabular-nums text-lg font-bold', color)}>{value}</div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

function FunnelBar({ label, value, max, pct }: { label: string; value: number; max: number; pct: string }) {
  const width = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 text-right shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-[var(--wm-surface-hover)] relative overflow-hidden">
        <div className="h-full bg-[var(--wm-primary)] transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="tabular-nums text-xs font-bold text-foreground w-12 text-right shrink-0">{value}</span>
      <span className="text-[10px] text-muted-foreground w-10 shrink-0">({pct})</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const f = m.funnel;

  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-[var(--wm-primary)]" />
        <h1 className="text-lg font-bold text-foreground">Analytics Dashboard</h1>
      </div>

      {/* Core Metric */}
      <div className="wm-panel p-4 mb-4" style={{ borderTop: '3px solid var(--wm-primary)' }}>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Core Metric</p>
        <div className="flex items-end gap-3 mb-2">
          <span className="text-3xl font-bold text-foreground tabular-nums">{m.match_to_chat_rate}%</span>
          <span className="text-sm text-muted-foreground mb-1">Match → Chat Rate</span>
          <span className="wm-badge wm-badge-normal text-[8px] mb-1.5">✅ ON TRACK</span>
        </div>
        <div className="w-full h-2.5 bg-[var(--wm-surface-hover)] mb-1">
          <div className="h-full bg-emerald-500" style={{ width: `${m.match_to_chat_rate * 5}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground">Target: &gt;20% · {m.total_matches} matches → {m.matches_to_chat} chats</p>
      </div>

      {/* Volume */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatBox label="Intents" value={m.total_intents} />
        <StatBox label="CẦN" value={m.total_can} color="text-red-400" />
        <StatBox label="CÓ" value={m.total_co} color="text-emerald-400" />
        <StatBox label="Crawled" value={m.total_crawled} color="text-cyan-400" />
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatBox label="Users" value={m.total_users} />
        <StatBox label="Matches" value={m.total_matches} />
        <StatBox label="Messages" value={m.total_messages} />
        <StatBox label="Verified" value={`${m.verified_intent_pct}%`} color="text-emerald-400" />
      </div>

      {/* Funnel */}
      <div className="wm-panel p-4 mb-4">
        <p className="wm-panel-title mb-3">Funnel</p>
        <div className="space-y-2">
          <FunnelBar label="Visit" value={f.visitors} max={f.visitors} pct="" />
          <FunnelBar label="Register" value={f.registered} max={f.visitors} pct={`${Math.round(f.registered / f.visitors * 100)}%`} />
          <FunnelBar label="Post" value={f.posted} max={f.visitors} pct={`${Math.round(f.posted / f.registered * 100)}%`} />
          <FunnelBar label="Match" value={f.matched} max={f.visitors} pct={`${Math.round(f.matched / f.posted * 100)}%`} />
          <FunnelBar label="Chat" value={f.chatted} max={f.visitors} pct={`${Math.round(f.chatted / f.matched * 100)}%`} />
          <FunnelBar label="Deal" value={f.deals} max={f.visitors} pct={`${Math.round(f.deals / f.chatted * 100)}%`} />
        </div>
      </div>

      {/* Districts */}
      <div className="wm-panel mb-4">
        <div className="wm-panel-header"><span className="wm-panel-title">Districts</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="text-left p-2">Quận</th>
                <th className="text-right p-2">CẦN</th>
                <th className="text-right p-2">CÓ</th>
                <th className="text-right p-2">Ratio</th>
                <th className="text-right p-2">TB Giá</th>
                <th className="text-right p-2">Match%</th>
              </tr>
            </thead>
            <tbody>
              {m.district_stats.map((d) => (
                <tr key={d.district} className="border-t border-[var(--wm-border-subtle,#2F3032)]">
                  <td className="p-2 font-medium text-foreground">{d.district}</td>
                  <td className="p-2 text-right tabular-nums text-red-400">{d.can}</td>
                  <td className="p-2 text-right tabular-nums text-emerald-400">{d.co}</td>
                  <td className="p-2 text-right tabular-nums">{d.ratio.toFixed(1)}x</td>
                  <td className="p-2 text-right tabular-nums">{formatPrice(d.avgPrice)}</td>
                  <td className="p-2 text-right tabular-nums">{d.matchRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Performance */}
      <div className="wm-panel p-4 mb-4">
        <p className="wm-panel-title mb-3">AI Performance</p>
        <p className="text-xs text-muted-foreground mb-2">🤖 {m.total_bot_comments} bot comments tổng</p>
        <div className="space-y-1.5">
          {m.bot_stats.map((b) => (
            <div key={b.name} className="flex items-center gap-2">
              <span className="text-sm w-5">{b.avatar}</span>
              <span className="text-xs text-foreground flex-1">{b.name}</span>
              <div className="w-24 h-1.5 bg-[var(--wm-surface-hover)]">
                <div className="h-full bg-[var(--wm-primary)]" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="tabular-nums text-xs text-muted-foreground w-8 text-right">{b.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
          <p>📊 Knowledge Graph: {m.total_knowledge_edges} edges</p>
          <p>⏱ Avg match time: {(m.avg_match_time_hours / 24).toFixed(1)} ngày</p>
        </div>
      </div>

      {/* Trends */}
      <div className="wm-panel p-4">
        <p className="wm-panel-title mb-3">Trends (vs tuần trước)</p>
        <div className="space-y-2">
          {[
            { label: 'Intents', value: m.trends.intents },
            { label: 'Matches', value: m.trends.matches },
            { label: 'Chats', value: m.trends.chats },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground w-16">{t.label}</span>
              <span className={cn('font-bold tabular-nums', t.value > 0 ? 'text-emerald-400' : 'text-red-400')}>
                {t.value > 0 ? '+' : ''}{t.value}% {t.value > 0 ? '↑' : '↓'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
