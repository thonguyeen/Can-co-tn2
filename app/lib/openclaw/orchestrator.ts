// ═══════════════════════════════════════════════════════════════
// BOT ORCHESTRATOR - Autonomous Bot Activity System
// Manages 100+ bots posting, commenting, debating automatically
// ═══════════════════════════════════════════════════════════════

import { getOpenClawClient, OpenClawClient } from './client';
import { getSessionManager, SessionManager } from './sessions';
import { getBotFactory, BotFactory, GeneratedBot } from './bot-factory';
import { getDistributionManager } from './distribution';
import {
  savePost, saveComment, saveDebate, logActivity,
  saveIntentFromBot, checkBotQuota, incrementPostsToday, checkDuplicate,
  matchBotToRegion,
} from './persistence';
import { DEEP_PERSONAS } from './deep-persona';
import { getNewsReactor, NewsReactor } from './news-reactor';
import { chatWithJSON } from '@/lib/ai/client';

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR CONFIG
// ═══════════════════════════════════════════════════════════════

interface OrchestratorConfig {
  // Activity intervals (in ms)
  postInterval: number;        // How often bots create posts
  commentInterval: number;     // How often bots comment
  debateInterval: number;      // How often debates are initiated

  // Limits
  maxConcurrentActivities: number;
  maxPostsPerHour: number;
  maxCommentsPerHour: number;

  // Features
  enableAutoPosting: boolean;
  enableAutoCommenting: boolean;
  enableDebates: boolean;
  enableInterBotChat: boolean;
  dryRun: boolean;  // true = chế độ Test (chỉ log, không đăng thật)
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  postInterval: 5 * 60 * 1000,      // 5 minutes
  commentInterval: 2 * 60 * 1000,   // 2 minutes
  debateInterval: 15 * 60 * 1000,   // 15 minutes
  maxConcurrentActivities: 10,
  maxPostsPerHour: 50,
  maxCommentsPerHour: 200,
  enableAutoPosting: true,
  enableAutoCommenting: true,
  enableDebates: true,
  enableInterBotChat: true,
  dryRun: false,  // Mặc định: chế độ LIVE (đăng thật)
};

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPES
// ═══════════════════════════════════════════════════════════════

type ActivityType = 'post' | 'comment' | 'reply' | 'debate' | 'react';

interface Activity {
  id: string;
  type: ActivityType;
  botHandle: string;
  targetId?: string;  // post_id or comment_id
  content?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  error?: string;
}

interface DebateSession {
  id: string;
  topic: string;
  participants: string[];  // bot handles
  rounds: DebateRound[];
  status: 'active' | 'completed';
  startedAt: number;
}

interface DebateRound {
  botHandle: string;
  content: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY: Strip <think> tags from LLM output
// ═══════════════════════════════════════════════════════════════

function stripThinkTags(content: string): string {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\/?think>/gi, '')
    .trim();
}

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════

export class BotOrchestrator {
  private client: OpenClawClient;
  private sessionManager: SessionManager;
  private botFactory: BotFactory;
  private newsReactor: NewsReactor;
  private config: OrchestratorConfig;

  private activities: Map<string, Activity> = new Map();
  private debates: Map<string, DebateSession> = new Map();
  private activeBots: Set<string> = new Set();

  private postTimer: NodeJS.Timeout | null = null;
  private commentTimer: NodeJS.Timeout | null = null;
  private debateTimer: NodeJS.Timeout | null = null;

  private isRunning = false;
  private startedAt: number | null = null;
  private activityQueue: Activity[] = [];

  constructor(config?: Partial<OrchestratorConfig>) {
    this.client = getOpenClawClient();
    this.sessionManager = getSessionManager();
    this.botFactory = getBotFactory();
    this.newsReactor = getNewsReactor();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  async start(): Promise<void> {
    if (this.isRunning) return;

    const mode = this.config.dryRun ? 'TEST (dry-run)' : 'LIVE';
    console.log(`[Orchestrator] Starting bot orchestration in ${mode} mode...`);
    this.isRunning = true;
    this.startedAt = Date.now();

    // Connect to OpenClaw
    if (!this.client.isConnected()) {
      await this.client.connect();
    }

    // Initialize all bot sessions
    await this.sessionManager.initializeAllBots();

    // Start activity loops
    if (this.config.enableAutoPosting) {
      this.startPostingLoop();
    }
    if (this.config.enableAutoCommenting) {
      this.startCommentingLoop();
    }
    if (this.config.enableDebates) {
      this.startDebateLoop();
    }

    // Start news reactor
    this.newsReactor.start();

    console.log(`[Orchestrator] Bot orchestration started in ${mode} mode (with news reactor)`);
  }

  stop(): void {
    this.isRunning = false;
    this.startedAt = null;

    if (this.postTimer) clearInterval(this.postTimer);
    if (this.commentTimer) clearInterval(this.commentTimer);
    if (this.debateTimer) clearInterval(this.debateTimer);

    // Stop news reactor
    this.newsReactor.stop();

    console.log('[Orchestrator] Bot orchestration stopped');
  }

  // ═══════════════════════════════════════════════════════════════
  // MODE CONTROL
  // ═══════════════════════════════════════════════════════════════

  setMode(dryRun: boolean): void {
    this.config.dryRun = dryRun;
    console.log(`[Orchestrator] Mode switched to: ${dryRun ? 'TEST (dry-run)' : 'LIVE'}`);
  }

  isDryRun(): boolean {
    return this.config.dryRun;
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTO POSTING
  // ═══════════════════════════════════════════════════════════════

  private startPostingLoop(): void {
    this.postTimer = setInterval(async () => {
      if (!this.isRunning) return;
      await this.triggerRandomPost();
    }, this.config.postInterval);

    // Immediate first post
    this.triggerRandomPost();
  }

  async triggerRandomPost(): Promise<void> {
    const bots = this.sessionManager.getAllSessions();
    if (bots.length === 0) return;

    // Pick a random bot that's not currently active
    const availableBots = bots.filter(b => !this.activeBots.has(b.botHandle));
    if (availableBots.length === 0) return;

    const bot = availableBots[Math.floor(Math.random() * availableBots.length)];
    await this.createPost(bot.botHandle);
  }

  async createPost(botHandle: string, topic?: string): Promise<Activity> {
    const activity: Activity = {
      id: `post_${Date.now()}_${botHandle}`,
      type: 'post',
      botHandle,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.activities.set(activity.id, activity);
    this.activeBots.add(botHandle);

    try {
      activity.status = 'running';

      // Generate post topic if not provided
      const postTopic = topic || await this.generatePostTopic(botHandle);

      // Determine post type based on persona
      let postType: 'short' | 'medium' | 'long' | 'analysis' = 'medium';
      const persona = DEEP_PERSONAS[botHandle];
      if (persona) {
        const ratio = persona.preferredContentRatio;
        const rand = Math.random() * 100;
        if (rand < ratio.short) postType = 'short';
        else if (rand < ratio.short + ratio.medium) postType = 'medium';
        else postType = 'long';
      }

      // Use deep persona to generate post
      const content = await this.sessionManager.generatePost(botHandle, postTopic, postType);

      activity.content = content;
      activity.status = 'completed';
      activity.completedAt = Date.now();

      // Skip database save if in dryRun mode
      if (this.config.dryRun) {
        console.log(`[Orchestrator][TEST] @${botHandle} generated: ${content.slice(0, 50)}... (NOT SAVED)`);
        return activity;
      }

      // Save to database
      const postId = await savePost({
        botHandle,
        content,
        topic: postTopic,
        metadata: { activityId: activity.id },
      });

      // Log activity
      await logActivity({
        type: 'post',
        botHandle,
        targetId: postId || undefined,
        content,
      });

      console.log(`[Orchestrator] @${botHandle} posted: ${content.slice(0, 50)}...`);

      return activity;
    } catch (error) {
      activity.status = 'failed';
      activity.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Orchestrator] Post failed for @${botHandle}:`, activity.error);
      return activity;
    } finally {
      this.activeBots.delete(botHandle);
    }
  }

  private async generatePostTopic(botHandle: string): Promise<string> {
    const topics = [
      'Tin tức công nghệ mới nhất hôm nay',
      'Xu hướng AI đang thay đổi ngành công nghiệp',
      'Phân tích thị trường crypto tuần này',
      'Startup Việt Nam gọi vốn thành công',
      'Review sản phẩm công nghệ hot',
      'Esports Việt Nam thi đấu quốc tế',
      'Bảo mật mạng và privacy',
      'Chính sách công nghệ mới',
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  // ═══════════════════════════════════════════════════════════════
  // AUTO COMMENTING
  // ═══════════════════════════════════════════════════════════════

  private startCommentingLoop(): void {
    this.commentTimer = setInterval(async () => {
      if (!this.isRunning) return;
      await this.triggerRandomComment();
    }, this.config.commentInterval);
  }

  async triggerRandomComment(): Promise<void> {
    const bots = this.sessionManager.getAllSessions();
    if (bots.length === 0) return;

    const availableBots = bots.filter(b => !this.activeBots.has(b.botHandle));
    if (availableBots.length === 0) return;

    const bot = availableBots[Math.floor(Math.random() * availableBots.length)];
    // In real implementation, would fetch recent posts and comment on one
    // await this.createComment(bot.botHandle, randomPostId);
  }

  async createComment(
    botHandle: string,
    postId: string,
    postContent: string
  ): Promise<Activity> {
    const activity: Activity = {
      id: `comment_${Date.now()}_${botHandle}`,
      type: 'comment',
      botHandle,
      targetId: postId,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.activities.set(activity.id, activity);
    this.activeBots.add(botHandle);

    try {
      activity.status = 'running';

      const content = await this.sessionManager.chat(
        botHandle,
        `Đọc bài viết sau và viết một comment ngắn (1-2 câu) thể hiện quan điểm của bạn:\n\n"${postContent}"`
      );

      activity.content = content;
      activity.status = 'completed';
      activity.completedAt = Date.now();

      // Skip database save if in dryRun mode
      if (this.config.dryRun) {
        console.log(`[Orchestrator][TEST] @${botHandle} commented: ${content.slice(0, 50)}... (NOT SAVED)`);
        return activity;
      }

      // Save to database
      const commentId = await saveComment({
        botHandle,
        postId,
        content,
      });

      // Log activity
      await logActivity({
        type: 'comment',
        botHandle,
        targetId: commentId || undefined,
        content,
      });

      console.log(`[Orchestrator] @${botHandle} commented: ${content.slice(0, 50)}...`);

      return activity;
    } catch (error) {
      activity.status = 'failed';
      activity.error = error instanceof Error ? error.message : 'Unknown error';
      return activity;
    } finally {
      this.activeBots.delete(botHandle);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DEBATES
  // ═══════════════════════════════════════════════════════════════

  private startDebateLoop(): void {
    this.debateTimer = setInterval(async () => {
      if (!this.isRunning) return;
      await this.triggerRandomDebate();
    }, this.config.debateInterval);
  }

  async triggerRandomDebate(): Promise<void> {
    const bots = this.sessionManager.getAllSessions();
    if (bots.length < 2) return;

    // Pick 2 random bots for debate
    const shuffled = bots.sort(() => Math.random() - 0.5);
    const [bot1, bot2] = shuffled.slice(0, 2);

    const topics = [
      'AI có thể thay thế lập trình viên không?',
      'Bitcoin sẽ đạt $200k trong 2026?',
      'Remote work hay office work tốt hơn?',
      'Startup nên bootstrap hay gọi vốn?',
      'TikTok có hại cho giới trẻ không?',
    ];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    await this.startDebate(bot1.botHandle, bot2.botHandle, topic);
  }

  async startDebate(
    bot1Handle: string,
    bot2Handle: string,
    topic: string,
    rounds = 3
  ): Promise<DebateSession> {
    const debate: DebateSession = {
      id: `debate_${Date.now()}`,
      topic,
      participants: [bot1Handle, bot2Handle],
      rounds: [],
      status: 'active',
      startedAt: Date.now(),
    };

    this.debates.set(debate.id, debate);
    console.log(`[Orchestrator] Debate started: @${bot1Handle} vs @${bot2Handle} on "${topic}"`);

    try {
      // Bot 1 opens with deep persona
      const opener = await this.sessionManager.generateDeepDebateResponse(
        bot1Handle,
        topic,
        bot2Handle,
        `[Mở đầu tranh luận về: ${topic}]`,
        0
      );
      debate.rounds.push({
        botHandle: bot1Handle,
        content: opener,
        timestamp: Date.now(),
      });

      // Exchange rounds using deep debate
      for (let i = 0; i < rounds; i++) {
        // Bot 2 responds
        const lastRound = debate.rounds[debate.rounds.length - 1];
        const response2 = await this.sessionManager.generateDeepDebateResponse(
          bot2Handle,
          topic,
          bot1Handle,
          lastRound.content,
          i * 2 + 1
        );
        debate.rounds.push({
          botHandle: bot2Handle,
          content: response2,
          timestamp: Date.now(),
        });

        // Bot 1 responds (except last round)
        if (i < rounds - 1) {
          const lastRound2 = debate.rounds[debate.rounds.length - 1];
          const response1 = await this.sessionManager.generateDeepDebateResponse(
            bot1Handle,
            topic,
            bot2Handle,
            lastRound2.content,
            i * 2 + 2
          );
          debate.rounds.push({
            botHandle: bot1Handle,
            content: response1,
            timestamp: Date.now(),
          });
        }
      }

      debate.status = 'completed';
      console.log(`[Orchestrator] Debate completed: ${debate.rounds.length} rounds`);

      // Skip database save if in dryRun mode
      if (this.config.dryRun) {
        console.log(`[Orchestrator][TEST] Debate completed on "${topic}" (NOT SAVED)`);
        return debate;
      }

      // Save to database
      const debateId = await saveDebate({
        topic,
        participants: [bot1Handle, bot2Handle],
        rounds: debate.rounds,
      });

      // Log activity
      await logActivity({
        type: 'debate',
        botHandle: bot1Handle,
        targetId: debateId || undefined,
        content: `Debate: ${topic}`,
        metadata: { opponent: bot2Handle, roundsCount: debate.rounds.length },
      });

      return debate;
    } catch (error) {
      console.error(`[Orchestrator] Debate failed:`, error);
      debate.status = 'completed';
      return debate;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INTER-BOT COMMUNICATION
  // ═══════════════════════════════════════════════════════════════

  async sendBotMessage(
    fromHandle: string,
    toHandle: string,
    message: string
  ): Promise<string> {
    console.log(`[Orchestrator] @${fromHandle} → @${toHandle}: ${message.slice(0, 50)}...`);

    // Get response from target bot
    const response = await this.sessionManager.chat(
      toHandle,
      `@${fromHandle} gửi cho bạn:\n"${message}"\n\nTrả lời ngắn gọn.`
    );

    // Log activity
    await logActivity({
      type: 'message',
      botHandle: fromHandle,
      content: message,
      metadata: { to: toHandle, response },
    });

    return response;
  }

  // ═══════════════════════════════════════════════════════════════
  // MULTI-BOT DISCUSSIONS (5+ bots discussing same topic)
  // ═══════════════════════════════════════════════════════════════

  async startMultiBotDiscussion(
    topic: string,
    botHandles: string[],
    options: {
      maxRounds?: number;
      style?: 'casual' | 'debate' | 'brainstorm' | 'analysis';
      allowConflict?: boolean;
    } = {}
  ): Promise<MultiDiscussionSession> {
    const {
      maxRounds = 2,
      style = 'casual',
      allowConflict = true,
    } = options;

    if (botHandles.length < 2) {
      throw new Error('Need at least 2 bots for discussion');
    }

    const discussion: MultiDiscussionSession = {
      id: `discussion_${Date.now()}`,
      topic,
      style,
      participants: botHandles,
      contributions: [],
      status: 'active',
      startedAt: Date.now(),
    };

    console.log(`[Orchestrator] Multi-bot discussion started: "${topic}" with ${botHandles.length} bots`);
    console.log(`[Orchestrator] Participants: ${botHandles.map(h => `@${h}`).join(', ')}`);

    try {
      // Build context about all participants
      const participantInfo = botHandles.map(handle => {
        const persona = DEEP_PERSONAS[handle];
        if (persona) {
          const desc = persona.primaryExpertise || persona.displayNameVi;
          return `@${handle} (${desc})`;
        }
        return `@${handle}`;
      }).join(', ');

      // Round robin: each bot contributes in each round
      for (let round = 0; round < maxRounds; round++) {
        console.log(`[Orchestrator] Discussion round ${round + 1}/${maxRounds}`);

        for (const botHandle of botHandles) {
          // Build conversation history for context
          const recentContributions = discussion.contributions.slice(-5);
          const conversationContext = recentContributions.length > 0
            ? recentContributions.map(c => `@${c.botHandle}: ${c.content}`).join('\n\n')
            : '[Chưa có ai phát biểu]';

          // Generate prompt based on style
          let prompt: string;
          const isFirst = discussion.contributions.length === 0 && botHandle === botHandles[0];

          if (isFirst) {
            prompt = this.buildDiscussionOpenerPrompt(topic, style, participantInfo, allowConflict);
          } else {
            prompt = this.buildDiscussionResponsePrompt(
              topic,
              style,
              conversationContext,
              participantInfo,
              botHandle,
              round,
              allowConflict
            );
          }

          // Generate response
          const content = await this.sessionManager.chat(botHandle, prompt);

          discussion.contributions.push({
            botHandle,
            content,
            round,
            timestamp: Date.now(),
          });

          console.log(`[Orchestrator] @${botHandle} (round ${round + 1}): ${content.slice(0, 60)}...`);

          // Small delay between responses for natural feel
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      discussion.status = 'completed';
      discussion.completedAt = Date.now();

      console.log(`[Orchestrator] Discussion completed: ${discussion.contributions.length} contributions`);

      // Save discussion as a post
      const mainBot = botHandles[0];
      const discussionContent = this.formatDiscussionAsPost(discussion);

      const postId = await savePost({
        botHandle: mainBot,
        content: discussionContent,
        topic,
        metadata: {
          type: 'multi_discussion',
          discussionId: discussion.id,
          participants: botHandles,
          contributionsCount: discussion.contributions.length,
          style,
        },
      });

      // Log activity
      await logActivity({
        type: 'debate', // Using debate type for discussions
        botHandle: mainBot,
        targetId: postId || undefined,
        content: `Multi-bot discussion: ${topic}`,
        metadata: {
          participants: botHandles,
          style,
          rounds: maxRounds,
        },
      });

      return discussion;
    } catch (error) {
      console.error(`[Orchestrator] Discussion failed:`, error);
      discussion.status = 'completed';
      return discussion;
    }
  }

  private buildDiscussionOpenerPrompt(
    topic: string,
    style: string,
    participantInfo: string,
    allowConflict: boolean
  ): string {
    const styleGuide = {
      casual: 'Thảo luận thoải mái, chia sẻ quan điểm cá nhân. Có thể dùng emoji.',
      debate: 'Tranh luận nghiêm túc với luận điểm rõ ràng. Có thể phản bác ý kiến khác.',
      brainstorm: 'Đưa ra ý tưởng sáng tạo, xây dựng trên ý tưởng của người khác.',
      analysis: 'Phân tích sâu với dữ liệu và logic. Cân nhắc nhiều góc độ.',
    };

    return `Bạn đang tham gia thảo luận nhóm về: "${topic}"

Người tham gia: ${participantInfo}
Phong cách: ${styleGuide[style as keyof typeof styleGuide]}
${allowConflict ? 'Có thể có quan điểm khác biệt.' : 'Tìm điểm chung, xây dựng.'}

Bạn là người đầu tiên phát biểu. Mở đầu cuộc thảo luận với quan điểm của bạn về "${topic}".
Viết ngắn gọn (2-4 câu), đúng phong cách và personality của bạn.`;
  }

  private buildDiscussionResponsePrompt(
    topic: string,
    style: string,
    conversationContext: string,
    participantInfo: string,
    currentBot: string,
    round: number,
    allowConflict: boolean
  ): string {
    const styleGuide = {
      casual: 'Thảo luận thoải mái, có thể đồng ý hoặc bổ sung ý kiến.',
      debate: 'Có thể phản bác hoặc ủng hộ quan điểm cụ thể.',
      brainstorm: 'Xây dựng trên ý tưởng người khác, đề xuất mới.',
      analysis: 'Phân tích và bổ sung góc nhìn mới.',
    };

    return `Bạn đang tham gia thảo luận nhóm về: "${topic}"

Người tham gia: ${participantInfo}
Phong cách: ${styleGuide[style as keyof typeof styleGuide]}

CÁC Ý KIẾN TRƯỚC:
${conversationContext}

Bạn là @${currentBot}, đây là vòng ${round + 1}.
${allowConflict ? 'Có thể đồng ý, phản bác, hoặc đưa ra góc nhìn mới.' : 'Xây dựng trên ý kiến của người khác.'}

Viết response của bạn (2-4 câu). Có thể mention người khác (@handle). Đúng personality của bạn.`;
  }

  private formatDiscussionAsPost(discussion: MultiDiscussionSession): string {
    const styleEmoji = {
      casual: '💬',
      debate: '🔥',
      brainstorm: '💡',
      analysis: '📊',
    };

    const emoji = styleEmoji[discussion.style] || '💬';
    const header = `${emoji} THẢO LUẬN: ${discussion.topic}\n\n`;
    const participants = `👥 Người tham gia: ${discussion.participants.map(p => `@${p}`).join(', ')}\n\n`;

    const content = discussion.contributions.map(c =>
      `**@${c.botHandle}:** ${c.content}`
    ).join('\n\n');

    return `${header}${participants}---\n\n${content}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // ENVOY BOT POSTING (Ghi vào bảng intents)
  // ═══════════════════════════════════════════════════════════════

  async createEnvoyPost(
    botHandle: string,
    options?: {
      topic?: string;
      type?: 'CAN' | 'CO';
      source_url?: string;
      province?: string;
      district?: string;
      ward?: string;
      city?: string;
      price?: number;
    }
  ): Promise<Activity> {
    const activity: Activity = {
      id: `envoy_${Date.now()}_${botHandle}`,
      type: 'post',
      botHandle,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.activities.set(activity.id, activity);
    this.activeBots.add(botHandle);

    try {
      activity.status = 'running';

      // 1. Check quota
      const quota = await checkBotQuota(botHandle);
      if (!quota.allowed) {
        console.log(`[Orchestrator] @${botHandle} đã đạt quota (${quota.postsToday}/${quota.dailyQuota})`);
        activity.status = 'failed';
        activity.error = `Quota exceeded: ${quota.postsToday}/${quota.dailyQuota}`;
        return activity;
      }

      // 2. Check duplicate (nếu có source_url)
      if (options?.source_url) {
        const isDup = await checkDuplicate(options.source_url);
        if (isDup) {
          console.log(`[Orchestrator] Duplicate source_url: ${options.source_url}`);
          activity.status = 'failed';
          activity.error = 'Duplicate source_url';
          return activity;
        }
      }

      // 3. Generate content
      const postTopic = options?.topic || 'Tin BĐS mới nhất khu vực';
      const rawContent = await this.sessionManager.generatePost(botHandle, postTopic, 'medium');
      const cleanContent = stripThinkTags(rawContent);

      // 4. Parse title (dòng đầu hoặc 120 ký tự đầu)
      const title = cleanContent.split('\n')[0].slice(0, 120) || postTopic;

      // 5. Save to intents table
      const intentId = await saveIntentFromBot({
        botHandle,
        title,
        type: options?.type || 'CO',
        content: cleanContent,
        source_url: options?.source_url,
        province: options?.province,
        district: options?.district,
        ward: options?.ward,
        city: options?.city,
        price: options?.price,
      });

      // 6. Update quota counter
      await incrementPostsToday(botHandle);

      activity.content = cleanContent;
      activity.status = 'completed';
      activity.completedAt = Date.now();
      activity.targetId = intentId || undefined;

      // 7. Log
      await logActivity({
        type: 'post',
        botHandle,
        targetId: intentId || undefined,
        content: cleanContent,
      });

      console.log(`[Orchestrator] @${botHandle} envoy posted: ${title.slice(0, 50)}...`);
      return activity;
    } catch (error) {
      activity.status = 'failed';
      activity.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Orchestrator] Envoy post failed for @${botHandle}:`, activity.error);
      return activity;
    } finally {
      this.activeBots.delete(botHandle);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CRAWLED DATA → INTENT (Phase 03 sẽ gọi hàm này)
  // ═══════════════════════════════════════════════════════════════

  async createIntentFromCrawledData(rawData: {
    title: string;
    content: string;
    url: string;
    province?: string;
    district?: string;
  }): Promise<Activity | null> {
    // 1. Check duplicate
    const isDup = await checkDuplicate(rawData.url);
    if (isDup) {
      console.log(`[Orchestrator] Skip duplicate: ${rawData.url}`);
      return null;
    }

    // 2. Tìm Bot phù hợp (match khu vực)
    const botHandle = await matchBotToRegion(rawData.province, rawData.district);
    if (!botHandle) {
      console.log(`[Orchestrator] No bot for region: ${rawData.province}/${rawData.district}`);
      return null;
    }

    // 3. AI parse raw data → structured intent
    let intentData: { title: string; type: string; price?: number; content: string };
    try {
      intentData = await chatWithJSON<{ title: string; type: string; price?: number; content: string }>(
        'Bạn là một AI phân tích dữ liệu chuyên nghiệp. Chỉ xuất JSON hợp lệ, không có text nào khác.',
        `Phân tích tin BĐS sau:
Tiêu đề: ${rawData.title}
Nội dung: ${rawData.content.slice(0, 1000)}

YÊU CẦU: TRẢ LỜI NGHIÊM NGẶT BẰNG JSON HỢP LỆ. KHÔNG BỌC TRONG MARKDOWN. KHÔNG CÓ TEXT GIẢI THÍCH NÀO BÊN NGOÀI.
Cấu trúc yêu cầu:
{"title": "...", "type": "CAN" hoặc "CO", "price": 0, "content": "Mô tả ngắn 2-3 câu"}`,
        { maxRetries: 2, temperature: 0.1 }
      );
    } catch (e: any) {
      console.warn(`[Orchestrator] Failed to parse intent after retries:`, e.message);
      // Fallback: dùng raw data
      intentData = {
        title: rawData.title.slice(0, 120),
        type: 'CO',
        content: rawData.content.slice(0, 500),
      };
    }

    // 4. Save via createEnvoyPost
    return this.createEnvoyPost(botHandle, {
      topic: intentData.title,
      type: (intentData.type === 'CAN' ? 'CAN' : 'CO') as 'CAN' | 'CO',
      source_url: rawData.url,
      province: rawData.province,
      district: rawData.district,
      price: intentData.price || undefined,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // STATUS & MONITORING
  // ═══════════════════════════════════════════════════════════════

  getStatus(): OrchestratorStatus {
    return {
      isRunning: this.isRunning,
      mode: this.config.dryRun ? 'test' : 'live',
      startedAt: this.startedAt,
      uptimeMs: this.startedAt ? Date.now() - this.startedAt : 0,
      activeBots: Array.from(this.activeBots),
      totalActivities: this.activities.size,
      activeDebates: Array.from(this.debates.values()).filter(d => d.status === 'active').length,
      config: this.config,
    };
  }

  getRecentActivities(limit = 20, filters?: { botHandle?: string; status?: string }): Activity[] {
    let activitiesList = Array.from(this.activities.values());
    
    if (filters?.botHandle && filters.botHandle !== 'all') {
      activitiesList = activitiesList.filter(a => a.botHandle === filters.botHandle);
    }
    
    if (filters?.status && filters.status !== 'all') {
      activitiesList = activitiesList.filter(a => a.status === filters.status);
    }

    return activitiesList
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  getDebates(): DebateSession[] {
    return Array.from(this.debates.values());
  }
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface OrchestratorStatus {
  isRunning: boolean;
  mode: 'test' | 'live';
  startedAt: number | null;
  uptimeMs: number;
  activeBots: string[];
  totalActivities: number;
  activeDebates: number;
  config: OrchestratorConfig;
}

interface MultiDiscussionSession {
  id: string;
  topic: string;
  style: 'casual' | 'debate' | 'brainstorm' | 'analysis';
  participants: string[];
  contributions: DiscussionContribution[];
  status: 'active' | 'completed';
  startedAt: number;
  completedAt?: number;
}

interface DiscussionContribution {
  botHandle: string;
  content: string;
  round: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let orchestratorInstance: BotOrchestrator | null = null;

export function getOrchestrator(config?: Partial<OrchestratorConfig>): BotOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new BotOrchestrator(config);
    // Tự động chạy khi server bật (qua singleton access đầu tiên)
    orchestratorInstance.start();
  }
  return orchestratorInstance;
}

export type {
  OrchestratorConfig,
  Activity,
  DebateSession,
  DebateRound,
  OrchestratorStatus,
  MultiDiscussionSession,
  DiscussionContribution,
};
