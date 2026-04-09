// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Agent Memory System
// Each bot remembers user patterns for personalized comments
// ═══════════════════════════════════════════════════════

import { prisma } from '@/lib/db';

export interface AgentMemory {
  bot_id: string;
  user_id: string;
  memory_type: 'preference' | 'interaction' | 'insight' | 'pattern';
  content: string;
  confidence: number;
}

const MAX_MEMORIES_PER_BOT_USER = 10;

export async function saveMemory(
  botId: string, userId: string, type: string, content: string,
  confidence: number, intentId: string | null,
): Promise<void> {
  try {
    await prisma.agentMemory.upsert({
      where: {
        botId_userId_memoryType: {
          botId,
          userId,
          memoryType: type,
        }
      },
      update: {
        content,
        confidence,
        sourceIntentId: intentId,
        updatedAt: new Date(),
      },
      create: {
        botId,
        userId,
        memoryType: type,
        content,
        confidence,
        sourceIntentId: intentId,
      }
    });

    // Enforce rolling window
    const data = await prisma.agentMemory.findMany({
      where: { botId, userId },
      select: { id: true },
      orderBy: { updatedAt: 'asc' },
    });

    if (data && data.length > MAX_MEMORIES_PER_BOT_USER) {
      const toDelete = data.slice(0, data.length - MAX_MEMORIES_PER_BOT_USER).map((d) => d.id);
      await prisma.agentMemory.deleteMany({
        where: { id: { in: toDelete } },
      });
    }
  } catch { /* non-critical */ }
}

export async function getMemories(
  botId: string, userId: string,
): Promise<AgentMemory[]> {
  try {
    const data = await prisma.agentMemory.findMany({
      where: { botId, userId },
      select: { botId: true, userId: true, memoryType: true, content: true, confidence: true },
      orderBy: { updatedAt: 'desc' },
      take: MAX_MEMORIES_PER_BOT_USER,
    });

    return data.map(d => ({
      bot_id: d.botId,
      user_id: d.userId,
      memory_type: d.memoryType as any,
      content: d.content,
      confidence: d.confidence ? Number(d.confidence) : 0,
    }));
  } catch {
    return [];
  }
}

export async function collectMemories(
  userId: string, event: string, data: Record<string, unknown>,
): Promise<void> {
  try {
    if (event === 'intent_created' && data.category === 'real_estate') {
      const district = data.district as string | null;
      const price = (data.price || data.price_max) as number | null;
      const intentId = data.id as string;

      if (district) {
        await saveMemory('nha_advisor', userId, 'preference',
          `Quan tâm ${district}`, 0.8, intentId);
      }
      if (price) {
        const fmted = price >= 1e9 ? `${(price / 1e9).toFixed(1)} tỷ` : `${Math.round(price / 1e6)} triệu`;
        await saveMemory('nha_advisor', userId, 'pattern',
          `Budget/giá gần nhất: ${fmted}`, 0.7, intentId);
      }

      await saveMemory('market_analyst', userId, 'interaction',
        `Posted ${data.type} in ${district || 'unknown'}`, 0.6, intentId);
    }

    if (event === 'intent_created') {
      await saveMemory('concierge', userId, 'insight',
        `Đã đăng intent (${data.type})`, 0.8, data.id as string);
    }

    if (event === 'verification_completed') {
      await saveMemory('trust_checker', userId, 'insight',
        `Completed ${data.type} verification`, 0.9, null);
    }
  } catch { /* non-critical */ }
}
