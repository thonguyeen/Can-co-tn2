'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FraudReport } from '@/lib/agents/fraud-detector';

export function FraudWarning({ report }: { report: FraudReport }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || report.risk_level === 'clean' || report.risk_level === 'low') return null;

  const isHigh = report.risk_level === 'high' || report.risk_level === 'critical';
  const topSignals = report.signals.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div className={cn('p-2.5 text-xs', isHigh ? 'bg-red-500/10 border-l-2 border-red-500' : 'bg-yellow-500/10 border-l-2 border-yellow-500')}>
      <div className="flex items-start gap-2">
        <AlertTriangle className={cn('w-4 h-4 shrink-0 mt-0.5', isHigh ? 'text-red-400' : 'text-yellow-400')} />
        <div className="flex-1">
          <p className={cn('font-semibold mb-1', isHigh ? 'text-red-400' : 'text-yellow-400')}>
            {isHigh ? 'Tin này có dấu hiệu bất thường' : 'Lưu ý khi liên hệ'}
          </p>
          <ul className="space-y-0.5 text-[var(--wm-text-dim)]">
            {topSignals.map((s, i) => <li key={i}>• {s.evidence}</li>)}
          </ul>
          <div className="flex gap-2 mt-1.5">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }} className="text-[10px] text-[var(--wm-text-muted)] hover:text-[var(--wm-text)]">Tôi hiểu</button>
          </div>
        </div>
      </div>
    </div>
  );
}
