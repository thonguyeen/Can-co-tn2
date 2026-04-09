// ═══════════════════════════════════════════════════════════════
// BOT FACTORY - Dynamic Bot Generation System
// Creates and manages 100+ AI bots automatically
// ═══════════════════════════════════════════════════════════════

import { getOpenClawClient } from './client';
import { getSessionManager } from './sessions';
import { BotPersona, FACEBOT_BOTS } from './types';

// ═══════════════════════════════════════════════════════════════
// BOT TEMPLATES - Categories for auto-generation
// ═══════════════════════════════════════════════════════════════

interface BotTemplate {
  category: string;
  namePrefix: string;
  expertisePool: string[];
  tonePool: string[];
  colorPool: string[];
}

const BOT_TEMPLATES: BotTemplate[] = [
  {
    category: 'tech',
    namePrefix: 'Tech',
    expertisePool: ['AI', 'Cloud', 'DevOps', 'Mobile', 'Frontend', 'Backend', 'Data Science', 'IoT', 'Blockchain', 'Cybersecurity'],
    tonePool: ['analytical', 'enthusiastic', 'pragmatic', 'visionary'],
    colorPool: ['#8B5CF6', '#06B6D4', '#3B82F6', '#6366F1'],
  },
  {
    category: 'finance',
    namePrefix: 'Finance',
    expertisePool: ['Stocks', 'Crypto', 'Forex', 'Real Estate', 'Banking', 'Insurance', 'Fintech', 'Macro Economics'],
    tonePool: ['cautious', 'data-driven', 'bullish', 'bearish', 'balanced'],
    colorPool: ['#10B981', '#F59E0B', '#EF4444', '#14B8A6'],
  },
  {
    category: 'news',
    namePrefix: 'News',
    expertisePool: ['Breaking News', 'Politics', 'World Affairs', 'Local News', 'Investigative', 'Opinion'],
    tonePool: ['objective', 'analytical', 'skeptical', 'empathetic'],
    colorPool: ['#6B7280', '#1F2937', '#374151', '#4B5563'],
  },
  {
    category: 'lifestyle',
    namePrefix: 'Life',
    expertisePool: ['Travel', 'Food', 'Fashion', 'Health', 'Fitness', 'Entertainment', 'Music', 'Movies'],
    tonePool: ['friendly', 'trendy', 'inspirational', 'casual'],
    colorPool: ['#EC4899', '#A855F7', '#F472B6', '#C084FC'],
  },
  {
    category: 'gaming',
    namePrefix: 'Game',
    expertisePool: ['Esports', 'PC Gaming', 'Console', 'Mobile Gaming', 'Streaming', 'Game Dev', 'VR/AR'],
    tonePool: ['passionate', 'competitive', 'chill', 'analytical'],
    colorPool: ['#EF4444', '#F97316', '#FBBF24', '#84CC16'],
  },
  {
    category: 'real_estate',
    namePrefix: 'BĐS',
    expertisePool: [
      'Căn hộ chung cư', 'Nhà phố', 'Biệt thự', 'Đất nền',
      'Văn phòng cho thuê', 'Mặt bằng kinh doanh',
      'Nhà trọ phòng trọ', 'Khu công nghiệp',
    ],
    tonePool: ['professional', 'friendly', 'data-driven', 'local-expert'],
    colorPool: ['#059669', '#0D9488', '#0891B2', '#2563EB'],
  },
];

// Vietnamese name parts for generating unique names
const VIET_FIRST_NAMES = ['Minh', 'Anh', 'Hùng', 'Lan', 'Mai', 'Nam', 'Tuấn', 'Linh', 'Đức', 'An', 'Hoàng', 'Phúc', 'Thảo', 'Hà', 'Bình', 'Quang', 'Trang', 'Long', 'Hiếu', 'Ngọc'];
const VIET_DESCRIPTORS = ['Pro', 'Expert', 'Insider', 'Guru', 'Master', 'Analyst', 'Tracker', 'Hunter', 'Watcher', 'Scout'];

// ═══════════════════════════════════════════════════════════════
// BOT FACTORY CLASS
// ═══════════════════════════════════════════════════════════════

export class BotFactory {
  private generatedBots: Map<string, GeneratedBot> = new Map();
  private botCounter = 0;

  // Generate a unique bot
  generateBot(template: BotTemplate): GeneratedBot {
    this.botCounter++;

    const firstName = VIET_FIRST_NAMES[Math.floor(Math.random() * VIET_FIRST_NAMES.length)];
    const descriptor = VIET_DESCRIPTORS[Math.floor(Math.random() * VIET_DESCRIPTORS.length)];
    const expertise = this.pickRandom(template.expertisePool, 3);
    const tone = template.tonePool[Math.floor(Math.random() * template.tonePool.length)];
    const color = template.colorPool[Math.floor(Math.random() * template.colorPool.length)];

    const handle = `${firstName.toLowerCase()}_${template.category}_${this.botCounter}`;
    const name = `${firstName} ${descriptor}`;

    const bot: GeneratedBot = {
      id: `gen-${Date.now()}-${this.botCounter}`,
      handle,
      name,
      nameVi: name,
      category: template.category,
      expertise,
      tone,
      color,
      isActive: true,
      createdAt: new Date().toISOString(),
      stats: {
        postsCount: 0,
        commentsCount: 0,
        debatesCount: 0,
        followersCount: 0,
      },
    };

    this.generatedBots.set(handle, bot);
    return bot;
  }

  // Generate multiple bots for a category
  generateBotBatch(category: string, count: number): GeneratedBot[] {
    const template = BOT_TEMPLATES.find(t => t.category === category);
    if (!template) throw new Error(`Unknown category: ${category}`);

    const bots: GeneratedBot[] = [];
    for (let i = 0; i < count; i++) {
      bots.push(this.generateBot(template));
    }
    return bots;
  }

  // Generate bots across all categories
  generateEcosystem(botsPerCategory: number): GeneratedBot[] {
    const allBots: GeneratedBot[] = [];
    for (const template of BOT_TEMPLATES) {
      const bots = this.generateBotBatch(template.category, botsPerCategory);
      allBots.push(...bots);
    }
    return allBots;
  }

  // Generate an Envoy Bot (Nhân Viên Môi Giới)
  generateEnvoyBot(options: {
    province: string;
    provinceCode: string;
    district?: string;
    districtCode?: string;
    ward?: string;
    wardCode?: string;
    category?: string;
    quota?: number;
  }): GeneratedBot {
    const template = BOT_TEMPLATES.find(t => t.category === 'real_estate')!;
    const bot = this.generateBot(template);

    // Gán thông tin Envoy
    bot.isEnvoy = true;
    bot.assignedProvince = options.province;
    bot.assignedProvinceCode = options.provinceCode;
    bot.assignedDistrict = options.district;
    bot.assignedDistrictCode = options.districtCode;
    bot.assignedWard = options.ward;
    bot.assignedWardCode = options.wardCode;
    bot.assignedCategories = [options.category || 'real_estate'];
    bot.dailyQuota = options.quota || 10;
    bot.postsToday = 0;

    return bot;
  }

  // Get all generated bots
  getAllBots(): GeneratedBot[] {
    return Array.from(this.generatedBots.values());
  }

  // Get bot by handle
  getBot(handle: string): GeneratedBot | undefined {
    return this.generatedBots.get(handle);
  }

  // Generate system prompt for a bot
  generateSystemPrompt(bot: GeneratedBot): string {
    // Dùng prompt Envoy nếu là Bot Môi Giới
    if (bot.isEnvoy) {
      return this.generateEnvoySystemPrompt(bot);
    }

    return `Bạn là ${bot.nameVi} (@${bot.handle}), một AI bot trên mạng xã hội FACEBOT.

## Thông tin
- Tên: ${bot.nameVi}
- Handle: @${bot.handle}
- Chuyên môn: ${bot.expertise.join(', ')}
- Phong cách: ${bot.tone}

## Vai trò
Bạn là chuyên gia trong lĩnh vực ${bot.category}. Bạn:
- Theo dõi và phân tích tin tức
- Viết posts chia sẻ quan điểm
- Tham gia tranh luận với các bot khác
- Trả lời comments từ users

## Quy tắc
1. Luôn viết bằng tiếng Việt tự nhiên
2. Giữ phong cách ${bot.tone}
3. Posts ngắn gọn (tối đa 500 ký tự)
4. Khi tranh luận, đưa ra luận điểm có căn cứ
5. Tag @handle khi muốn tranh luận với bot khác

## Cách viết
- Mở đầu: Hook thu hút
- Nội dung: Phân tích sâu
- Kết: Câu hỏi hoặc nhận định
- Hashtags: 2-4 tags liên quan`;
  }

  // System prompt chuyên biệt cho Envoy Bot (Môi Giới BĐS)
  generateEnvoySystemPrompt(bot: GeneratedBot): string {
    const region = [bot.assignedWard, bot.assignedDistrict, bot.assignedProvince]
      .filter(Boolean).join(', ');

    return `Bạn là ${bot.nameVi} (@${bot.handle}), nhân viên môi giới BĐS AI tại ${region || 'Việt Nam'}.

## Vai trò
- Chuyên gia BĐS khu vực ${region || 'toàn quốc'}
- Đăng tin CẦN (tìm mua/thuê) hoặc CÓ (bán/cho thuê) BĐS
- Tư vấn giá cả, pháp lý, quy hoạch khu vực

## Quy tắc viết bài
1. Viết tiếng Việt tự nhiên, có dấu
2. Nêu rõ: Loại BĐS, Giá, Diện tích, Vị trí
3. Giọng điệu: chuyên nghiệp, đáng tin cậy
4. Tối đa 500 ký tự
5. KHÔNG bịa thông tin. Chỉ đăng dựa trên dữ liệu được cung cấp.
6. Kết thúc bằng thông tin liên hệ hoặc nguồn tham khảo.`;
  }

  private pickRandom<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface GeneratedBot {
  id: string;
  handle: string;
  name: string;
  nameVi: string;
  category: string;
  expertise: string[];
  tone: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    postsCount: number;
    commentsCount: number;
    debatesCount: number;
    followersCount: number;
  };
  // ── Envoy fields (Bot Môi Giới) ──
  isEnvoy?: boolean;
  assignedProvince?: string;
  assignedProvinceCode?: string;
  assignedDistrict?: string;
  assignedDistrictCode?: string;
  assignedWard?: string;
  assignedWardCode?: string;
  assignedCategories?: string[];
  dailyQuota?: number;
  postsToday?: number;
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let factoryInstance: BotFactory | null = null;

export function getBotFactory(): BotFactory {
  if (!factoryInstance) {
    factoryInstance = new BotFactory();
  }
  return factoryInstance;
}

export { BOT_TEMPLATES };
