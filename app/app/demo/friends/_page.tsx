'use client';

import { useState } from 'react';
import { Users, UserPlus, X, Star, Handshake, MapPin, ShieldCheck } from 'lucide-react';
import { BottomNav } from '@/components/intent/BottomNav';
import { cn } from '@/lib/utils';
import { MOCK_USERS } from '@/lib/mock/intents';

const suggestions = [
  { user: MOCK_USERS[1], reason: 'Cùng quan tâm BĐS Quận 7', match: 87, detail: '3 tin chung · 2 match chung', intents: 10, deals: 4, districts: ['Q7', 'Bình Thạnh'] },
  { user: MOCK_USERS[4], reason: 'Đang bán đúng thứ bạn tìm (3PN Q7)', match: 82, detail: 'Top seller · Trust 4.8', intents: 15, deals: 8, districts: ['Q7', 'Thủ Đức'] },
  { user: MOCK_USERS[6], reason: 'Cùng tìm nhà phố Gò Vấp', match: 75, detail: 'Đã xác thực · 5 match', intents: 8, deals: 3, districts: ['Gò Vấp'] },
  { user: MOCK_USERS[2], reason: 'Cho thuê khu vực Thủ Đức', match: 68, detail: 'KYC · 4 tin đăng', intents: 4, deals: 0, districts: ['Thủ Đức'] },
  { user: MOCK_USERS[5], reason: 'Cùng quan tâm căn hộ Thủ Đức', match: 65, detail: 'Active buyer · 6 tin', intents: 6, deals: 1, districts: ['Thủ Đức', 'Q2'] },
];

export default function FriendsPage() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const visible = suggestions.filter((s) => !dismissed.has(s.user.id));

  return (
    <div className="pb-20 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Handshake className="w-5 h-5 text-[var(--wm-primary)]" />
          <h1 className="text-lg font-bold text-foreground">Kết nối nhu cầu</h1>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{visible.length} gợi ý</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        AI gợi ý kết nối dựa trên intent của bạn. Kết nối để nhận thông báo khi có tin mới.
      </p>

      {visible.length === 0 ? (
        <div className="wm-panel p-8 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-[var(--wm-text-faint)]" />
          <p className="text-sm text-muted-foreground">Không có gợi ý kết nối mới</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((s) => {
            const isConnected = connected.has(s.user.id);
            const avatarBg = s.user.verification_level === 'verified' ? 'bg-emerald-600'
              : s.user.verification_level === 'kyc' ? 'bg-blue-600' : 'bg-zinc-600';

            return (
              <div key={s.user.id} className="wm-panel overflow-hidden">
                {/* Match percentage bar */}
                <div className="h-0.5 bg-[var(--wm-border)]">
                  <div
                    className="h-full bg-[var(--wm-primary)] transition-all"
                    style={{ width: `${s.match}%` }}
                  />
                </div>

                <div className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0', avatarBg)}>
                      {s.user.name.split(' ').slice(-1)[0][0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-semibold text-foreground truncate">{s.user.name}</span>
                        {s.user.verification_level === 'verified' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="tabular-nums text-xs font-bold text-[var(--wm-primary)] shrink-0 ml-auto">
                          {s.match}%
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-1">{s.reason}</p>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 text-[10px] text-[var(--wm-text-faint)]">
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {s.user.trust_score.toFixed(1)}
                        </span>
                        <span>{s.intents} tin</span>
                        <span>{s.deals} deal</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {s.districts.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2.5 ml-14">
                    {isConnected ? (
                      <span className="text-xs text-emerald-400 font-semibold animate-in fade-in">✅ Đã kết nối — sẽ nhận thông báo tin mới</span>
                    ) : (
                      <button
                        onClick={() => setConnected((prev) => new Set([...prev, s.user.id]))}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--wm-primary)] text-white hover:opacity-90 transition-opacity"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Kết nối
                      </button>
                    )}
                    <button
                      onClick={() => setDismissed((prev) => new Set([...prev, s.user.id]))}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[var(--wm-surface-hover)] transition-colors"
                    >
                      Bỏ qua
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
