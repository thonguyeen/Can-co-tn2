// ═══════════════════════════════════════════════════════════════
// WATCHLIST MANAGER
// ═══════════════════════════════════════════════════════════════
//
// Track entities (companies, people, topics) user cares about
//

import { prisma } from '@/lib/db';
import { recordInterestSignal } from '../interests/interest-tracker';

export type WatchlistEntityType =
  | 'company'
  | 'person'
  | 'topic'
  | 'stock'
  | 'crypto'
  | 'product'
  | 'event';

export interface WatchlistItem {
  id: string;
  userId: string;
  entityType: WatchlistEntityType;
  entityName: string;
  entityId?: string;        // External ID if applicable
  keywords: string[];       // Additional keywords to match
  alertOnMention: boolean;
  alertOnBreaking: boolean;
  alertOnPriceChange?: number; // Percentage threshold
  notes?: string;
  lastMentionAt?: string;
  mentionCount: number;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
// WATCHLIST OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function addToWatchlist(
  userId: string,
  item: Omit<WatchlistItem, 'id' | 'userId' | 'mentionCount' | 'createdAt'>
): Promise<WatchlistItem> {
  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO watchlist (user_id, entity_type, entity_name, entity_id, keywords, alert_on_mention, alert_on_breaking, alert_on_price_change, notes, mention_count)
    VALUES (${userId}, ${item.entityType}, ${item.entityName}, ${item.entityId || null}, ${JSON.stringify(item.keywords || [item.entityName.toLowerCase()])}::jsonb, ${item.alertOnMention ?? true}, ${item.alertOnBreaking ?? true}, ${item.alertOnPriceChange || null}, ${item.notes || null}, 0)
    RETURNING *
  `;
  const data = result[0];

  // Record as interest
  await recordInterestSignal(userId, {
    type: 'subscribe',
    topic: item.entityName,
    category: mapEntityTypeToCategory(item.entityType),
    weight: 2,
  });

  return mapToWatchlistItem(data);
}

export async function removeFromWatchlist(
  userId: string,
  itemId: string
): Promise<void> {
  await prisma.$executeRaw`DELETE FROM watchlist WHERE user_id = ${userId} AND id = ${itemId}::uuid`;
}

export async function getWatchlist(
  userId: string,
  entityType?: WatchlistEntityType
): Promise<WatchlistItem[]> {
  const data = entityType 
    ? await prisma.$queryRaw<any[]>`SELECT * FROM watchlist WHERE user_id = ${userId} AND entity_type = ${entityType} ORDER BY created_at DESC`
    : await prisma.$queryRaw<any[]>`SELECT * FROM watchlist WHERE user_id = ${userId} ORDER BY created_at DESC`;

  return (data || []).map(mapToWatchlistItem);
}

export async function updateWatchlistItem(
  itemId: string,
  updates: Partial<WatchlistItem>
): Promise<void> {
  const ds: string[] = [];

  // Manual update builder for raw sql
  if (updates.alertOnMention !== undefined) ds.push(`alert_on_mention = ${updates.alertOnMention ? 'true' : 'false'}`);
  if (updates.alertOnBreaking !== undefined) ds.push(`alert_on_breaking = ${updates.alertOnBreaking ? 'true' : 'false'}`);
  if (updates.alertOnPriceChange !== undefined) ds.push(`alert_on_price_change = ${updates.alertOnPriceChange}`);
  if (updates.keywords !== undefined) {
    // We update keywords through a specific executeRaw below to avoid complex manual sanitizing of JSON strings here
  }
  if (updates.notes !== undefined) {
    // ditto
  }

  if (ds.length > 0) {
    await prisma.$executeRawUnsafe(`UPDATE watchlist SET ${ds.join(', ')} WHERE id = '${itemId}'`);
  }

  if (updates.keywords !== undefined) {
    await prisma.$executeRaw`UPDATE watchlist SET keywords = ${JSON.stringify(updates.keywords)}::jsonb WHERE id = ${itemId}::uuid`;
  }
  if (updates.notes !== undefined) {
    await prisma.$executeRaw`UPDATE watchlist SET notes = ${updates.notes} WHERE id = ${itemId}::uuid`;
  }
}

// ═══════════════════════════════════════════════════════════════
// WATCHLIST MATCHING
// ═══════════════════════════════════════════════════════════════

export async function findMatchingWatchlistItems(
  content: string,
  isBreaking: boolean = false
): Promise<{ item: WatchlistItem; userId: string }[]> {
  const contentLower = content.toLowerCase();

  const items = isBreaking
    ? await prisma.$queryRaw<any[]>`SELECT * FROM watchlist WHERE alert_on_breaking = true`
    : await prisma.$queryRaw<any[]>`SELECT * FROM watchlist WHERE alert_on_mention = true`;

  if (!items) return [];

  const matches: { item: WatchlistItem; userId: string }[] = [];

  for (const item of items) {
    const keywords = item.keywords || [item.entity_name.toLowerCase()];

    const isMatch = keywords.some((keyword: string) =>
      contentLower.includes(keyword.toLowerCase())
    );

    if (isMatch) {
      matches.push({
        item: mapToWatchlistItem(item),
        userId: item.user_id,
      });

      // Update mention stats
      await prisma.$executeRaw`
        UPDATE watchlist 
        SET last_mention_at = NOW(), mention_count = mention_count + 1 
        WHERE id = ${item.id}::uuid
      `;
    }
  }

  return matches;
}

// ═══════════════════════════════════════════════════════════════
// WATCHLIST ALERTS
// ═══════════════════════════════════════════════════════════════

export async function sendWatchlistAlerts(
  content: string,
  postId: string,
  isBreaking: boolean = false
): Promise<number> {
  const matches = await findMatchingWatchlistItems(content, isBreaking);

  if (matches.length === 0) return 0;

  const { getOpenClawClient } = await import('@/lib/openclaw/client');
  const client = getOpenClawClient();

  let sentCount = 0;

  for (const { item, userId } of matches) {
    // Get user's channel
    const channels = await prisma.$queryRaw<any[]>`SELECT channel, channel_id FROM user_channels WHERE user_id = ${userId} AND is_primary = true LIMIT 1`;
    const channel = channels[0];

    if (!channel) continue;

    const message = `🔔 *Watchlist Alert: ${item.entityName}*

${isBreaking ? '🚨 BREAKING: ' : ''}Có tin mới liên quan đến ${item.entityName}!

${content.slice(0, 200)}${content.length > 200 ? '...' : ''}

---
Manage: \`watch\` | Mute: \`watch mute ${item.entityName}\``;

    try {
      await client.send({
        channel: channel.channel,
        recipient: channel.channel_id,
        content: message,
      });
      sentCount++;
    } catch (error) {
      console.error(`Failed to send watchlist alert to ${userId}:`, error);
    }
  }

  return sentCount;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function mapToWatchlistItem(data: Record<string, unknown>): WatchlistItem {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    entityType: data.entity_type as WatchlistEntityType,
    entityName: data.entity_name as string,
    entityId: data.entity_id as string | undefined,
    keywords: (data.keywords || []) as string[],
    alertOnMention: data.alert_on_mention as boolean,
    alertOnBreaking: data.alert_on_breaking as boolean,
    alertOnPriceChange: data.alert_on_price_change as number | undefined,
    notes: data.notes as string | undefined,
    lastMentionAt: data.last_mention_at as string | undefined,
    mentionCount: data.mention_count as number,
    createdAt: data.created_at as string,
  };
}

function mapEntityTypeToCategory(type: WatchlistEntityType): string {
  const mapping: Record<WatchlistEntityType, string> = {
    company: 'startup',
    person: 'general',
    topic: 'general',
    stock: 'finance',
    crypto: 'crypto',
    product: 'gadget',
    event: 'general',
  };
  return mapping[type] || 'general';
}
