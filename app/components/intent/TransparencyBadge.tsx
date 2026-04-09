'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GRADE_CONFIG, type TransparencyGrade, type TransparencyProfile } from '@/lib/agents/transparency-score';

interface Props {
  profile: TransparencyProfile;
  compact?: boolean;
}

export function TransparencyBadge({ profile, compact = true }: Props) {
  const [showPopup, setShowPopup] = useState(false);
  const cfg = GRADE_CONFIG[profile.grade];

  if (compact) {
    return (
      <>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPopup(true); }}
          className={cn('wm-badge text-[10px] font-bold cursor-pointer', cfg.bg)}
          style={{ color: cfg.color, border: `1px solid ${cfg.color}30` }}
        >
          {profile.grade} {cfg.label}
        </button>
        {showPopup && <TransparencyPopup profile={profile} onClose={() => setShowPopup(false)} />}
      </>
    );
  }

  return (
    <div className="wm-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--wm-text-muted)]">Điểm minh bạch</span>
        <span className="tabular-nums text-lg font-bold" style={{ color: cfg.color }}>{profile.total}<span className="text-xs text-[var(--wm-text-muted)] font-normal">/100</span></span>
      </div>
      <div className="w-full h-2 bg-[var(--wm-border)] mb-2">
        <div className="h-full transition-all" style={{ width: `${profile.total}%`, background: cfg.color }} />
      </div>
      <div className="space-y-1.5">
        <ScoreBar label="Danh tính" score={profile.identity_score} max={25} color={cfg.color} />
        <ScoreBar label="Hành vi" score={profile.behavior_score} max={35} color={cfg.color} />
        <ScoreBar label="Lịch sử" score={profile.history_score} max={25} color={cfg.color} />
        <ScoreBar label="Cộng đồng" score={profile.community_score} max={15} color={cfg.color} />
      </div>
      {profile.highlights.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {profile.highlights.map((h, i) => (
            <p key={i} className="text-[10px] text-[var(--wm-text-dim)]">{h.startsWith('⚠') ? h : `✅ ${h}`}</p>
          ))}
        </div>
      )}
      {profile.improvement && (
        <p className="text-[10px] text-[var(--wm-primary)] mt-2">💡 {profile.improvement}</p>
      )}
    </div>
  );
}

function ScoreBar({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--wm-text-muted)] w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[var(--wm-border)]">
        <div className="h-full" style={{ width: `${(score / max) * 100}%`, background: color }} />
      </div>
      <span className="text-[10px] tabular-nums text-[var(--wm-text-dim)] w-10 text-right">{score}/{max}</span>
    </div>
  );
}

function TransparencyPopup({ profile, onClose }: { profile: TransparencyProfile; onClose: () => void }) {
  const cfg = GRADE_CONFIG[profile.grade];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative wm-panel p-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 p-1"><X className="w-4 h-4 text-[var(--wm-text-muted)]" /></button>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold" style={{ color: cfg.color }}>{profile.grade}</span>
          <span className="text-sm text-[var(--wm-text)]">Điểm minh bạch: {profile.total}/100</span>
        </div>
        <TransparencyBadge profile={profile} compact={false} />
      </div>
    </div>
  );
}
