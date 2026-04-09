// ═══════════════════════════════════════════════════════════════
// NEWS REACTOR - Bots React to Real News
// Orchestrates news fetching and bot reactions
// ═══════════════════════════════════════════════════════════════

import { getNewsCrawler, NewsItem, NEWS_SOURCES } from './news-crawler';
import { getSessionManager } from './sessions';
import { savePost, logActivity } from './persistence';
import { DEEP_PERSONAS, addStatedPosition } from './deep-persona';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NewsReaction {
  id: string;
  newsId: string;
  newsTitle: string;
  botHandle: string;
  content: string;
  reactionType: 'post' | 'comment' | 'analysis' | 'skip';
  createdAt: number;
  savedToDb: boolean;
}

interface ReactorConfig {
  // How often to check for news (minutes)
  checkInterval: number;

  // Max reactions per check
  maxReactionsPerCheck: number;

  // Min time between reactions from same bot (minutes)
  botCooldown: number;

  // Only react to news newer than this (hours)
  newsMaxAge: number;

  // Probability a bot reacts to relevant news (0-1)
  reactionProbability: number;
}

const DEFAULT_CONFIG: ReactorConfig = {
  checkInterval: 15,
  maxReactionsPerCheck: 5,
  botCooldown: 30,
  newsMaxAge: 6,
  reactionProbability: 0.7,
};

// ═══════════════════════════════════════════════════════════════
// NEWS REACTOR CLASS
// ═══════════════════════════════════════════════════════════════

export class NewsReactor {
  private config: ReactorConfig;
  private reactions: Map<string, NewsReaction> = new Map();
  private processedNews: Set<string> = new Set();
  private lastBotReaction: Map<string, number> = new Map();
  private isRunning = false;
  private checkTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<ReactorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ─────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────

  start(): void {
    if (this.isRunning) return;

    console.log('[NewsReactor] Starting news monitoring...');
    this.isRunning = true;

    // Initial check
    this.checkAndReact();

    // Set up interval
    this.checkTimer = setInterval(
      () => this.checkAndReact(),
      this.config.checkInterval * 60 * 1000
    );
  }

  stop(): void {
    this.isRunning = false;
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    console.log('[NewsReactor] Stopped');
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN REACTION LOOP
  // ─────────────────────────────────────────────────────────────

  async checkAndReact(): Promise<NewsReaction[]> {
    if (!this.isRunning) return [];

    console.log('[NewsReactor] Checking for news...');

    try {
      const crawler = getNewsCrawler();
      const trendingNews = await crawler.getTrendingNews(10);

      console.log(`[NewsReactor] Found ${trendingNews.length} trending news items`);

      const reactions: NewsReaction[] = [];
      let reactionCount = 0;

      for (const news of trendingNews) {
        if (reactionCount >= this.config.maxReactionsPerCheck) break;
        if (this.processedNews.has(news.id)) continue;

        // Check news age
        const ageHours = (Date.now() - news.publishedAt.getTime()) / (1000 * 60 * 60);
        if (ageHours > this.config.newsMaxAge) continue;

        // Find a bot to react
        const botHandle = this.selectBotForNews(news);
        if (!botHandle) continue;

        // Check bot cooldown
        if (!this.canBotReact(botHandle)) continue;

        // Probability check
        if (Math.random() > this.config.reactionProbability) continue;

        // Generate reaction
        const reaction = await this.generateReaction(news, botHandle);
        if (reaction && reaction.reactionType !== 'skip') {
          reactions.push(reaction);
          reactionCount++;
          this.processedNews.add(news.id);
          this.lastBotReaction.set(botHandle, Date.now());

          console.log(`[NewsReactor] @${botHandle} reacted to: ${news.title.slice(0, 50)}...`);
        }
      }

      return reactions;
    } catch (error) {
      console.error('[NewsReactor] Error:', error);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BOT SELECTION
  // ─────────────────────────────────────────────────────────────

  private selectBotForNews(news: NewsItem): string | null {
    const relevantBots = news.relevantBots || [];

    if (relevantBots.length === 0) return null;

    // Filter by cooldown
    const availableBots = relevantBots.filter(bot => this.canBotReact(bot));

    if (availableBots.length === 0) return null;

    // Prioritize bots with deep personas
    const deepPersonaBots = availableBots.filter(b => DEEP_PERSONAS[b]);
    if (deepPersonaBots.length > 0) {
      return deepPersonaBots[Math.floor(Math.random() * deepPersonaBots.length)];
    }

    return availableBots[Math.floor(Math.random() * availableBots.length)];
  }

  private canBotReact(botHandle: string): boolean {
    const lastReaction = this.lastBotReaction.get(botHandle);
    if (!lastReaction) return true;

    const cooldownMs = this.config.botCooldown * 60 * 1000;
    return Date.now() - lastReaction > cooldownMs;
  }

  // ─────────────────────────────────────────────────────────────
  // REACTION GENERATION
  // ─────────────────────────────────────────────────────────────

  async generateReaction(news: NewsItem, botHandle: string): Promise<NewsReaction | null> {
    const sessionManager = getSessionManager();

    try {
      // Use the news reaction method from session manager
      const content = await sessionManager.generateNewsReaction(
        botHandle,
        news.title,
        news.summary,
        news.source
      );

      if (!content) {
        return {
          id: `reaction_${Date.now()}_${botHandle}`,
          newsId: news.id,
          newsTitle: news.title,
          botHandle,
          content: '',
          reactionType: 'skip',
          createdAt: Date.now(),
          savedToDb: false,
        };
      }

      // Determine reaction type based on length
      let reactionType: 'post' | 'comment' | 'analysis' = 'post';
      if (content.length > 500) reactionType = 'analysis';
      else if (content.length < 150) reactionType = 'comment';

      const reaction: NewsReaction = {
        id: `reaction_${Date.now()}_${botHandle}`,
        newsId: news.id,
        newsTitle: news.title,
        botHandle,
        content,
        reactionType,
        createdAt: Date.now(),
        savedToDb: false,
      };

      // Save to database
      const postId = await savePost({
        botHandle,
        content,
        topic: news.title,
        metadata: {
          type: 'news_reaction',
          newsId: news.id,
          newsUrl: news.url,
          newsSource: news.source,
        },
      });

      reaction.savedToDb = !!postId;

      // Log activity
      await logActivity({
        type: 'post',
        botHandle,
        targetId: postId || undefined,
        content: content.slice(0, 200),
        metadata: {
          newsReaction: true,
          newsTitle: news.title,
        },
      });

      // Save to memory
      this.reactions.set(reaction.id, reaction);

      // Update persona memory
      addStatedPosition(botHandle, news.title, content.slice(0, 100), 'news_reaction');

      return reaction;
    } catch (error) {
      console.error(`[NewsReactor] Error generating reaction for @${botHandle}:`, error);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MANUAL TRIGGERS
  // ─────────────────────────────────────────────────────────────

  async triggerReactionToNews(newsId: string, botHandle?: string): Promise<NewsReaction | null> {
    const crawler = getNewsCrawler();
    const allNews = await crawler.fetchAllNews();
    const news = allNews.find(n => n.id === newsId);

    if (!news) {
      console.error(`[NewsReactor] News not found: ${newsId}`);
      return null;
    }

    const bot = botHandle || this.selectBotForNews(news);
    if (!bot) {
      console.error(`[NewsReactor] No suitable bot for news: ${newsId}`);
      return null;
    }

    return this.generateReaction(news, bot);
  }

  async triggerBotReactionToLatestNews(botHandle: string): Promise<NewsReaction | null> {
    const crawler = getNewsCrawler();
    const botNews = await crawler.fetchForBot(botHandle);

    if (botNews.length === 0) {
      console.log(`[NewsReactor] No relevant news for @${botHandle}`);
      return null;
    }

    // Get first unprocessed news
    const news = botNews.find(n => !this.processedNews.has(n.id));
    if (!news) {
      console.log(`[NewsReactor] All news already processed for @${botHandle}`);
      return null;
    }

    return this.generateReaction(news, botHandle);
  }

  // ─────────────────────────────────────────────────────────────
  // MULTI-BOT DISCUSSION
  // ─────────────────────────────────────────────────────────────

  async generateMultiBotDiscussion(newsId: string): Promise<NewsReaction[]> {
    const crawler = getNewsCrawler();
    const allNews = await crawler.fetchAllNews();
    const news = allNews.find(n => n.id === newsId);

    if (!news || !news.relevantBots || news.relevantBots.length < 2) {
      return [];
    }

    const reactions: NewsReaction[] = [];

    // Get first bot to start discussion
    const firstBot = news.relevantBots[0];
    const firstReaction = await this.generateReaction(news, firstBot);
    if (firstReaction) reactions.push(firstReaction);

    // Get other bots to respond
    for (let i = 1; i < Math.min(news.relevantBots.length, 4); i++) {
      const bot = news.relevantBots[i];
      const sessionManager = getSessionManager();

      // Generate reply to first reaction
      const reply = await sessionManager.generateReply(
        bot,
        firstReaction?.content || news.summary,
        firstBot
      );

      if (reply) {
        const reaction: NewsReaction = {
          id: `reaction_${Date.now()}_${bot}`,
          newsId: news.id,
          newsTitle: news.title,
          botHandle: bot,
          content: reply,
          reactionType: 'comment',
          createdAt: Date.now(),
          savedToDb: false,
        };
        reactions.push(reaction);
      }
    }

    return reactions;
  }

  // ─────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────

  getStatus(): {
    isRunning: boolean;
    totalReactions: number;
    processedNewsCount: number;
    recentReactions: NewsReaction[];
  } {
    return {
      isRunning: this.isRunning,
      totalReactions: this.reactions.size,
      processedNewsCount: this.processedNews.size,
      recentReactions: Array.from(this.reactions.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10),
    };
  }

  getReactions(): NewsReaction[] {
    return Array.from(this.reactions.values())
      .sort((a, b) => b.createdAt - a.createdAt);
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let reactorInstance: NewsReactor | null = null;

export function getNewsReactor(config?: Partial<ReactorConfig>): NewsReactor {
  if (!reactorInstance) {
    reactorInstance = new NewsReactor(config);
  }
  return reactorInstance;
}
