'use client';

import { useState } from 'react';
import { Calendar, Handshake, Lock } from 'lucide-react';
import { IntentCard } from '@/components/intent/IntentCard';
import { TrustScore } from '@/components/intent/TrustScore';
import { BottomNav } from '@/components/intent/BottomNav';
import { cn, formatDistanceToNow } from '@/lib/utils';
import {
  MOCK_PROFILE,
  MOCK_RATINGS,
  MOCK_ACHIEVEMENTS,
  USER_CAN_INTENTS,
  USER_CO_INTENTS,
  type Achievement,
} from '@/lib/mock/profile';

type TabKey = 'can' | 'co' | 'match' | 'rating' | 'achievement';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'can', label: 'Tin CẦN' },
  { key: 'co', label: 'Tin CÓ' },
  { key: 'match', label: 'Match' },
  { key: 'rating', label: 'Đánh giá' },
  { key: 'achievement', label: 'Thành tích' },
];

function StarsDisplay({ stars }: { stars: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  );
}

function AchievementCard({ a }: { a: Achievement }) {
  return (
    <div className={cn(
      'wm-panel p-3 flex items-start gap-3',
      !a.earned && 'opacity-50',
    )}>
      <span className={cn('text-2xl', !a.earned && 'grayscale')}>{a.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--wm-text)]">{a.name}</p>
        <p className="text-[10px] text-[var(--wm-text-muted)] line-clamp-1">{a.description}</p>
        {a.earned && a.earned_at && (
          <p className="text-[9px] text-[var(--wm-text-faint)] mt-0.5">Đạt {formatDistanceToNow(a.earned_at)}</p>
        )}
        {!a.earned && a.hint && (
          <p className="text-[9px] text-[var(--wm-text-faint)] mt-0.5 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> {a.hint}
          </p>
        )}
      </div>
      {a.earned && <span className="wm-badge wm-badge-normal text-[8px]">Đạt</span>}
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-sm mb-0.5">{icon}</div>
      <div className="tabular-nums text-sm font-bold text-[var(--wm-text)]">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-[var(--wm-text-muted)] font-semibold">{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('co');
  const p = MOCK_PROFILE;
  const avgRating = MOCK_RATINGS.reduce((s, r) => s + r.stars, 0) / MOCK_RATINGS.length;
  const earnedCount = MOCK_ACHIEVEMENTS.filter((a) => a.earned).length;

  return (
    <div className="pb-20 md:pb-4">
      {/* Profile Header */}
      <div className="wm-panel mb-3">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {p.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-[var(--wm-text)]">{p.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  'wm-badge text-[8px]',
                  p.verification_level === 'verified' ? 'wm-badge-normal' : 'wm-badge-elevated',
                )}>
                  {p.verification_level === 'verified' ? '✅ Chủ xác thực' : 'Chưa xác thực'}
                </span>
                <TrustScore score={p.trust_score} compact />
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--wm-text-muted)]">
                <span>📱 {p.phone}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Tham gia 01/2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="border-t border-[var(--wm-border)] px-4 py-3">
          <div className="flex items-center justify-around">
            <StatItem icon="🏠" value={p.stats.intents_posted} label="Tin đăng" />
            <div className="w-px h-8 bg-[var(--wm-border)]" />
            <StatItem icon="🤝" value={p.stats.matches} label="Ghép" />
            <div className="w-px h-8 bg-[var(--wm-border)]" />
            <StatItem icon="💬" value={p.stats.chats} label="Chat" />
            <div className="w-px h-8 bg-[var(--wm-border)]" />
            <StatItem icon="⭐" value={avgRating.toFixed(1)} label="Uy tín" />
            <div className="w-px h-8 bg-[var(--wm-border)]" />
            <StatItem icon="✅" value={`${p.stats.verified}/3`} label="Xác thực" />
          </div>
        </div>
      </div>

      {/* Trust Score Detail */}
      <div className="mb-3">
        <TrustScore
          score={p.trust_score}
          verifications={p.verifications}
          stats={{ intents: p.stats.intents_posted, matches: p.stats.matches }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-[2px] mb-3 border-b border-[var(--wm-border)] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.key
                ? 'border-[var(--wm-primary)] text-[var(--wm-accent)] font-semibold'
                : 'border-transparent text-[var(--wm-text-dim)] hover:text-[var(--wm-text)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'can' && (
        <div className="space-y-3">
          {USER_CAN_INTENTS.length > 0 ? (
            USER_CAN_INTENTS.map((i) => <IntentCard key={i.id} intent={i} basePath="/demo" />)
          ) : (
            <Empty text="Chưa có tin CẦN nào" />
          )}
        </div>
      )}

      {activeTab === 'co' && (
        <div className="space-y-3">
          {USER_CO_INTENTS.length > 0 ? (
            USER_CO_INTENTS.map((i) => <IntentCard key={i.id} intent={i} basePath="/demo" />)
          ) : (
            <Empty text="Chưa có tin CÓ nào" />
          )}
        </div>
      )}

      {activeTab === 'match' && (
        <div className="wm-panel p-4 text-center">
          <Handshake className="w-6 h-6 mx-auto mb-2 text-[var(--wm-text-faint)]" />
          <p className="text-sm text-[var(--wm-text-muted)]">{p.stats.matches} match thành công</p>
          <p className="text-xs text-[var(--wm-text-faint)] mt-1">Lịch sử match chi tiết sắp có</p>
        </div>
      )}

      {activeTab === 'rating' && (
        <div className="space-y-2">
          <div className="wm-panel p-3 flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-[var(--wm-text)]">
              ⭐ {avgRating.toFixed(1)} <span className="text-xs text-[var(--wm-text-muted)] font-normal">từ {MOCK_RATINGS.length} đánh giá</span>
            </span>
          </div>
          {MOCK_RATINGS.map((r) => (
            <div key={r.id} className="wm-panel p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--wm-text)]">{r.from_user.name}</span>
                <StarsDisplay stars={r.stars} />
              </div>
              <p className="text-sm text-[var(--wm-text-secondary)] leading-relaxed mb-1">{r.comment}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--wm-text-faint)]">📌 {r.intent_title}</span>
                <span className="text-[10px] text-[var(--wm-text-faint)]">{formatDistanceToNow(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievement' && (
        <div>
          <div className="wm-panel p-3 flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--wm-text)]">
              🏆 {earnedCount}/{MOCK_ACHIEVEMENTS.length} thành tích
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MOCK_ACHIEVEMENTS.map((a) => (
              <AchievementCard key={a.id} a={a} />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="wm-panel p-6 text-center">
      <p className="text-xs text-[var(--wm-text-muted)]">{text}</p>
    </div>
  );
}
