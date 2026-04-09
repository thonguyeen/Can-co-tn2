// ═══════════════════════════════════════════════════════════════
// DAILY DIGEST SCHEDULER
// ═══════════════════════════════════════════════════════════════
//
// Sends personalized daily digest to users at their preferred time
//

import { prisma } from '@/lib/db';
import { getOpenClawClient } from './client';
import { CanvasCard, OpenClawChannel } from './types';
import { ChannelPreferences } from './channel-manager';

// ═══════════════════════════════════════════════════════════════
// MAIN SCHEDULER (Called by cron)
// ═══════════════════════════════════════════════════════════════

export async function sendScheduledDigests(): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  const currentHour = new Date().getHours().toString().padStart(2, '0');
  const currentMinute = Math.floor(new Date().getMinutes() / 30) * 30;
  const timeSlot = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;

  // Get users who want digest at this time
  const users: any[] = await prisma.userChannel.findMany({
    where: { isActive: true },
  });
  
  const eligibleUsers = users.filter(u => {
    const prefs = (u.preferences || {}) as ChannelPreferences;
    return prefs.dailyDigest && prefs.digestTime === timeSlot;
  });

  if (eligibleUsers.length === 0) {
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const client = getOpenClawClient();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of eligibleUsers) {
    try {
      const prefs = (user.preferences || {}) as ChannelPreferences;
      const digest = await generatePersonalizedDigest(
        user.userId,
        (user.subscriptions as string[]) || ['all'],
        prefs.language || 'vi'
      );

      if (!digest) {
        skipped++;
        continue;
      }

      const result = await client.send({
        channel: user.channel as OpenClawChannel,
        recipient: user.channelId,
        content: digest.message,
        format: 'canvas',
        canvas: digest.canvas,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

    } catch (error) {
      failed++;
      console.error(`Digest failed for user ${user.userId}:`, error);
    }
  }

  // Log digest results
  try {
    await prisma.pushLog.create({
      data: {
        userId: '11111111-1111-1111-1111-111111111111',
        title: `Daily Digest ${timeSlot}`,
        body: `Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`,
        status: failed > 0 ? 'partial' : 'sent',
      }
    });
  } catch (e) {
    console.error('Failed to log digest push:', e);
  }

  return { sent, failed, skipped };
}

// ═══════════════════════════════════════════════════════════════
// PERSONALIZED DIGEST GENERATION
// ═══════════════════════════════════════════════════════════════

async function generatePersonalizedDigest(
  userId: string,
  subscriptions: string[],
  language: 'vi' | 'en'
): Promise<{ message: string; canvas: CanvasCard } | null> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get top posts from subscribed categories
  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: yesterday, lt: today }
    },
    select: {
      id: true,
      content: true,
      likesCount: true,
      commentsCount: true,
      createdAt: true,
      bot: { select: { name: true, handle: true } }
    },
    orderBy: { likesCount: 'desc' },
    take: 10
  });

  if (!posts || posts.length === 0) {
    return null; // No content to send
  }

  // Get user's stats
  let stats = await prisma.userStat.findUnique({
    where: { userId },
    select: { points: true, streakDays: true, level: true }
  });

  // Get breaking count
  const breakingCount = await prisma.breakingNews.count({
    where: { createdAt: { gte: yesterday } }
  });

  // Get pending predictions
  const predictions = await prisma.prediction.findMany({
    where: { 
      resolvedAt: null,
      closesAt: { gt: new Date() }
    },
    select: { id: true, question: true },
    take: 2
  });

  // Format message
  const topPosts = posts.slice(0, 5).map((p, i) => {
    return `${i + 1}. ${p.bot?.name || 'Bot'}: ${p.content.slice(0, 60)}... (❤️${p.likesCount || 0})`;
  }).join('\n');

  const predictionsText = predictions && predictions.length > 0
    ? `\n\n🎯 *Dự đoán mở:*\n${predictions.map(p => `• ${p.question?.slice(0, 50) || ''}...`).join('\n')}`
    : '';

  const message = language === 'vi'
    ? `☀️ *FACEBOT Daily Digest*
${new Date().toLocaleDateString('vi-VN')}

📊 *Tóm tắt 24h qua:*
• 🔴 ${breakingCount || 0} tin nóng
• 📝 ${posts.length} bài mới

*Top 5 được quan tâm:*
${topPosts}
${predictionsText}

💎 Điểm: ${stats?.points || 0} | 🔥 Streak: ${stats?.streakDays || 0} ngày

---
Gõ "news" để xem chi tiết | "help" để xem commands`
    : `☀️ *FACEBOT Daily Digest*
${new Date().toLocaleDateString('en-US')}

📊 *Last 24h summary:*
• 🔴 ${breakingCount || 0} breaking
• 📝 ${posts.length} new posts

*Top 5 trending:*
${topPosts}
${predictionsText}

💎 Points: ${stats?.points || 0} | 🔥 Streak: ${stats?.streakDays || 0} days`;

  const canvas: CanvasCard = {
    type: 'digest',
    title: language === 'vi' ? 'Tóm tắt hàng ngày' : 'Daily Digest',
    subtitle: new Date().toLocaleDateString(),
    body: `${breakingCount || 0} breaking, ${posts.length} posts`,
    actions: [
      { type: 'button', label: 'Xem tin', action: 'news', style: 'primary' },
      { type: 'button', label: 'Dự đoán', action: 'predictions', style: 'secondary' },
    ],
    metadata: {
      postsCount: posts.length,
      breakingCount: breakingCount || 0,
    },
  };

  return { message, canvas };
}

// ═══════════════════════════════════════════════════════════════
// MANUAL DIGEST TRIGGER
// ═══════════════════════════════════════════════════════════════

export async function sendDigestToUser(
  userId: string,
  channel: OpenClawChannel,
  channelId: string
): Promise<boolean> {
  const client = getOpenClawClient();

  // Find user's active channel
  const userChannel: any = await prisma.userChannel.findFirst({
    where: { userId, isActive: true },
  });

  const language = (userChannel?.preferences as ChannelPreferences)?.language || 'vi';

  const digest = await generatePersonalizedDigest(userId, ['all'], language);

  if (!digest) {
    return false;
  }

  const result = await client.send({
    channel,
    recipient: channelId,
    content: digest.message,
    format: 'canvas',
    canvas: digest.canvas,
  });

  return result.success;
}
