// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Knowledge Graph (PostgreSQL-based)
// ═══════════════════════════════════════════════════════

import { prisma } from '@/lib/db';
import type { Intent } from '@/lib/engine/types';

export interface KnowledgeEdge {
  source_type: string;
  source_id: string;
  relation: string;
  target_type: string;
  target_id: string;
  weight: number;
  metadata?: Record<string, unknown>;
}

export async function addEdge(
  edge: KnowledgeEdge,
): Promise<void> {
  try {
    const existing = await prisma.knowledgeEdge.findFirst({
      where: {
        sourceType: edge.source_type,
        sourceId: edge.source_id,
        relation: edge.relation,
        targetType: edge.target_type,
        targetId: edge.target_id,
      }
    });

    if (existing) {
      await prisma.knowledgeEdge.update({
        where: { id: existing.id },
        data: {
          weight: edge.weight,
          metadata: (edge.metadata as any) || {},
          updatedAt: new Date(),
        }
      });
    } else {
      await prisma.knowledgeEdge.create({
        data: {
          sourceType: edge.source_type,
          sourceId: edge.source_id,
          relation: edge.relation,
          targetType: edge.target_type,
          targetId: edge.target_id,
          weight: edge.weight,
          metadata: (edge.metadata as any) || {},
        }
      });
    }
  } catch { /* non-critical */ }
}

export async function buildEdgesForIntent(intent: Intent): Promise<void> {
  const edges: KnowledgeEdge[] = [
    { source_type: 'intent', source_id: intent.id, relation: 'posted_by', target_type: 'user', target_id: intent.user_id, weight: 1.0 },
    { source_type: 'intent', source_id: intent.id, relation: 'in_category', target_type: 'category', target_id: intent.category, weight: 1.0 },
  ];

  if (intent.district) {
    edges.push(
      { source_type: 'intent', source_id: intent.id, relation: 'in_district', target_type: 'district', target_id: intent.district, weight: 1.0 },
      { source_type: 'user', source_id: intent.user_id, relation: 'interested_in', target_type: 'district', target_id: intent.district, weight: 0.8 },
    );
  }

  for (const edge of edges) {
    await addEdge(edge);
  }
}

export async function buildEdgesForMatch(
  canUserId: string, coUserId: string, similarity: number, intentIds: string[],
): Promise<void> {
  await addEdge({
    source_type: 'user', source_id: canUserId,
    relation: 'potential_connection', target_type: 'user', target_id: coUserId,
    weight: similarity, metadata: { reason: 'CẦN↔CÓ match', intent_ids: intentIds },
  });
}

export async function buildEdgesForChat(userA: string, userB: string): Promise<void> {
  await addEdge({
    source_type: 'user', source_id: userA,
    relation: 'chatted_with', target_type: 'user', target_id: userB,
    weight: 0.9,
  });
}

export async function buildEdgesForReaction(userId: string, intentId: string, type: string): Promise<void> {
  const weight = type === 'interested' ? 0.7 : type === 'fair_price' ? 0.5 : 0.3;
  await addEdge({
    source_type: 'user', source_id: userId,
    relation: 'reacted_to', target_type: 'intent', target_id: intentId,
    weight,
  });
}

export async function buildEdgesForSave(userId: string, intentId: string, district: string | null): Promise<void> {
  await addEdge({
    source_type: 'user', source_id: userId,
    relation: 'saved', target_type: 'intent', target_id: intentId,
    weight: 0.8,
  });

  if (district) {
    await addEdge({
      source_type: 'user', source_id: userId,
      relation: 'interested_in', target_type: 'district', target_id: district,
      weight: 0.6,
    });
  }
}

// ═══════════════════════════════════════════════════════
// Graph Queries
// ═══════════════════════════════════════════════════════

export interface SimilarUser {
  userId: string;
  overlapCount: number;
  sharedDistricts: string[];
  reason: string;
}

export async function findSimilarUsers(userId: string): Promise<SimilarUser[]> {
  // Find users interested in same districts
  const myInterests = await prisma.knowledgeEdge.findMany({
    where: {
      sourceType: 'user',
      sourceId: userId,
      relation: 'interested_in',
    },
    select: { targetId: true },
  });

  if (!myInterests || myInterests.length === 0) return [];

  const districts = myInterests.map((e) => e.targetId);

  const others = await prisma.knowledgeEdge.findMany({
    where: {
      sourceType: 'user',
      relation: 'interested_in',
      targetId: { in: districts },
      sourceId: { not: userId },
    },
    select: { sourceId: true, targetId: true },
  });

  if (!others) return [];

  const userMap = new Map<string, string[]>();
  for (const e of others) {
    if (!userMap.has(e.sourceId)) userMap.set(e.sourceId, []);
    userMap.get(e.sourceId)!.push(e.targetId);
  }

  return Array.from(userMap.entries())
    .map(([uid, shared]) => ({
      userId: uid,
      overlapCount: shared.length,
      sharedDistricts: shared,
      reason: `Cùng quan tâm ${shared.join(', ')}`,
    }))
    .sort((a, b) => b.overlapCount - a.overlapCount)
    .slice(0, 10);
}

export interface DistrictHeat {
  district: string;
  canCount: number;
  coCount: number;
  totalInterest: number;
  heatLevel: 'cold' | 'warm' | 'hot' | 'very_hot';
}

export async function getHotDistricts(): Promise<DistrictHeat[]> {
  const edges = await prisma.knowledgeEdge.findMany({
    where: { targetType: 'district' },
    select: { targetId: true, sourceType: true, relation: true },
  });

  if (!edges) return [];

  const districtMap = new Map<string, { can: number; co: number; interest: number }>();
  for (const e of edges) {
    if (!districtMap.has(e.targetId)) districtMap.set(e.targetId, { can: 0, co: 0, interest: 0 });
    const d = districtMap.get(e.targetId)!;
    if (e.relation === 'in_district') {
      d.can++; // simplified
    }
    d.interest++;
  }

  return Array.from(districtMap.entries())
    .map(([district, data]) => ({
      district,
      canCount: data.can,
      coCount: Math.max(1, Math.floor(data.can / 2)),
      totalInterest: data.interest,
      heatLevel: data.interest > 10 ? 'very_hot' as const : data.interest > 5 ? 'hot' as const : data.interest > 2 ? 'warm' as const : 'cold' as const,
    }))
    .sort((a, b) => b.totalInterest - a.totalInterest);
}
