// ═══════════════════════════════════════════════════════════════
// ACHIEVEMENT SYSTEM
// ═══════════════════════════════════════════════════════════════

import { prisma } from '@/lib/db'

export type AchievementCategory =
  | 'engagement'
  | 'social'
  | 'knowledge'
  | 'streak'
  | 'special'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  requirement: {
    type: string
    count?: number
    condition?: string
  }
  secret?: boolean
}

// ═══════════════════════════════════════════════════════════════
// ACHIEVEMENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const ACHIEVEMENTS: Achievement[] = [
  // ENGAGEMENT
  {
    id: 'first_like', name: 'First Like', description: 'Like bài viết đầu tiên',
    icon: '❤️', category: 'engagement', points: 10, rarity: 'common',
    requirement: { type: 'likes_given', count: 1 },
  },
  {
    id: 'like_enthusiast', name: 'Like Enthusiast', description: 'Like 100 bài viết',
    icon: '💕', category: 'engagement', points: 50, rarity: 'uncommon',
    requirement: { type: 'likes_given', count: 100 },
  },
  {
    id: 'first_comment', name: 'Voice Heard', description: 'Comment bài viết đầu tiên',
    icon: '💬', category: 'engagement', points: 15, rarity: 'common',
    requirement: { type: 'comments_made', count: 1 },
  },
  {
    id: 'comment_warrior', name: 'Comment Warrior', description: 'Comment 50 bài viết',
    icon: '⚔️', category: 'engagement', points: 75, rarity: 'uncommon',
    requirement: { type: 'comments_made', count: 50 },
  },
  {
    id: 'early_bird', name: 'Early Bird', description: 'Là người đầu tiên comment trên 5 bài',
    icon: '🐦', category: 'engagement', points: 100, rarity: 'rare',
    requirement: { type: 'first_comments', count: 5 },
  },

  // SOCIAL
  {
    id: 'bot_whisperer', name: 'Bot Whisperer', description: 'Nhận được reply từ bot',
    icon: '🤖', category: 'social', points: 30, rarity: 'common',
    requirement: { type: 'bot_replies_received', count: 1 },
  },
  {
    id: 'bot_friend', name: 'Bot Friend', description: 'Nhận được 10 replies từ bots',
    icon: '🤝', category: 'social', points: 80, rarity: 'uncommon',
    requirement: { type: 'bot_replies_received', count: 10 },
  },
  {
    id: 'all_bots_met', name: 'Social Butterfly', description: 'Tương tác với tất cả 9 bots',
    icon: '🦋', category: 'social', points: 150, rarity: 'rare',
    requirement: { type: 'unique_bots_interacted', count: 9 },
  },
  {
    id: 'popular_comment', name: 'Popular Comment', description: 'Comment được 10+ likes',
    icon: '🌟', category: 'social', points: 60, rarity: 'uncommon',
    requirement: { type: 'comment_likes_received', count: 10 },
  },

  // KNOWLEDGE
  {
    id: 'fact_checker', name: 'Fact Checker', description: 'Report tin sai được verified',
    icon: '🔍', category: 'knowledge', points: 100, rarity: 'rare',
    requirement: { type: 'verified_reports', count: 1 },
  },
  {
    id: 'truth_seeker', name: 'Truth Seeker', description: 'Report 5 tin sai được verified',
    icon: '🎯', category: 'knowledge', points: 200, rarity: 'epic',
    requirement: { type: 'verified_reports', count: 5 },
  },
  {
    id: 'oracle', name: 'Oracle', description: 'Dự đoán đúng 5 lần liên tiếp',
    icon: '🔮', category: 'knowledge', points: 150, rarity: 'epic',
    requirement: { type: 'prediction_streak', count: 5 },
  },
  {
    id: 'news_junkie', name: 'News Junkie', description: 'Đọc 100 bài viết',
    icon: '📰', category: 'knowledge', points: 50, rarity: 'uncommon',
    requirement: { type: 'posts_viewed', count: 100 },
  },

  // STREAK
  {
    id: 'streak_3', name: 'Getting Started', description: 'Streak 3 ngày liên tiếp',
    icon: '🔥', category: 'streak', points: 30, rarity: 'common',
    requirement: { type: 'daily_streak', count: 3 },
  },
  {
    id: 'streak_7', name: 'Week Warrior', description: 'Streak 7 ngày liên tiếp',
    icon: '🔥🔥', category: 'streak', points: 70, rarity: 'uncommon',
    requirement: { type: 'daily_streak', count: 7 },
  },
  {
    id: 'streak_30', name: 'Monthly Master', description: 'Streak 30 ngày liên tiếp',
    icon: '🔥🔥🔥', category: 'streak', points: 300, rarity: 'epic',
    requirement: { type: 'daily_streak', count: 30 },
  },
  {
    id: 'streak_100', name: 'Legendary Streak', description: 'Streak 100 ngày liên tiếp',
    icon: '💯🔥', category: 'streak', points: 1000, rarity: 'legendary',
    requirement: { type: 'daily_streak', count: 100 },
  },

  // SPECIAL
  {
    id: 'level_5', name: 'Rising Star', description: 'Đạt Level 5',
    icon: '⭐', category: 'special', points: 50, rarity: 'uncommon',
    requirement: { type: 'level', count: 5 },
  },
  {
    id: 'level_10', name: 'Mythic Achiever', description: 'Đạt Level 10',
    icon: '💎', category: 'special', points: 500, rarity: 'legendary',
    requirement: { type: 'level', count: 10 },
  },
  {
    id: 'night_owl', name: 'Night Owl', description: 'Hoạt động sau 2 giờ sáng',
    icon: '🦉', category: 'special', points: 25, rarity: 'common',
    requirement: { type: 'active_time', condition: 'after_2am' },
    secret: true,
  },
  {
    id: 'breaking_witness', name: 'Breaking Witness', description: 'Xem breaking news trong 5 phút đầu',
    icon: '📡', category: 'special', points: 40, rarity: 'uncommon',
    requirement: { type: 'breaking_viewed_early', count: 1 },
    secret: true,
  },
  {
    id: 'debate_starter', name: 'Debate Starter', description: 'Comment gây ra debate giữa các bots',
    icon: '⚡', category: 'special', points: 100, rarity: 'rare',
    requirement: { type: 'debate_triggered', count: 1 },
    secret: true,
  },
]

// ═══════════════════════════════════════════════════════════════
// ACHIEVEMENT OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function checkAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  const existing = await prisma.userAchievement.findFirst({
    where: { userId, achievementType: achievementId },
  });
  if (existing) return false; // Already unlocked

  // Not yet unlocked → Create
  await prisma.userAchievement.create({
    data: { userId, achievementType: achievementId },
  });
  return true; // Just unlocked
}

export async function checkAllAchievements(userId: string): Promise<string[]> {
  const stats = await prisma.userStat.findUnique({
    where: { userId },
  })

  if (!stats) return []

  const unlocked: string[] = []

  for (const achievement of ACHIEVEMENTS) {
    const { type, count } = achievement.requirement
    let shouldUnlock = false

    switch (type) {
      case 'likes_given':
        shouldUnlock = (stats.likesGiven || 0) >= (count || 0)
        break
      case 'comments_made':
        shouldUnlock = (stats.commentsMade || 0) >= (count || 0)
        break
      case 'bot_replies_received':
        shouldUnlock = 0 >= (count || 0) // Disabled
        break
      case 'daily_streak':
        shouldUnlock = (stats.streakDays || 0) >= (count || 0)
        break
      case 'level':
        shouldUnlock = (stats.level || 1) >= (count || 0)
        break
      case 'first_comments':
        shouldUnlock = 0 >= (count || 0) // Disabled
        break
      case 'verified_reports':
        shouldUnlock = 0 >= (count || 0) // Disabled
        break
      case 'posts_viewed':
        shouldUnlock = (stats.postsRead || 0) >= (count || 0)
        break
      case 'unique_bots_interacted':
        shouldUnlock = 0 >= (count || 0) // Disabled
        break
    }

    if (shouldUnlock) {
      const wasUnlocked = await checkAchievement(userId, achievement.id)
      if (wasUnlocked) {
        unlocked.push(achievement.id)
      }
    }
  }

  return unlocked
}

export async function getUserAchievements(userId: string): Promise<{
  unlocked: Achievement[]
  locked: Achievement[]
  progress: Record<string, number>
}> {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementType: true },
  });
  const unlockedIds = new Set(userAchievements.map(a => a.achievementType));

  const unlocked = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id))
  const locked = ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id) && !a.secret)

  const stats = await prisma.userStat.findUnique({
    where: { userId },
  })

  const progress: Record<string, number> = {}

  for (const achievement of locked) {
    const { type, count } = achievement.requirement
    if (!count) continue

    let current = 0
    switch (type) {
      case 'likes_given': current = stats?.likesGiven || 0; break
      case 'comments_made': current = stats?.commentsMade || 0; break
      case 'daily_streak': current = stats?.streakDays || 0; break
      case 'bot_replies_received': current = 0; break
      case 'first_comments': current = 0; break
      case 'posts_viewed': current = stats?.postsRead || 0; break
    }

    progress[achievement.id] = Math.min(100, (current / count) * 100)
  }

  return { unlocked, locked, progress }
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}
