// OpenClaw Distribution Module - Broadcast posts to multiple channels

import { getOpenClawClient, OpenClawClient } from './client';
import {
  Attachment,
  ChannelType,
  DistributionRequest,
  DistributionResult,
  ChannelDistributionResult,
  ChannelBinding,
  FACEBOT_BOTS,
} from './types';

// ============================================
// Channel Configuration
// ============================================

interface ChannelConfig {
  enabled: boolean;
  targetId: string;
  targetName: string;
  parseMode: 'text' | 'markdown' | 'html';
  prefix?: string;
  suffix?: string;
}

type DistributionConfig = Partial<Record<ChannelType, ChannelConfig>>;

// Default configuration - update with actual channel IDs
const DEFAULT_DISTRIBUTION_CONFIG: DistributionConfig = {
  telegram: {
    enabled: !!process.env.TELEGRAM_CHANNEL_ID,
    targetId: process.env.TELEGRAM_CHANNEL_ID || '',
    targetName: 'FACEBOT News',
    parseMode: 'markdown',
    prefix: '',
    suffix: '\n\n📱 Xem thêm tại FACEBOT',
  },
  discord: {
    enabled: !!process.env.DISCORD_CHANNEL_ID,
    targetId: process.env.DISCORD_CHANNEL_ID || '',
    targetName: 'facebot-feed',
    parseMode: 'markdown',
    prefix: '',
    suffix: '',
  },
  zalo: {
    enabled: !!process.env.ZALO_GROUP_ID,
    targetId: process.env.ZALO_GROUP_ID || '',
    targetName: 'FACEBOT Community',
    parseMode: 'text',
    prefix: '',
    suffix: '',
  },
};

// ============================================
// Distribution Manager
// ============================================

class DistributionManager {
  private client: OpenClawClient;
  private config: DistributionConfig;
  private botChannelBindings = new Map<string, ChannelBinding[]>();

  constructor(client?: OpenClawClient, config?: DistributionConfig) {
    this.client = client || getOpenClawClient();
    this.config = config || DEFAULT_DISTRIBUTION_CONFIG;
  }

  // ============================================
  // Configuration
  // ============================================

  setConfig(config: Partial<DistributionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DistributionConfig {
    return { ...this.config };
  }

  setChannelConfig(channel: ChannelType, config: Partial<ChannelConfig>): void {
    const current = this.config[channel] || {
      enabled: false,
      targetId: '',
      targetName: '',
      parseMode: 'text' as const,
    };
    this.config[channel] = { ...current, ...config };
  }

  // ============================================
  // Bot Channel Bindings
  // ============================================

  bindBotToChannel(botHandle: string, binding: ChannelBinding): void {
    const bindings = this.botChannelBindings.get(botHandle) || [];
    bindings.push(binding);
    this.botChannelBindings.set(botHandle, bindings);
  }

  getBotBindings(botHandle: string): ChannelBinding[] {
    return this.botChannelBindings.get(botHandle) || [];
  }

  // ============================================
  // Distribution
  // ============================================

  async distributePost(request: DistributionRequest): Promise<DistributionResult> {
    const results: ChannelDistributionResult[] = [];
    const channels = request.channels.length > 0
      ? request.channels
      : this.getEnabledChannels();

    for (const channel of channels) {
      const result = await this.sendToChannel(channel, request);
      results.push(result);
    }

    return {
      postId: request.postId,
      results,
      timestamp: Date.now(),
    };
  }

  async distributeToAll(request: Omit<DistributionRequest, 'channels'>): Promise<DistributionResult> {
    return this.distributePost({
      ...request,
      channels: this.getEnabledChannels(),
    });
  }

  private async sendToChannel(
    channel: ChannelType,
    request: DistributionRequest
  ): Promise<ChannelDistributionResult> {
    const channelConfig = this.config[channel];

    if (!channelConfig?.enabled) {
      return {
        channel,
        success: false,
        error: 'Channel not enabled',
      };
    }

    try {
      const formattedContent = this.formatContent(request, channelConfig);

      const result = await this.client.sendToChannel(
        channel,
        channelConfig.targetId,
        formattedContent,
        {
          attachments: request.attachments?.map((a) => ({
            type: a.type,
            url: a.url,
          })),
          parseMode: channelConfig.parseMode,
        }
      );

      return {
        channel,
        success: true,
        messageId: result.messageId,
        url: result.url,
      };
    } catch (error) {
      return {
        channel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private formatContent(
    request: DistributionRequest,
    config: ChannelConfig
  ): string {
    const bot = FACEBOT_BOTS[request.botHandle];
    const botName = bot?.nameVi || request.botHandle;

    let content = '';

    // Add bot attribution
    content += `**${botName}** (@${request.botHandle})\n\n`;

    // Add prefix
    if (config.prefix) {
      content += config.prefix + '\n';
    }

    // Add main content
    content += request.content;

    // Add suffix
    if (config.suffix) {
      content += config.suffix;
    }

    return content;
  }

  private getEnabledChannels(): ChannelType[] {
    return (Object.entries(this.config) as [ChannelType, ChannelConfig | undefined][])
      .filter(([, config]) => config?.enabled)
      .map(([channel]) => channel);
  }

  // ============================================
  // Scheduled Distribution
  // ============================================

  async scheduleDistribution(
    request: DistributionRequest,
    scheduledAt: Date
  ): Promise<string> {
    const delay = scheduledAt.getTime() - Date.now();

    if (delay <= 0) {
      // Execute immediately
      await this.distributePost(request);
      return `immediate_${request.postId}`;
    }

    // Schedule for later
    const scheduleId = `schedule_${request.postId}_${scheduledAt.getTime()}`;

    setTimeout(() => {
      this.distributePost(request).catch(console.error);
    }, delay);

    return scheduleId;
  }

  // ============================================
  // Channel-specific Methods
  // ============================================

  async sendToTelegram(
    content: string,
    options?: {
      botHandle?: string;
      attachments?: Attachment[];
    }
  ): Promise<ChannelDistributionResult> {
    return this.sendToChannel('telegram', {
      postId: `tg_${Date.now()}`,
      content,
      botHandle: options?.botHandle || 'facebot',
      channels: ['telegram'],
      attachments: options?.attachments,
    });
  }

  async sendToDiscord(
    content: string,
    options?: {
      botHandle?: string;
      attachments?: Attachment[];
    }
  ): Promise<ChannelDistributionResult> {
    return this.sendToChannel('discord', {
      postId: `dc_${Date.now()}`,
      content,
      botHandle: options?.botHandle || 'facebot',
      channels: ['discord'],
      attachments: options?.attachments,
    });
  }

  // ============================================
  // Sync from Channels
  // ============================================

  onChannelMessage(
    callback: (event: {
      channel: ChannelType;
      senderId: string;
      senderName: string;
      content: string;
      replyToId?: string;
      timestamp: number;
    }) => void
  ): void {
    this.client.on('event', (event) => {
      if (event.type === 'channel' && event.action === 'message') {
        const data = event.data as {
          senderId: string;
          senderName: string;
          content: string;
          replyToId?: string;
        };

        callback({
          channel: event.channel.type as ChannelType,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          replyToId: data.replyToId,
          timestamp: Date.now(),
        });
      }
    });
  }
}

// Singleton instance
let distributionInstance: DistributionManager | null = null;

export function getDistributionManager(): DistributionManager {
  if (!distributionInstance) {
    distributionInstance = new DistributionManager();
  }
  return distributionInstance;
}

export function createDistributionManager(
  client?: OpenClawClient,
  config?: DistributionConfig
): DistributionManager {
  return new DistributionManager(client, config);
}

export { DistributionManager };
export type { DistributionConfig, ChannelConfig };
