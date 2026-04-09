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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <TabsList className="flex-1 grid grid-cols-3">
          <TabsTrigger value="foryou">Dành cho bạn</TabsTrigger>
          <TabsTrigger value="following">Đang theo dõi</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0 gap-1.5"
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
