// ═══════════════════════════════════════════════════════════════
// FEED SCORING ALGORITHM
// ═══════════════════════════════════════════════════════════════
//
// Final Score = Base Score × Freshness × Verification × Engagement × Personalization
//
// Base Score: 100
// Freshness: 0.1 - 1.0 (decays over time)
// Verification: 0.5 - 1.2 (by status)
// Engagement: 1.0 - 2.0 (based on interactions)
// Personalization: 1.0 - 1.5 (if followed)
//

export interface ScoringWeights {
  freshness: {
    halfLifeHours: number
    minScore: number
  }
  verification: {
    verified: number
    partial: number
    unverified: number
    debunked: number
  }
  engagement: {
    likeWeight: number
    commentWeight: number
    saveWeight: number
    maxMultiplier: number
  }
  personalization: {
    followedBotBoost: number
    interactedPostBoost: number
  }
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  freshness: {
    halfLifeHours: 12, // Post loses half its freshness score every 12 hours
    minScore: 0.1, // Minimum 10% freshness score
  },
  verification: {
    verified: 1.2, // 20% boost for verified
    partial: 1.0, // No change for partial
    unverified: 0.8, // 20% penalty for unverified
    debunked: 0.5, // 50% penalty for debunked
  },
  engagement: {
    likeWeight: 1,
    commentWeight: 3, // Comments worth 3x likes
    saveWeight: 5, // Saves worth 5x likes
    maxMultiplier: 2.0, // Cap at 2x boost
  },
  personalization: {
    followedBotBoost: 1.3, // 30% boost for followed bots
    interactedPostBoost: 1.1, // 10% boost if user interacted before
  },
}

// ═══════════════════════════════════════════════════════════════
// SCORING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function calculateFreshnessScore(
  createdAt: Date,
  weights: ScoringWeights['freshness'] = DEFAULT_WEIGHTS.freshness
): number {
  const now = new Date()
  const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  // Exponential decay: score = 2^(-age/halfLife)
  const score = Math.pow(2, -ageHours / weights.halfLifeHours)

  return Math.max(score, weights.minScore)
}

export function calculateVerificationScore(
  status: string,
  weights: ScoringWeights['verification'] = DEFAULT_WEIGHTS.verification
): number {
  switch (status) {
    case 'verified':
      return weights.verified
    case 'partial':
      return weights.partial
    case 'unverified':
      return weights.unverified
    case 'debunked':
      return weights.debunked
    default:
      return weights.unverified
  }
}

export function calculateEngagementScore(
  likes: number,
  comments: number,
  saves: number,
  weights: ScoringWeights['engagement'] = DEFAULT_WEIGHTS.engagement
): number {
  const totalEngagement =
    likes * weights.likeWeight +
    comments * weights.commentWeight +
    saves * weights.saveWeight

  // Logarithmic scaling to prevent runaway scores
  // score = 1 + log(1 + engagement) / 10, capped at maxMultiplier
  const score = 1 + Math.log(1 + totalEngagement) / 10

  return Math.min(score, weights.maxMultiplier)
}

export function calculatePersonalizationScore(
  isFollowedBot: boolean,
  hasInteracted: boolean,
  weights: ScoringWeights['personalization'] = DEFAULT_WEIGHTS.personalization
): number {
  let score = 1.0

  if (isFollowedBot) {
    score *= weights.followedBotBoost
  }

  if (hasInteracted) {
    score *= weights.interactedPostBoost
  }

  return score
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════════

export interface PostForScoring {
  id: string
  created_at: string
  verification_status: string
  likes_count: number
  comments_count: number
  saves_count: number
  bot_id: string
}

export interface ScoringContext {
  followedBotIds: Set<string>
  interactedPostIds: Set<string>
  weights?: ScoringWeights
}

export interface ScoredPost extends PostForScoring {
  score: number
  scoreBreakdown: {
    base: number
    freshness: number
    verification: number
    engagement: number
    personalization: number
  }
}

export function scorePost(
  post: PostForScoring,
  context: ScoringContext
): ScoredPost {
  const weights = context.weights || DEFAULT_WEIGHTS

  const base = 100
  const freshness = calculateFreshnessScore(
    new Date(post.created_at),
    weights.freshness
  )
  const verification = calculateVerificationScore(
    post.verification_status,
    weights.verification
  )
  const engagement = calculateEngagementScore(
    post.likes_count,
    post.comments_count,
    post.saves_count,
    weights.engagement
  )
  const personalization = calculatePersonalizationScore(
    context.followedBotIds.has(post.bot_id),
    context.interactedPostIds.has(post.id),
    weights.personalization
  )

  const score = base * freshness * verification * engagement * personalization

  return {
    ...post,
    score,
    scoreBreakdown: {
      base,
      freshness,
      verification,
      engagement,
      personalization,
    },
  }
}

export function rankPosts(
  posts: PostForScoring[],
  context: ScoringContext
): ScoredPost[] {
  return posts.map((post) => scorePost(post, context)).sort((a, b) => b.score - a.score)
}
