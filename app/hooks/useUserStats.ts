'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Achievement } from '@/lib/gamification/achievements'

interface UserStats {
  totalPoints: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  likesGiven: number
  commentsMade: number
  predictionsCorrect: number
  rank: number
}

interface UseUserStatsReturn {
  stats: UserStats | null
  achievements: {
    unlocked: Achievement[]
    locked: Achievement[]
    progress: Record<string, number>
  } | null
  loading: boolean
  refetch: () => void
}

const DEFAULT_STATS: UserStats = {
  totalPoints: 1250,
  currentLevel: 5,
  currentStreak: 7,
  longestStreak: 14,
  likesGiven: 89,
  commentsMade: 34,
  predictionsCorrect: 3,
  rank: 12,
}

export function useUserStats(userId?: string): UseUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<UseUserStatsReturn['achievements']>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!userId) {
      // Demo mode: use defaults
      setStats(DEFAULT_STATS)
      setAchievements({
        unlocked: [
          { id: 'first_like', name: 'First Like', description: 'Like bai viet dau tien', icon: '❤️', category: 'engagement', points: 10, rarity: 'common', requirement: { type: 'likes_given', count: 1 } },
          { id: 'first_comment', name: 'Voice Heard', description: 'Comment bai viet dau tien', icon: '💬', category: 'engagement', points: 15, rarity: 'common', requirement: { type: 'comments_made', count: 1 } },
          { id: 'bot_whisperer', name: 'Bot Whisperer', description: 'Nhan duoc reply tu bot', icon: '🤖', category: 'social', points: 30, rarity: 'common', requirement: { type: 'bot_replies_received', count: 1 } },
          { id: 'streak_3', name: 'Getting Started', description: 'Streak 3 ngay lien tiep', icon: '🔥', category: 'streak', points: 30, rarity: 'common', requirement: { type: 'daily_streak', count: 3 } },
          { id: 'streak_7', name: 'Week Warrior', description: 'Streak 7 ngay lien tiep', icon: '🔥🔥', category: 'streak', points: 70, rarity: 'uncommon', requirement: { type: 'daily_streak', count: 7 } },
        ],
        locked: [
          { id: 'like_enthusiast', name: 'Like Enthusiast', description: 'Like 100 bai viet', icon: '💕', category: 'engagement', points: 50, rarity: 'uncommon', requirement: { type: 'likes_given', count: 100 } },
          { id: 'comment_warrior', name: 'Comment Warrior', description: 'Comment 50 bai viet', icon: '⚔️', category: 'engagement', points: 75, rarity: 'uncommon', requirement: { type: 'comments_made', count: 50 } },
          { id: 'all_bots_met', name: 'Social Butterfly', description: 'Tuong tac voi tat ca 9 bots', icon: '🦋', category: 'social', points: 150, rarity: 'rare', requirement: { type: 'unique_bots_interacted', count: 9 } },
          { id: 'oracle', name: 'Oracle', description: 'Du doan dung 5 lan lien tiep', icon: '🔮', category: 'knowledge', points: 150, rarity: 'epic', requirement: { type: 'prediction_streak', count: 5 } },
          { id: 'streak_30', name: 'Monthly Master', description: 'Streak 30 ngay lien tiep', icon: '🔥🔥🔥', category: 'streak', points: 300, rarity: 'epic', requirement: { type: 'daily_streak', count: 30 } },
          { id: 'level_5', name: 'Rising Star', description: 'Dat Level 5', icon: '⭐', category: 'special', points: 50, rarity: 'uncommon', requirement: { type: 'level', count: 5 } },
        ],
        progress: {
          like_enthusiast: 89,
          comment_warrior: 68,
          all_bots_met: 44,
          oracle: 60,
          streak_30: 23,
          level_5: 100,
        },
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [statsRes, achievementsRes] = await Promise.all([
        fetch(`/api/users/${userId}/stats`),
        fetch(`/api/users/${userId}/achievements`),
      ])
      setStats(await statsRes.json())
      setAchievements(await achievementsRes.json())
    } catch {
      setStats(DEFAULT_STATS)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { stats, achievements, loading, refetch: fetchData }
}
