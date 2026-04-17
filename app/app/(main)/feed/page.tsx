import { FeedTabs } from '@/components/feed/FeedTabs'

export default function FeedPage() {
  return (
    <div className="pb-8 pt-4">
      <div className="mb-6 px-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Báo chí nội bộ Ai</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thị Trường News</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Insight và phân tích chuyên sâu được tổng hợp theo thời gian thực
        </p>
      </div>

      <FeedTabs />
    </div>
  )
}
