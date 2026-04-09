'use client';

import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/intent-utils';
import type { IntentPrediction } from '@/lib/agents/predictions';

const COMPETITION_CONFIG = {
  low: { label: 'Thấp', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Trung bình', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  high: { label: 'Cao', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  very_high: { label: 'Rất cao', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

export function PredictionCard({ prediction }: { prediction: IntentPrediction }) {
  const comp = COMPETITION_CONFIG[prediction.competition_level];

  return (
    <div className="wm-panel" style={{ borderTop: '2px solid', borderImage: 'linear-gradient(to right, #7c3aed, #2563EB) 1' }}>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm">🔮</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">Dự đoán AI</span>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-blue-500/10 border border-blue-500/20 p-2 text-center">
            <div className="tabular-nums text-sm font-bold text-blue-400">
              {prediction.match_time_days.min}-{prediction.match_time_days.max}
            </div>
            <div className="text-[9px] text-[var(--wm-text-muted)]">ngày match</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 p-2 text-center">
            <div className="tabular-nums text-sm font-bold text-purple-400">
              {prediction.match_probability_7d}%
            </div>
            <div className="text-[9px] text-[var(--wm-text-muted)]">xác suất 7 ngày</div>
          </div>
          <div className={cn('p-2 text-center border', comp.bg, comp.border)}>
            <div className={cn('text-sm font-bold', comp.color)}>
              {comp.label}
            </div>
            <div className="text-[9px] text-[var(--wm-text-muted)]">cạnh tranh</div>
          </div>
        </div>

        {/* Price Suggestion */}
        {prediction.price_suggestion && (
          <div className="p-2 bg-emerald-500/5 border-l-2 border-emerald-500/30 mb-3">
            <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">💰 Gợi ý giá tối ưu</p>
            <p className="text-xs text-[var(--wm-text)]">
              <span className="tabular-nums font-bold">{formatPrice(prediction.price_suggestion.min)} - {formatPrice(prediction.price_suggestion.max)}</span>
            </p>
            <p className="text-[10px] text-[var(--wm-text-muted)]">{prediction.price_suggestion.reason}</p>
          </div>
        )}

        {/* Tips */}
        {prediction.tips.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[var(--wm-text-muted)] mb-1">💡 Mẹo tăng cơ hội match</p>
            <ul className="space-y-1">
              {prediction.tips.map((tip, i) => (
                <li key={i} className="text-xs text-[var(--wm-text-secondary)] flex items-start gap-1.5">
                  <span className="text-[var(--wm-text-faint)]">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** Mini prediction for ComposeIntent */
export function MiniPrediction({ prediction }: { prediction: IntentPrediction }) {
  const comp = COMPETITION_CONFIG[prediction.competition_level];

  return (
    <div className="flex items-center gap-3 text-xs text-[var(--wm-text-dim)] py-1">
      <span>🔮</span>
      <span>Match ~{prediction.match_time_days.min}-{prediction.match_time_days.max} ngày</span>
      <span className="text-[var(--wm-text-faint)]">·</span>
      <span>{prediction.match_probability_7d}% xác suất</span>
      <span className="text-[var(--wm-text-faint)]">·</span>
      <span className={comp.color}>{comp.label}</span>
    </div>
  );
}
