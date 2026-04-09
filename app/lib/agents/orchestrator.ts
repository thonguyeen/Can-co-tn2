// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Agent Orchestrator
// Decides which bots comment when, enforces anti-spam
// ═══════════════════════════════════════════════════════

import { prisma } from '@/lib/db';
import { BOT_PERSONAS, type BotPersona } from './personas';
import { generateComment } from './comment-generator';
import type { Intent } from '@/lib/engine/types';

export interface AgentTrigger {
  event: 'intent_created' | 'match_found' | 'periodic_market' | 'periodic_nudge';
  intentId?: string;
  intentData?: Intent;
  context?: Record<string, unknown>;
}

export interface AgentAction {
  botId: string;
  intentId: string;
  comment: string;
  reason: string;
}

const MAX_BOTS_PER_INTENT = 3;

export async function orchestrate(
  trigger: AgentTrigger,
): Promise<AgentAction[]> {
  const actions: AgentAction[] = [];
  const intent = trigger.intentData;
  if (!intent && !trigger.context) return actions;

  const activeBots = BOT_PERSONAS.filter((b) => b.isActive);

  const ctx = {
    intentType: (intent?.type || 'CAN') as 'CAN' | 'CO',
    district: intent?.district,
    price: intent?.price,
    priceMin: intent?.price_min,
    priceMax: intent?.price_max,
    bedrooms: (intent?.parsed_data as Record<string, unknown>)?.bedrooms as number | null,
    trustScore: intent?.trust_score || 1,
    verificationLevel: intent?.verification_level || 'none',
    matchCount: intent?.match_count || 0,
    userIntentCount: (trigger.context?.userIntentCount as number) || 0,
  };

  switch (trigger.event) {
    case 'intent_created': {
      // Match Advisor always
      addAction(actions, 'match_advisor', intent?.id || '', activeBots, ctx, 'intent_created');
      // Nhà Advisor for BĐS
      if (intent?.category === 'real_estate') {
        addAction(actions, 'nha_advisor', intent.id, activeBots, ctx, 'bds_intent');
      }
      // Trust Checker for unverified
      if (ctx.verificationLevel === 'none') {
        addAction(actions, 'trust_checker', intent?.id || '', activeBots, ctx, 'unverified_intent');
      }
      // Concierge for new users
      if (ctx.userIntentCount < 3) {
        addAction(actions, 'concierge', intent?.id || '', activeBots, ctx, 'new_user');
      }
      break;
    }
    case 'match_found': {
      addAction(actions, 'match_advisor', intent?.id || '', activeBots, ctx, 'match_found');
      const similarCount = (trigger.context?.similarCount as number) || 0;
      if (similarCount > 2) {
        addAction(actions, 'connector', intent?.id || '', activeBots, ctx, 'similar_seekers');
      }
      break;
    }
    case 'periodic_market': {
      addAction(actions, 'market_analyst', trigger.intentId || '', activeBots, ctx, 'periodic_report');
      break;
    }
    case 'periodic_nudge': {
      // For stale intents — use concierge-style nudge
      addAction(actions, 'concierge', trigger.intentId || '', activeBots, ctx, 'stale_intent_nudge');
      break;
    }
  }

  // Enforce spam limits
  return enforceSpamLimits(actions, trigger.intentId || '');
}

function addAction(
  actions: AgentAction[],
  botId: string,
  intentId: string,
  activeBots: BotPersona[],
  ctx: Parameters<typeof generateComment>[1],
  reason: string,
) {
  const persona = activeBots.find((b) => b.id === botId);
  if (!persona) return;

  const comment = generateComment(persona, ctx);
  if (!comment) return;

  // No duplicate bot
  if (actions.some((a) => a.botId === botId)) return;

  actions.push({ botId, intentId, comment, reason });
}

async function enforceSpamLimits(
  actions: AgentAction[],
  intentId: string,
): Promise<AgentAction[]> {
  let existingCount = 0;
  const existingBotIds = new Set<string>();

  if (intentId) {
    const existing = await prisma.intentComment.findMany({
      where: { intentId, isBot: true },
      select: { botName: true },
    });

    existingCount = existing.length;
    existing.forEach((d) => {
      if (d.botName) existingBotIds.add(d.botName);
    });
  }

  const remaining = MAX_BOTS_PER_INTENT - existingCount;
  if (remaining <= 0) return [];

  return actions
    .filter((a) => !existingBotIds.has(a.botId))
    .slice(0, remaining);
}

/**
 * Execute orchestrated actions: create bot comments + log activity
 */
export async function executeActions(
  actions: AgentAction[],
): Promise<void> {
  for (const action of actions) {
    // Create bot comment
    const comment = await prisma.intentComment.create({
      data: {
        intentId: action.intentId,
        isBot: true,
        botName: action.botId,
        content: action.comment,
      },
      select: { id: true },
    });

    // Log activity (best-effort)
    try {
      await prisma.agentActivity.create({
        data: {
          botId: action.botId,
          event: action.reason,
          intentId: action.intentId,
          action: 'commented',
          commentId: comment?.id || null,
          reason: action.reason,
        },
      });
    } catch {
      // Non-critical
    }
  }
}
