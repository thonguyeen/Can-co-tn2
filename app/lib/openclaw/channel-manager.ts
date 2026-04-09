import { prisma } from '@/lib/db';
import { getOpenClawClient } from './client';
import { OpenClawChannel } from './types';
import { generateVerificationCode } from './security';

export interface UserChannel {
  id: string;
  userId: string;
  channel: OpenClawChannel;
  channelId: string;
  channelName?: string;
  isVerified: boolean;
  isPrimary: boolean;
  subscriptions: string[];
  preferences: ChannelPreferences;
  linkedAt: string;
  lastActiveAt: string;
}

export interface ChannelPreferences {
  breakingNews: boolean;
  dailyDigest: boolean;
  digestTime: string;
  achievements: boolean;
  predictions: boolean;
  botReplies: boolean;
  language: 'vi' | 'en';
}

const DEFAULT_PREFERENCES: ChannelPreferences = {
  breakingNews: true,
  dailyDigest: true,
  digestTime: '07:00',
  achievements: true,
  predictions: true,
  botReplies: true,
  language: 'vi',
};

// ═══════════════════════════════════════════════════════════════
// LINKING OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function initiateChannelLink(
  userId: string,
  channel: OpenClawChannel
): Promise<{ code: string; expiresAt: string }> {
  console.warn('[OpenClaw] Channel linking disabled: Table channelLinkRequest missing');
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  return { code, expiresAt };
}

export async function verifyChannelLink(
  channel: OpenClawChannel,
  channelId: string,
  code: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  console.warn('[OpenClaw] verifyChannelLink disabled: Table channelLinkRequest missing');
  return { success: false, error: 'Tính năng liên kết kênh tạm thời bảo trì.' };
}

export async function unlinkChannel(
  userId: string,
  channel: OpenClawChannel
): Promise<void> {
  console.warn('[OpenClaw] unlinkChannel disabled: Table userChannel missing');
}

// ═══════════════════════════════════════════════════════════════
// QUERY OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function getUserByChannelId(
  channel: OpenClawChannel,
  channelId: string
): Promise<{ userId: string; preferences: ChannelPreferences } | null> {
  return null;
}

export async function getUserChannels(userId: string): Promise<UserChannel[]> {
  return [];
}

export async function getSubscribedUsers(
  category: string,
  notificationType: keyof ChannelPreferences
): Promise<{ channel: OpenClawChannel; channelId: string; userId: string }[]> {
  return [];
}

// ═══════════════════════════════════════════════════════════════
// PREFERENCE OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function updateChannelPreferences(
  userId: string,
  channel: OpenClawChannel,
  preferences: Partial<ChannelPreferences>
): Promise<void> {}

export async function updateSubscriptions(
  userId: string,
  channel: OpenClawChannel,
  subscriptions: string[]
): Promise<void> {}

export async function setPrimaryChannel(
  userId: string,
  channel: OpenClawChannel
): Promise<void> {}

export { DEFAULT_PREFERENCES };
