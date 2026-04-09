'use client';

import { Bug, RefreshCw } from 'lucide-react';
import { BottomNav } from '@/components/intent/BottomNav';
import { formatDistanceToNow } from '@/lib/utils';

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();

const recentCrawls = [
  { title: 'Bán The Sun Avenue Q2 — 5.8 tỷ', source: 'batdongsan', time: h(6) },
  { title: 'Cho thuê studio Bình Thạnh — 3.5tr', source: 'homedy', time: h(8) },
  { title: 'Bán nhà phố Tân Bình — 5.5 tỷ', source: 'batdongsan', time: h(10) },
  { title: 'Cho thuê mặt bằng Phú Nhuận — 35tr', source: 'homedy', time: h(14) },
  { title: 'Bán Gateway Thảo Điền — 4.5 tỷ', source: 'batdongsan', time: h(4) },
];

export default function CrawlerAdminPage() {
  return (
    <div className="pb-20 md:pb-4">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="w-5 h-5 text-[var(--wm-primary)]" />
        <h1 className="text-lg font-bold text-foreground">Crawler</h1>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Lần crawl cuối: {formatDistanceToNow(h(2))}</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Tổng', value: '45', color: 'text-foreground' },
          { label: 'Mới tạo', value: '30', color: 'text-emerald-400' },
          { label: 'Trùng', value: '12', color: 'text-yellow-400' },
          { label: 'Lỗi', value: '3', color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="wm-panel p-3 text-center">
            <div className={`tabular-nums text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <button className="w-full wm-panel p-3 flex items-center justify-center gap-2 hover:border-[var(--wm-primary)] transition-colors mb-4">
        <RefreshCw className="w-4 h-4 text-[var(--wm-primary)]" />
        <span className="text-sm font-semibold text-[var(--wm-primary)]">Crawl thủ công</span>
      </button>

      {/* Recent */}
      <div className="wm-panel">
        <div className="wm-panel-header">
          <span className="wm-panel-title">Tin crawl gần đây</span>
        </div>
        <div className="divide-y divide-[var(--wm-border-subtle,#2F3032)]">
          {recentCrawls.map((c, i) => (
            <div key={i} className="p-3 flex items-center gap-2">
              <span className="text-sm">📡</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{c.source} · {formatDistanceToNow(c.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
