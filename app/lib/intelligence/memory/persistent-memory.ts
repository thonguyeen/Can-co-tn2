// ═══════════════════════════════════════════════════════════════
// PERSISTENT MEMORY SYSTEM
// ═══════════════════════════════════════════════════════════════
//
// Long-term memory for user context and preferences
//

import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export type MemoryType =
  | 'fact'           // User stated facts (name, job, location)
  | 'preference'     // Preferences (likes, dislikes)
  | 'interest'       // Topics they care about
  | 'interaction'    // Notable interactions
  | 'context'        // Conversation context
  | 'behavior'       // Observed behavior patterns
  | 'relationship'   // Relationship with bots
  | 'goal';          // User goals/objectives

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  metadata: Record<string, unknown>;
  importance: number;     // 1-10
  confidence: number;     // 0-1
  source: string;         // Where this was learned
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
  expiresAt?: string;     // Optional expiration
}

export interface MemoryQuery {
  userId: string;
  types?: MemoryType[];
  keywords?: string[];
  minImportance?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════
// MEMORY STORAGE
// ═══════════════════════════════════════════════════════════════

export async function storeMemory(
  userId: string,
  type: MemoryType,
  content: string,
  metadata: Record<string, unknown> = {},
  options: {
    importance?: number;
    confidence?: number;
    source?: string;
    expiresIn?: number; // hours
  } = {}
): Promise<Memory> {
  const now = new Date();

  // Check for duplicate/similar memory
  const existing = await findSimilarMemory(userId, content);
  if (existing) {
    // Update existing memory instead of creating duplicate
    return await reinforceMemory(existing.id);
  }

  const memory: Partial<Memory> = {
    userId,
    type,
    content,
    metadata,
    importance: options.importance || calculateImportance(type, content),
    confidence: options.confidence || 0.8,
    source: options.source || 'conversation',
    createdAt: now.toISOString(),
    lastAccessedAt: now.toISOString(),
    accessCount: 1,
  };

  if (options.expiresIn) {
    memory.expiresAt = new Date(now.getTime() + options.expiresIn * 60 * 60 * 1000).toISOString();
  }

  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO user_memories (user_id, type, content, metadata, importance, confidence, source, created_at, last_accessed_at, access_count, expires_at)
    VALUES (${memory.userId}, ${memory.type}, ${memory.content}, ${JSON.stringify(memory.metadata)}::jsonb, ${memory.importance}, ${memory.confidence}, ${memory.source}, ${memory.createdAt}::timestamptz, ${memory.lastAccessedAt}::timestamptz, ${memory.accessCount}, ${memory.expiresAt ? new Date(memory.expiresAt) : null})
    RETURNING *
  `;

  return mapToMemory(result[0]);
}

export async function queryMemories(query: MemoryQuery): Promise<Memory[]> {
  let sql = 'SELECT * FROM user_memories WHERE user_id = $1';
  const params: any[] = [query.userId];
  
  if (query.types && query.types.length > 0) {
    const typesStr = query.types.map(t => `'${t}'`).join(',');
    sql += ` AND type IN (${typesStr})`;
  }

  if (query.minImportance) {
    sql += ` AND importance >= ${query.minImportance}`;
  }

  sql += ' ORDER BY importance DESC, last_accessed_at DESC';

  if (query.limit) {
    sql += ` LIMIT ${query.limit}`;
  }

  let data = await prisma.$queryRawUnsafe<any[]>(sql, ...params);

  data = data.map(m => ({ ...m, created_at: m.created_at?.toISOString(), last_accessed_at: m.last_accessed_at?.toISOString(), expires_at: m.expires_at?.toISOString() }));

  let memories = (data || []).filter(m => {
    // Filter expired
    if (m.expires_at && new Date(m.expires_at) < new Date()) {
      return false;
    }
    return true;
  });

  // Keyword filtering (if provided)
  if (query.keywords && query.keywords.length > 0) {
    const keywordLower = query.keywords.map(k => k.toLowerCase());
    memories = memories.filter(m =>
      keywordLower.some(k => m.content.toLowerCase().includes(k))
    );
  }

  // Update access stats
  if (memories.length > 0) {
    const ids = memories.map(m => m.id);
    const inIds = ids.map(id => `'${id}'`).join(',');
    await prisma.$executeRawUnsafe(`UPDATE user_memories SET last_accessed_at = NOW() WHERE id IN (${inIds})`);
  }

  return memories.map(mapToMemory);
}

export async function getRelevantMemories(
  userId: string,
  context: string,
  limit: number = 10
): Promise<Memory[]> {
  // Get all memories for user
  let allMemories = await prisma.$queryRaw<any[]>`SELECT * FROM user_memories WHERE user_id = ${userId}`;
  allMemories = allMemories.map(m => ({ ...m, created_at: m.created_at?.toISOString(), last_accessed_at: m.last_accessed_at?.toISOString(), expires_at: m.expires_at?.toISOString() }));

  if (!allMemories || allMemories.length === 0) {
    return [];
  }

  // Filter expired
  const validMemories = allMemories.filter(m => {
    if (m.expires_at && new Date(m.expires_at) < new Date()) {
      return false;
    }
    return true;
  });

  if (validMemories.length === 0) return [];

  // Use AI to find relevant memories
  const memorySummaries = validMemories.map(m =>
    `[${m.id}] ${m.type}: ${m.content}`
  ).join('\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Given this conversation context:
"${context}"

Which of these memories are relevant? Return only the IDs, comma-separated, most relevant first. Max ${limit}.

Memories:
${memorySummaries}

IDs (comma-separated):`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const relevantIds = text.split(',').map(id => id.trim().replace(/[\[\]]/g, ''));

    return validMemories
      .filter(m => relevantIds.includes(m.id))
      .sort((a, b) => relevantIds.indexOf(a.id) - relevantIds.indexOf(b.id))
      .slice(0, limit)
      .map(mapToMemory);

  } catch (error) {
    // Fallback: return recent important memories
    return validMemories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit)
      .map(mapToMemory);
  }
}

// ═══════════════════════════════════════════════════════════════
// MEMORY EXTRACTION FROM CONVERSATION
// ═══════════════════════════════════════════════════════════════

export async function extractMemoriesFromConversation(
  userId: string,
  conversation: { role: 'user' | 'assistant'; content: string }[],
  source: string
): Promise<Memory[]> {
  const conversationText = conversation
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Extract memorable facts, preferences, and interests from this conversation.
Only extract information explicitly stated or strongly implied by the USER.
Do NOT extract information about the assistant.

Conversation:
${conversationText}

Respond in JSON array format:
[
  {
    "type": "fact|preference|interest|goal",
    "content": "Clear statement of what was learned",
    "importance": 1-10,
    "confidence": 0.5-1.0
  }
]

If nothing notable to remember, return empty array [].
JSON:`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const extracted = JSON.parse(jsonMatch[0]);
    const memories: Memory[] = [];

    for (const item of extracted) {
      if (item.content && item.type) {
        const memory = await storeMemory(
          userId,
          item.type,
          item.content,
          { extractedFrom: 'conversation' },
          {
            importance: item.importance,
            confidence: item.confidence,
            source,
          }
        );
        memories.push(memory);
      }
    }

    return memories;

  } catch (error) {
    console.error('Memory extraction error:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function findSimilarMemory(userId: string, content: string): Promise<Memory | null> {
  let data = await prisma.$queryRaw<any[]>`SELECT * FROM user_memories WHERE user_id = ${userId}`;
  data = data.map(m => ({ ...m, created_at: m.created_at?.toISOString(), last_accessed_at: m.last_accessed_at?.toISOString(), expires_at: m.expires_at?.toISOString() }));

  if (!data || data.length === 0) return null;

  // Check similarity threshold
  const contentLower = content.toLowerCase();
  const similar = data.find(m => {
    const memoryLower = m.content.toLowerCase();
    const similarity = calculateSimilarity(contentLower, memoryLower);
    return similarity > 0.7;
  });

  return similar ? mapToMemory(similar) : null;
}

async function reinforceMemory(memoryId: string): Promise<Memory> {
  const data = await prisma.$queryRaw<any[]>`SELECT * FROM user_memories WHERE id = ${memoryId}::uuid LIMIT 1`;
  const current = data[0];

  if (!current) throw new Error('Memory not found');

  const result = await prisma.$queryRaw<any[]>`
    UPDATE user_memories 
    SET access_count = access_count + 1,
        confidence = LEAST(1.0, confidence + 0.05),
        last_accessed_at = NOW()
    WHERE id = ${memoryId}::uuid
    RETURNING *
  `;
  const updated = result[0];
  updated.created_at = updated.created_at?.toISOString();
  updated.last_accessed_at = updated.last_accessed_at?.toISOString();
  updated.expires_at = updated.expires_at?.toISOString();

  return mapToMemory(updated);
}

function calculateImportance(type: MemoryType, content: string): number {
  const typeWeights: Record<MemoryType, number> = {
    fact: 7,
    preference: 8,
    interest: 8,
    goal: 9,
    relationship: 6,
    behavior: 5,
    interaction: 4,
    context: 3,
  };

  let importance = typeWeights[type] || 5;

  // Boost for certain keywords
  const importantKeywords = ['always', 'never', 'love', 'hate', 'important', 'need', 'must'];
  if (importantKeywords.some(k => content.toLowerCase().includes(k))) {
    importance = Math.min(10, importance + 1);
  }

  return importance;
}

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? intersection / union : 0;
}

function mapToMemory(data: Record<string, unknown>): Memory {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    type: data.type as MemoryType,
    content: data.content as string,
    metadata: (data.metadata || {}) as Record<string, unknown>,
    importance: data.importance as number,
    confidence: data.confidence as number,
    source: data.source as string,
    createdAt: data.created_at as string,
    lastAccessedAt: data.last_accessed_at as string,
    accessCount: data.access_count as number,
    expiresAt: data.expires_at as string | undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
// MEMORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export async function deleteMemory(memoryId: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM user_memories WHERE id = ${memoryId}::uuid`;
}

export async function deleteAllUserMemories(userId: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM user_memories WHERE user_id = ${userId}`;
}

export async function getUserMemorySummary(userId: string): Promise<{
  totalMemories: number;
  byType: Record<MemoryType, number>;
  oldestMemory: string | null;
  newestMemory: string | null;
}> {
  const data = await prisma.$queryRaw<any[]>`
    SELECT type, created_at FROM user_memories 
    WHERE user_id = ${userId} 
    ORDER BY created_at ASC
  `;

  const count = data.length;
  const byType: Record<string, number> = {};
  (data || []).forEach(m => {
    byType[m.type] = (byType[m.type] || 0) + 1;
  });

  return {
    totalMemories: count || 0,
    byType: byType as Record<MemoryType, number>,
    oldestMemory: data?.[0]?.created_at?.toISOString() || null,
    newestMemory: data?.[data.length - 1]?.created_at?.toISOString() || null,
  };
}
