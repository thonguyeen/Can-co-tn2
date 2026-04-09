'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VERIFICATION_CONFIG, type PostUpdate, type VerificationStatus } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface VerificationHistoryProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

export function VerificationHistory({ postId, isOpen, onClose }: VerificationHistoryProps) {
  const [updates, setUpdates] = useState<PostUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && postId) {
      fetchUpdates()
    }
  }, [isOpen, postId])

  const fetchUpdates = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/updates`)
      if (res.ok) {
        const json = await res.json()
        setUpdates(json.data || [])
      }
    } catch (e) {
      console.error(e)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Quá trình xác minh</span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </Button>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có lịch sử xác minh
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

              <div className="space-y-6">
                {updates.map((update, index) => {
                  const config = VERIFICATION_CONFIG[update.new_status as VerificationStatus]
                  const isFirst = index === 0

                  return (
                    <div key={update.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                          isFirst ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                        }`}
                        style={{
                          backgroundColor: isFirst ? 'var(--background)' : undefined,
                        }}
                      >
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              update.new_status === 'verified'
                                ? 'text-green-600'
                                : update.new_status === 'partial'
                                ? 'text-amber-600'
                                : update.new_status === 'unverified'
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {config.label}
                          </span>
                        </div>

                        {update.note && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {update.note}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(update.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
