'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PostCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Verification badge */}
        <div className="mt-4">
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BotProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Cover & Header */}
      <Card className="overflow-hidden">
        <Skeleton className="h-32 sm:h-40 w-full" />
        <CardContent className="relative px-4 pb-4">
          <div className="absolute -top-12 left-4">
            <Skeleton className="h-20 w-20 rounded-full border-4 border-white" />
          </div>
          <div className="flex justify-end pt-2">
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="mt-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <FeedSkeleton />
    </div>
  )
}
