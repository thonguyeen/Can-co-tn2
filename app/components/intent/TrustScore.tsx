'use client';

import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreProps {
  score: number; // 0-5
  verifications?: { cccd: boolean; sodo: boolean; gps: boolean };
  stats?: { intents: number; matches: number };
  compact?: boolean;
}

export function TrustScore({ score, verifications, stats, compact = false }: TrustScoreProps) {
  const pct = (score / 5) * 100;
  const color = score >= 3.5 ? 'text-emerald-400' : score >= 2 ? 'text-yellow-400' : 'text-red-400';
  const barColor = score >= 3.5 ? 'bg-emerald-500' : score >= 2 ? 'bg-yellow-500' : 'bg-red-500';
  const level = score >= 4 ? 'Chủ xác thực' : score >= 3 ? 'Đã KYC' : 'Chưa xác thực';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={cn('tabular-nums font-bold text-sm', color)}>{score.toFixed(1)}</span>
        <div className="w-16 h-1.5 bg-[var(--wm-border)] rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="wm-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="wm-panel-title">Trust Score</span>
        <span className={cn('tabular-nums text-xl font-bold', color)}>
          {score.toFixed(1)} <span className="text-xs text-[var(--wm-text-muted)] font-normal">/ 5</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[var(--wm-border)] rounded-full overflow-hidden mb-3">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>

      <p className="text-xs text-[var(--wm-text-muted)] mb-3">{level}</p>

      {/* Verification icons */}
      {verifications && (
        <div className="flex items-center gap-3 mb-3">
          <VerifyIcon done={verifications.cccd} label="CCCD" />
          <VerifyIcon done={verifications.sodo} label="Sổ đỏ" />
          <VerifyIcon done={verifications.gps} label="GPS" />
        </div>
      )}

      {/* Activity */}
      {stats && (
        <p className="text-xs text-[var(--wm-text-dim)]">
          {stats.intents} tin đăng · {stats.matches} match thành
        </p>
      )}
    </div>
  );
}

function VerifyIcon({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={cn('flex items-center gap-1 text-xs', done ? 'text-emerald-400' : 'text-[var(--wm-text-faint)]')}>
      {done ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );
}
