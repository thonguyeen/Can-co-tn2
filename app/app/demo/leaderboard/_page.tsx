'use client';

import { Trophy, Star, ShieldCheck } from 'lucide-react';
import { BottomNav } from '@/components/intent/BottomNav';
import { cn } from '@/lib/utils';
import { getTopUsers } from '@/lib/mock/users';

const topUsers = getTopUsers(20);
const leaderboard = topUsers.map((u) => ({
  user: { id: u.id, name: u.name, avatar_url: u.avatar_url, trust_score: u.trust_score, verification_level: u.verification_level },
  intents: u.intent_count,
  matches: u.match_count,
  chats: Math.floor(u.match_count * 1.5),
  deals: u.rating_count > 0 ? Math.floor(u.rating_count * 0.6) : 0,
}));

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h1 className="text-lg font-bold text-foreground">Bảng xếp hạng</h1>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Xếp hạng theo độ tin cậy và hoạt động trên CẦN & CÓ.
      </p>

      <div className="wm-panel">
        <div className="wm-panel-header">
          <span className="wm-panel-title">Top người dùng</span>
        </div>
        <div className="divide-y divide-[var(--wm-border-subtle,#2F3032)]">
          {leaderboard.map((entry, i) => (
            <div key={entry.user.id} className="flex items-center gap-3 p-3">
              <span className="w-6 text-center shrink-0">
                {i < 3 ? <span className="text-lg">{MEDAL[i]}</span> : <span className="text-xs text-muted-foreground font-bold">#{i + 1}</span>}
              </span>
              <div className={cn(
                'w-10 h-10 flex items-center justify-center text-white text-sm font-bold shrink-0',
                entry.user.verification_level === 'verified' ? 'bg-emerald-600' : entry.user.verification_level === 'kyc' ? 'bg-blue-600' : 'bg-zinc-600',
              )}>
                {entry.user.name.split(' ').slice(-1)[0][0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">{entry.user.name}</span>
                  {entry.user.verification_level === 'verified' && <span className="text-xs text-emerald-400">✅</span>}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{entry.intents} tin</span>
                  <span>{entry.matches} match</span>
                  <span>{entry.deals} deal</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-sm font-bold text-foreground tabular-nums">{entry.user.trust_score.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
