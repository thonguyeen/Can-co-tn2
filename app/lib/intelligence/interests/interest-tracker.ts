// ═══════════════════════════════════════════════════════════════
// USER INTEREST TRACKER
// ═══════════════════════════════════════════════════════════════
//
// Tracks and analyzes user interests over time
//

import { prisma } from '@/lib/db';
import { storeMemory } from '../memory/persistent-memory';

export interface UserInterest {
  id: string;
  userId: string;
  topic: string;
  category: string;
  score: number;           // 0-100 interest level
  interactionCount: number;
  lastInteractionAt: string;
  trend: 'rising' | 'stable' | 'declining';
  relatedTopics: string[];
  sources: string[];       // Where interest was detected
}

export interface InterestSignal {
  type: 'search' | 'read' | 'comment' | 'like' | 'ask' | 'subscribe' | 'share';
  topic: string;
  category?: string;
  weight: number;          // How strong is this signal
}

// Interest signal weights
const SIGNAL_WEIGHTS: Record<InterestSignal['type'], number> = {
  subscribe: 10,
  ask: 8,
  comment: 6,
  share: 5,
  like: 3,
  read: 2,
  search: 4,
};

// ═══════════════════════════════════════════════════════════════
// INTEREST TRACKING
// ═══════════════════════════════════════════════════════════════

export async function recordInterestSignal(
  userId: string,
  signal: InterestSignal
): Promise<UserInterest> {
  const weight = SIGNAL_WEIGHTS[signal.type] * (signal.weight || 1);

  // Find existing interest
  const existingList = await prisma.$queryRaw<any[]>`
    SELECT * FROM user_interests 
    WHERE user_id = ${userId} AND topic ILIKE ${signal.topic}
    LIMIT 1
  `;
  const existing = existingList[0];

  if (existing) {
    // Update existing interest
    const newScore = calculateNewScore(existing.score, weight, existing.interaction_count);
    const newTrend = calculateTrend(existing.score, newScore, existing.trend);
    const updatedSources = [...new Set([...(existing.sources || []), signal.type])];

    const updatedList = await prisma.$queryRaw<any[]>`
      UPDATE user_interests 
      SET score = ${newScore},
          interaction_count = interaction_count + 1,
          last_interaction_at = NOW(),
          trend = ${newTrend},
          sources = ${JSON.stringify(updatedSources)}::jsonb
      WHERE id = ${existing.id}::uuid
      RETURNING *
    `;
    const data = updatedList[0];

    return mapToUserInterest(data);
  }

  // Create new interest
  const dataList = await prisma.$queryRaw<any[]>`
    INSERT INTO user_interests (user_id, topic, category, score, interaction_count, last_interaction_at, trend, related_topics, sources)
    VALUES (${userId}, ${signal.topic.toLowerCase()}, ${signal.category || detectCategory(signal.topic)}, ${Math.min(100, weight * 5)}, 1, NOW(), 'rising', '[]'::jsonb, ${JSON.stringify([signal.type])}::jsonb)
    RETURNING *
  `;
  const data = dataList[0];

  // Also store as memory
  await storeMemory(
    userId,
    'interest',
    `User is interested in ${signal.topic}`,
    { category: signal.category, initialSignal: signal.type },
    { importance: 7, source: 'interest_tracker' }
  );

  return mapToUserInterest(data);
}

export async function getUserInterests(
  userId: string,
  options: {
    minScore?: number;
    category?: string;
    trend?: 'rising' | 'stable' | 'declining';
    limit?: number;
  } = {}
): Promise<UserInterest[]> {
  let sql = 'SELECT * FROM user_interests WHERE user_id = $1';
  const params: any[] = [userId];
  let paramIdx = 2;

  if (options.minScore) {
    sql += ` AND score >= $${paramIdx++}`;
    params.push(options.minScore);
  }

  if (options.category) {
    sql += ` AND category = $${paramIdx++}`;
    params.push(options.category);
  }

  if (options.trend) {
    sql += ` AND trend = $${paramIdx++}`;
    params.push(options.trend);
  }

  sql += ' ORDER BY score DESC';

  if (options.limit) {
    sql += ` LIMIT $${paramIdx++}`;
    params.push(options.limit);
  }

  const data = await prisma.$queryRawUnsafe<any[]>(sql, ...params);

  return (data || []).map(mapToUserInterest);
}

export async function getTopInterests(
  userId: string,
  limit: number = 5
): Promise<UserInterest[]> {
  return getUserInterests(userId, { limit, minScore: 20 });
}

export async function getRisingInterests(
  userId: string,
  limit: number = 5
): Promise<UserInterest[]> {
  return getUserInterests(userId, { trend: 'rising', limit });
}

// ═══════════════════════════════════════════════════════════════
// INTEREST ANALYSIS
// ═══════════════════════════════════════════════════════════════

export async function analyzeUserProfile(userId: string): Promise<{
  primaryInterests: string[];
  categories: Record<string, number>;
  activityLevel: 'high' | 'medium' | 'low';
  interestDiversity: number;
  recentTrends: { topic: string; trend: string }[];
}> {
  const interests = await getUserInterests(userId);

  if (interests.length === 0) {
    return {
      primaryInterests: [],
      categories: {},
      activityLevel: 'low',
      interestDiversity: 0,
      recentTrends: [],
    };
  }

  // Primary interests (top 5 by score)
  const primaryInterests = interests
    .slice(0, 5)
    .map(i => i.topic);

  // Category distribution
  const categories: Record<string, number> = {};
  interests.forEach(i => {
    categories[i.category] = (categories[i.category] || 0) + i.score;
  });

  // Activity level
  const totalInteractions = interests.reduce((sum, i) => sum + i.interactionCount, 0);
  const activityLevel = totalInteractions > 100 ? 'high' :
                        totalInteractions > 30 ? 'medium' : 'low';

  // Interest diversity (unique categories / max categories)
  const uniqueCategories = Object.keys(categories).length;
  const interestDiversity = Math.min(1, uniqueCategories / 8); // 8 main categories

  // Recent trends
  const recentTrends = interests
    .filter(i => i.trend !== 'stable')
    .slice(0, 5)
    .map(i => ({ topic: i.topic, trend: i.trend }));

  return {
    primaryInterests,
    categories,
    activityLevel,
    interestDiversity,
    recentTrends,
  };
}

export async function findRelatedUsers(
  userId: string,
  limit: number = 10
): Promise<string[]> {
  // Get user's top interests
  const userInterests = await getTopInterests(userId, 5);
  const topics = userInterests.map(i => i.topic);

  if (topics.length === 0) return [];

  const topicsStr = topics.map(t => `'${t}'`).join(',');
  const data = await prisma.$queryRawUnsafe<any[]>(`
    SELECT user_id FROM user_interests 
    WHERE topic IN (${topicsStr}) 
      AND user_id != $1 
      AND score >= 30
  `, userId);

  // Count overlap per user
  const userCounts: Record<string, number> = {};
  (data || []).forEach(d => {
    userCounts[d.user_id] = (userCounts[d.user_id] || 0) + 1;
  });

  // Sort by overlap and return top users
  return Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([uid]) => uid);
}

// ═══════════════════════════════════════════════════════════════
// INTEREST DECAY
// ═══════════════════════════════════════════════════════════════

export async function applyInterestDecay(): Promise<number> {
  // Decay interests that haven't been interacted with recently
  const decayThreshold = new Date();
  decayThreshold.setDate(decayThreshold.getDate() - 7); // 7 days

  const staleInterests = await prisma.$queryRaw<any[]>`
    SELECT id, score, trend FROM user_interests 
    WHERE last_interaction_at < ${decayThreshold} 
      AND score > 10
  `;

  if (!staleInterests || staleInterests.length === 0) {
    return 0;
  }

  // Apply decay
  for (const interest of staleInterests) {
    const decayedScore = Math.max(10, interest.score * 0.9); // 10% decay, min 10
    const newTrend = decayedScore < interest.score - 5 ? 'declining' : interest.trend;
    await prisma.$executeRaw`
      UPDATE user_interests 
      SET score = ${decayedScore}, trend = ${newTrend}
      WHERE id = ${interest.id}::uuid
    `;
  }

  return staleInterests.length;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function calculateNewScore(currentScore: number, addedWeight: number, interactionCount: number): number {
  // Diminishing returns as interaction count increases
  const effectiveWeight = addedWeight / Math.log2(interactionCount + 2);
  return Math.min(100, currentScore + effectiveWeight);
}

function calculateTrend(oldScore: number, newScore: number, currentTrend: string): string {
  const change = newScore - oldScore;

  if (change > 5) return 'rising';
  if (change < -5) return 'declining';
  return currentTrend || 'stable';
}

function detectCategory(topic: string): string {
  const categoryKeywords: Record<string, string[]> = {
    ai: ['ai', 'gpt', 'llm', 'ml', 'machine learning', 'neural', 'model', 'openai', 'anthropic'],
    crypto: ['bitcoin', 'btc', 'eth', 'crypto', 'blockchain', 'defi', 'nft', 'token'],
    startup: ['startup', 'funding', 'vc', 'founder', 'series', 'unicorn', 'valuation'],
    gadget: ['iphone', 'android', 'samsung', 'apple', 'google', 'phone', 'laptop', 'device'],
    finance: ['stock', 'market', 'investment', 'trading', 'economy', 'fed', 'inflation'],
    gaming: ['game', 'esports', 'playstation', 'xbox', 'nintendo', 'steam', 'gaming'],
    security: ['hack', 'security', 'privacy', 'breach', 'vulnerability', 'malware'],
    politics: ['election', 'government', 'policy', 'regulation', 'law', 'congress'],
  };

  const topicLower = topic.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => topicLower.includes(k))) {
      return category;
    }
  }

  return 'general';
}

function mapToUserInterest(data: Record<string, unknown>): UserInterest {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    topic: data.topic as string,
    category: data.category as string,
    score: data.score as number,
    interactionCount: data.interaction_count as number,
    lastInteractionAt: data.last_interaction_at?.toString() as string || new Date().toISOString(),
    trend: data.trend as 'rising' | 'stable' | 'declining',
    relatedTopics: (data.related_topics || []) as string[],
    sources: (data.sources || []) as string[],
  };
}
