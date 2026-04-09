'use client'

import Link from 'next/link'
import { TrendingUp, Handshake, ShieldCheck, Star } from 'lucide-react'
import { MOCK_USERS } from '@/lib/mock/intents'

export function DemoRightSidebar() {
  // Top sellers by trust score
  const topUsers = [...MOCK_USERS]
    .sort((a, b) => b.trust_score - a.trust_score)
    .slice(0, 5)

  return (
    <aside className="hidden xl:block w-[360px] shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden sidebar-scroll pr-2">
      <div className="py-4 px-1">
        {/* Market Summary */}
        <div className="mb-4">
          <h3 className="text-muted-foreground text-sm font-semibold flex items-center gap-2 px-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
            Thị trường HCM
          </h3>
          <div className="space-y-2 px-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quận 7</span>
              <span className="text-foreground font-medium">12 CẦN · 5 CÓ</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Thủ Đức</span>
              <span className="text-foreground font-medium">8 CẦN · 4 CÓ</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gò Vấp</span>
              <span className="text-foreground font-medium">6 CẦN · 3 CÓ</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bình Thạnh</span>
              <span className="text-foreground font-medium">5 CẦN · 4 CÓ</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border mx-2 my-3" />

        {/* Top Trusted Users */}
        <div className="mb-4">
          <h3 className="text-muted-foreground text-sm font-semibold flex items-center gap-2 px-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
            Người bán uy tín
          </h3>
          <div className="space-y-1">
            {topUsers.map((user, i) => (
              <Link
                key={user.id}
                href="/demo/profile"
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <span className="w-5 text-xs font-bold text-muted-foreground text-center">#{i + 1}</span>
                <div className="w-8 h-8 bg-[#2D6A4F] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.name.split(' ').slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-400" />
                      {user.trust_score.toFixed(1)}
                    </span>
                    {user.verification_level === 'verified' && (
                      <span className="text-emerald-400">✅</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-px bg-border mx-2 my-3" />

        {/* Quick Stats */}
        <div className="px-2">
          <h3 className="text-muted-foreground text-sm font-semibold flex items-center gap-2 mb-3">
            <Handshake className="w-4 h-4 text-[#2D6A4F]" />
            Hôm nay
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#2D6A4F]">17</div>
              <div className="text-[11px] text-muted-foreground">Match mới</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#2D6A4F]">8</div>
              <div className="text-[11px] text-muted-foreground">Chat khởi tạo</div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground text-center mt-6 px-2">
          CẦN & CÓ © 2026 · Đăng nhu cầu. AI kết nối.
        </div>
      </div>
    </aside>
  )
}
