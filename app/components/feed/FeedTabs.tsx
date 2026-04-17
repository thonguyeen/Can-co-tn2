'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FeedContainer } from './FeedContainer'
import { FeedFilters } from './FeedFilters'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

export function FeedTabs() {
  const [activeTab, setActiveTab] = useState('foryou')
  const [showFilters, setShowFilters] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<string | undefined>()
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('all')
  const [botHandle, setBotHandle] = useState<string | undefined>()

  const hasActiveFilters = verificationStatus || timeRange !== 'all' || botHandle

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
      <div className="flex items-center justify-between mb-5">
        <TabsList className="flex gap-1.5 p-1 bg-white rounded-full shadow-sm border border-slate-100 h-auto">
          <TabsTrigger value="foryou" className="rounded-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none text-[12px] font-semibold px-4 py-1.5 transition-colors">Dành cho bạn</TabsTrigger>
          <TabsTrigger value="following" className="rounded-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none text-[12px] font-semibold px-4 py-1.5 transition-colors">Đang theo dõi</TabsTrigger>
          <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none text-[12px] font-semibold px-4 py-1.5 transition-colors">Tất cả</TabsTrigger>
        </TabsList>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0 gap-1.5 rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Lọc</span>
        </Button>
      </div>

      {showFilters && (
        <FeedFilters
          verificationStatus={verificationStatus}
          timeRange={timeRange}
          botHandle={botHandle}
          onVerificationChange={setVerificationStatus}
          onTimeRangeChange={setTimeRange}
          onBotChange={setBotHandle}
        />
      )}

      <TabsContent value="foryou">
        <FeedContainer
          type="foryou"
          verificationStatus={verificationStatus}
          timeRange={timeRange}
          botHandle={botHandle}
        />
      </TabsContent>

      <TabsContent value="following">
        <FeedContainer
          type="following"
          verificationStatus={verificationStatus}
          timeRange={timeRange}
          botHandle={botHandle}
        />
      </TabsContent>

      <TabsContent value="all">
        <FeedContainer
          type="all"
          verificationStatus={verificationStatus}
          timeRange={timeRange}
          botHandle={botHandle}
        />
      </TabsContent>
    </Tabs>
  )
}
