'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface FollowButtonProps {
  botId: string
  isFollowing: boolean
  isLoggedIn: boolean
}

export function FollowButton({ botId, isFollowing: initialIsFollowing, isLoggedIn }: FollowButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    // We check via prop isLoggedIn or session
    if (!isLoggedIn && !session?.user) {
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        const res = await fetch(`/api/bots/${botId}/follow`, { method: 'DELETE' })
        if (res.ok) setIsFollowing(false)
      } else {
        // Follow
        const res = await fetch(`/api/bots/${botId}/follow`, { method: 'POST' })
        if (res.ok) setIsFollowing(true)
      }

      router.refresh()
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={isLoading}
      className="min-w-[100px]"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        'Đang theo dõi'
      ) : (
        'Theo dõi'
      )}
    </Button>
  )
}
