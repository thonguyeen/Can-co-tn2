'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { formatPrice } from '@/lib/intent-utils';
import type { MarketInsight } from '@/lib/mock/insights';

const TREND_CONFIG = {
  hot: { label: '🔥 Rất hot', color: 'text-red-400' },
  increasing: { label: '📈 Tăng', color: 'text-orange-400' },
  stable: { label: '➡️ Ổn định', color: 'text-blue-400' },
  decreasing: { label: '📉 Giảm', color: 'text-emerald-400' },
};

export function InsightCard({ insight }: { insight: MarketInsight }) {
  const trend = TREND_CONFIG[insight.trend];
  const accentColor = '#7c3aed'; // Market Analyst purple

  return (
    <div className="wm-panel border-l-2" style={{ borderLeftColor: accentColor }}>
      {/* Header */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: `color-mix(in srgb, ${accentColor} 8%, transparent)` }}>
        <span className="text-sm">📊</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
          Market Analyst
        </span>
        <span className="text-[10px] text-[var(--wm-text-faint)]">· Phân tích thị trường · Tự động</span>
      </div>

      <div className="p-3">
        {/* Title */}
        <h3 className="text-sm font-bold text-[var(--wm-text)] mb-3">
          📊 Báo cáo: BĐS {insight.district}
        </h3>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-red-500/10 border border-red-500/20 p-2 text-center">
            <div className="tabular-nums text-lg font-bold text-red-400">{insight.can_count}</div>
            <div className="text-[9px] uppercase tracking-wider text-red-400/70 font-semibold">CẦN</div>
            <div className="text-[10px] text-[var(--wm-text-faint)]">đang tìm</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
            <div className="tabular-nums text-lg font-bold text-emerald-400">{insight.co_count}</div>
            <div className="text-[9px] uppercase tracking-wider text-emerald-400/70 font-semibold">CÓ</div>
            <div className="text-[10px] text-[var(--wm-text-faint)]">đang bán</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 p-2 text-center">
            <div className="tabular-nums text-lg font-bold text-purple-400">{insight.ratio.toFixed(1)}x</div>
            <div className="text-[9px] uppercase tracking-wider text-purple-400/70 font-semibold">Cầu/Cung</div>
            <div className={cn('text-[10px]', trend.color)}>{trend.label}</div>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="space-y-1.5 mb-3 text-xs text-[var(--wm-text-secondary)]">
          <p>• Giá trung bình CÓ: <span className="tabular-nums font-semibold text-[var(--wm-text)]">{formatPrice(insight.avg_co_price)}</span>/căn 2PN</p>
          <p>• Budget trung bình CẦN: <span className="tabular-nums font-semibold text-[var(--wm-text)]">{formatPrice(insight.avg_can_budget)}</span></p>
          <p>• Gap cung-cầu: <span className="font-medium">{insight.ratio > 2 ? 'người bán có lợi thế' : insight.ratio < 0.8 ? 'người mua có lợi thế' : 'cân bằng'}</span></p>
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="p-2 bg-blue-500/5 border-l-2 border-blue-500/30">
            <p className="text-[10px] font-semibold text-blue-400 mb-0.5">💡 Gợi ý người mua</p>
            <p className="text-xs text-[var(--wm-text-secondary)]">{insight.suggestions.buyer}</p>
          </div>
          <div className="p-2 bg-emerald-500/5 border-l-2 border-emerald-500/30">
            <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">💡 Gợi ý người bán</p>
            <p className="text-xs text-[var(--wm-text-secondary)]">{insight.suggestions.seller}</p>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-[9px] text-[var(--wm-text-faint)] text-right mt-2">
          Cập nhật {formatDistanceToNow(insight.created_at)}
        </p>
      </div>
    </div>
  );
}
