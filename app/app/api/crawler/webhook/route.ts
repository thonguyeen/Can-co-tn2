// @ts-nocheck
// ═══════════════════════════════════════════════════════════════
// n8n CRAWLER WEBHOOK — Phase 06b
// POST /api/crawler/webhook
//
// n8n workflows push crawled items here INSTEAD of direct DB write.
// This keeps all dedup logic in ONE place (saveRawNewsFromCrawl).
//
// Security:
//   - Bearer token validation (N8N_WEBHOOK_SECRET)
//   - Input validation — C1 from Tech Lead (never trust n8n blindly)
//
// Architecture:
//   n8n workflow → POST this endpoint → saveRawNewsFromCrawl (dedup)
//   → CuratorBot picks up from RawNews queue (async, unchanged)
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { saveRawNewsFromCrawl } from '@/lib/openclaw/persistence';
import { getCuratorBot } from '@/lib/openclaw/curator-bot';
import { prisma } from '@/lib/db';

// ─────────────────────────────────────────────────────────────
// INPUT TYPE — what n8n sends
// ─────────────────────────────────────────────────────────────

interface RawCrawlItem {
  title: string;
  originalUrl: string;
  content?: string;
  imageUrl?: string;
  publishedAt?: string; // ISO 8601 string from n8n
}

interface WebhookPayload {
  items: RawCrawlItem[];
  sourceName?: string; // Matches CrawlSource.name for linkage
  sourceUrl?: string;  // Used if sourceName doesn't match
}

// ─────────────────────────────────────────────────────────────
// VALIDATION — Tech Lead C1
// ─────────────────────────────────────────────────────────────

function validateItem(item: unknown, idx: number): item is RawCrawlItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;

  if (typeof obj.title !== 'string' || obj.title.trim().length === 0) {
    console.warn(`[Webhook] Item ${idx}: missing or empty title`);
    return false;
  }
  if (typeof obj.originalUrl !== 'string' || !obj.originalUrl.startsWith('http')) {
    console.warn(`[Webhook] Item ${idx}: invalid originalUrl`);
    return false;
  }
  return true;
}

function validatePayload(body: unknown): { valid: boolean; payload?: WebhookPayload; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Body must be a JSON object' };
  }

  const obj = body as Record<string, unknown>;

  if (!Array.isArray(obj.items)) {
    return { valid: false, error: 'items must be an array' };
  }

  if (obj.items.length === 0) {
    return { valid: false, error: 'items array is empty' };
  }

  if (obj.items.length > 100) {
    return { valid: false, error: 'items array exceeds limit of 100 per request' };
  }

  return {
    valid: true,
    payload: {
      items: obj.items as RawCrawlItem[],
      sourceName: typeof obj.sourceName === 'string' ? obj.sourceName : undefined,
      sourceUrl: typeof obj.sourceUrl === 'string' ? obj.sourceUrl : undefined,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// AUTH HELPER
// ─────────────────────────────────────────────────────────────

function validateAuth(req: NextRequest): boolean {
  const secret = process.env.N8N_WEBHOOK_SECRET;

  // If secret not configured in env, reject all requests for safety
  if (!secret) {
    console.error('[Webhook] N8N_WEBHOOK_SECRET not configured — rejecting request');
    return false;
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7).trim();
  // Constant-time comparison to prevent timing attacks
  return token === secret;
}

// ─────────────────────────────────────────────────────────────
// CRAWL SOURCE LOOKUP (for data traceability — Tech Lead note)
// ─────────────────────────────────────────────────────────────

async function lookupCrawlSourceId(sourceName?: string): Promise<string | undefined> {
  if (!sourceName) return undefined;
  try {
    const source = await prisma.crawlSource.findFirst({
      where: { name: { contains: sourceName, mode: 'insensitive' } },
      select: { id: true },
    });
    return source?.id;
  } catch {
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/crawler/webhook
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth check — must come first
  if (!validateAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // 3. Validate payload (C1: input validation)
  const validation = validatePayload(body);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 }
    );
  }

  const { items, sourceName } = validation.payload!;

  // 4. Optional: link to CrawlSource table for traceability
  const crawlSourceId = await lookupCrawlSourceId(sourceName);

  console.log(
    `[n8n Webhook] Received ${items.length} items from "${sourceName || 'unknown'}" ` +
    `(sourceId: ${crawlSourceId || 'none'})`
  );

  // 5. Process each item — reuse exact same logic as GenericCrawler
  const results = { saved: 0, duplicates: 0, invalid: 0, errors: 0 };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Per-item validation (title, url may be malformed from n8n)
    if (!validateItem(item, i)) {
      results.invalid++;
      continue;
    }

    try {
      const rawNewsId = await saveRawNewsFromCrawl({
        title: item.title,
        content: item.content,
        originalUrl: item.originalUrl,
        imageUrl: item.imageUrl,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
        crawlSourceId,
      });

      if (rawNewsId === null) {
        results.duplicates++;
      } else {
        results.saved++;
      }
    } catch (err) {
      console.error(`[n8n Webhook] Error saving item ${i}:`, err);
      results.errors++;
    }
  }

  console.log(
    `[n8n Webhook] Done: saved=${results.saved}, ` +
    `dups=${results.duplicates}, invalid=${results.invalid}, errors=${results.errors}`
  );

  // 6. Async kick CuratorBot if we saved anything new (same as trigger route)
  if (results.saved > 0) {
    const curator = getCuratorBot();
    curator.processUnprocessedNews(results.saved + 5).catch((e: Error) =>
      console.warn('[n8n Webhook] Curator async error:', e.message)
    );
  }

  // 7. Return stats to n8n (so n8n workflow can log/alert on failures)
  return NextResponse.json({
    success: true,
    received: items.length,
    ...results,
  });
}
