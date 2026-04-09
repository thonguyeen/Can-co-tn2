'use client';

import React from 'react';
import {
  Bot, Activity, TrendingUp, Sparkles
} from 'lucide-react';
import { type MockIntent } from '@/lib/mock/intents';
import { DEMO_INSIGHTS } from '@/lib/mock/insights';

interface FeedObserverPanelProps {
  activeIntent: MockIntent | null;
}

export default function FeedObserverPanel({ activeIntent }: FeedObserverPanelProps) {
  const currentInsightIdx = activeIntent ? (activeIntent.id.length % DEMO_INSIGHTS.length) : 0;
  const currentInsight = DEMO_INSIGHTS[currentInsightIdx];
  const trustScore = activeIntent ? 85 + (activeIntent.id.length % 15) : 95;

  return (
    <div className="hidden xl:flex flex-col w-[380px] border-l border-slate-200 bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.03)] z-20 shrink-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Brain AI Analytics</h3>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Trực Tiếp
            </p>
          </div>
        </div>

        {activeIntent ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both space-y-6">

            {/* Preview Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex gap-4 items-center">
              <div className="w-14 h-14 rounded-xl bg-slate-200 shadow-sm flex items-center justify-center font-black text-slate-300 text-sm shrink-0 border border-slate-100 overflow-hidden relative">
                <img
                  src={activeIntent.type === 'CO' ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=60' : 'https://images.unsplash.com/photo-1628611225249-6c3c7c689552?w=200&q=60'}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute font-bold uppercase tracking-wider top-0 right-0 bg-indigo-600 text-white text-[8px] px-1 py-0.5 rounded-bl-md z-10">{activeIntent.type}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-800 line-clamp-2">{activeIntent.title}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{activeIntent.price?.toLocaleString() || activeIntent.price_min?.toLocaleString() || 'Thỏa thuận'} VNĐ</div>
              </div>
            </div>

            {/* Trust Score */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h4 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-indigo-500" /> Đánh Giá An Toàn (Kyc)
              </h4>
              <div className="flex justify-between items-baseline mb-3">
                <div className="text-4xl font-black text-slate-800 tracking-tighter">{trustScore}<span className="text-xl text-slate-400">%</span></div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Uy tín cao</div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${trustScore}%` }} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Hệ thống phân tích 15 bài đăng của SĐT này. Kết luận: Người dùng lâu năm, chưa từng bị report rác.
              </p>
            </div>

            {/* Price Context */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h4 className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Đo Lường Giá Trị
              </h4>
              <div className="flex items-center gap-3 mb-5 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <div className="flex-1">
                  <div className="text-xs text-blue-600 font-semibold mb-0.5">Mức Giá Đang Chào</div>
                  <div className="text-lg font-black text-blue-700">Rẻ hơn 12%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-400">so với trung bình</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                    <span>Căn này</span>
                    <span className="text-slate-700">3.5 Tỷ</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[70%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                    <span>Sàn Khu Vực Phường</span>
                    <span className="text-slate-700">4.1 Tỷ</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full w-[85%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Match Advisor Insight */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 shadow-xl shadow-indigo-500/20 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 blur-2xl rounded-full" />
              <h4 className="text-[11px] text-indigo-200 uppercase tracking-widest font-bold mb-3 flex items-center gap-2 relative z-10">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Chiến Lược Giao Dịch
              </h4>
              <h5 className="text-lg font-bold mb-2 relative z-10 leading-snug">{currentInsight?.district ? `Phân Tích ${currentInsight.district}` : 'Đề Xuất Khớp Lệnh'}</h5>
              <p className="text-sm text-indigo-100 leading-relaxed relative z-10 font-medium">
                {currentInsight?.suggestions?.buyer || 'Thuật toán phát hiện căn nhà này đang bị bán dưới giá trị thực. Chốt ngay kẻo lỡ!'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 relative z-10">
                <span className="text-[10px] font-bold bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-md">#BĐS_ĐầuTư</span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-md">#Gấp</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 pt-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Chờ Tín Hiệu...</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">Rê chuột vào một bài đăng bất kỳ để hệ thống đo lường dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
}
