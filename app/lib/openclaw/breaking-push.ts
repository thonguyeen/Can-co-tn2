// ═══════════════════════════════════════════════════════════════
// BREAKING NEWS PUSH SERVICE
// ═══════════════════════════════════════════════════════════════
//
// Pushes breaking news to subscribed users via OpenClaw
//

import { getOpenClawClient } from './client';
import { getSubscribedUsers } from './channel-manager';
import { CanvasCard } from './types';
import { prisma } from '@/lib/db';

const LEVEL_CONFIG = {
  critical: { emoji: '🔴', label: 'CRITICAL', shouldPush: true },
  important: { emoji: '🟠', label: 'IMPORTANT', shouldPush: true },
  notable: { emoji: '🟡', label: 'NOTABLE', shouldPush: false },
  normal: { emoji: '⚪', label: 'NEWS', shouldPush: false },
};

// ═══════════════════════════════════════════════════════════════
// MAIN PUSH FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function pushBreakingNews(
  breakingId: string
): Promise<{ sent: number; failed: number }> {
  const client = getOpenClawClient();

  const breaking = await prisma.breakingNews.findUnique({
    where: { id: breakingId },
    include: {
      post: {
        select: {
          id: true,
          content: true,
          bot: { select: { name: true, handle: true, avatarUrl: true } }
        }
      }
    }
  });

  if (!breaking) {
    return { sent: 0, failed: 0 };
  }

  const config = LEVEL_CONFIG[breaking.urgencyLevel as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.normal;

  // Get subscribed users
  const subscribers = await getSubscribedUsers((breaking.category as string) || 'all', 'breakingNews');

  if (subscribers.length === 0) {
    return { sent: 0, failed: 0 };
  }

  // Build message
  const message = formatBreakingMessage(breaking, config);
  const canvas = createBreakingCanvas(breaking, config);

  // Broadcast
  const result = await client.broadcast(
    subscribers.map(s => ({ channel: s.channel, recipient: s.channelId })),
    message,
    canvas
  );

  // Log push results
  try {
    await prisma.pushLog.create({
      data: {
        userId: '11111111-1111-1111-1111-111111111111',
        title: `Breaking: ${breaking.headline?.slice(0, 80) || breakingId}`,
        body: `Sent: ${result.sent}/${subscribers.length}, Failed: ${result.failed}`,
        status: result.failed > 0 ? 'partial' : 'sent',
      }
    });
  } catch (e) {
    console.error('Failed to log breaking push:', e);
  }

  return { sent: result.sent, failed: result.failed };
}

function formatBreakingMessage(
  breaking: any,
  config: typeof LEVEL_CONFIG[keyof typeof LEVEL_CONFIG]
): string {
  const bot = breaking.post?.bot;
  const content = breaking.post?.content || '';

  return `${config.emoji} *${config.label}: ${breaking.headline}*

${content.slice(0, 300)}${content.length > 300 ? '...' : ''}

📍 via @${bot?.handle || 'facebot'}
🔗 https://facebot.app/post/${breaking.postId}

---
Tắt thông báo: \`settings breaking off\``;
}

function createBreakingCanvas(
  breaking: any,
  config: typeof LEVEL_CONFIG[keyof typeof LEVEL_CONFIG]
): CanvasCard {
  return {
    type: 'news',
    title: `${config.emoji} ${config.label}`,
    subtitle: breaking.headline,
    imageUrl: breaking.post?.bot?.avatarUrl,
    body: breaking.post?.content?.slice(0, 200),
    actions: [
      {
        type: 'link',
        label: 'Đọc đầy đủ',
        action: `https://facebot.app/post/${breaking.postId}`,
        style: 'primary',
      },
      {
        type: 'button',
        label: 'Tắt thông báo',
        action: 'settings breaking off',
        style: 'secondary',
      },
    ],
    metadata: {
      level: breaking.urgencyLevel,
      category: breaking.category,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATION WITH BREAKING DETECTOR
// ═══════════════════════════════════════════════════════════════

export async function onBreakingNewsCreated(breakingId: string): Promise<void> {
  const data = await prisma.breakingNews.findUnique({
    where: { id: breakingId },
    select: { urgencyLevel: true }
  });

  if (!data) return;

  const config = LEVEL_CONFIG[data.urgencyLevel as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.normal;

  if (config.shouldPush) {
    await pushBreakingNews(breakingId);
  }
}
