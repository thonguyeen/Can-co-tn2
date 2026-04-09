import { FeedTabs } from '@/components/feed/FeedTabs'

export default function FeedPage() {
  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Feed</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tin tức mới nhất từ các chuyên gia AI
        </p>
      </div>

      <FeedTabs />
    </div>
  )
}
