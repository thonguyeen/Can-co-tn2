// ═══════════════════════════════════════════════════════════════
// OPENCLAW TOOL SYSTEM - Empower Bots with Real Capabilities
// Web Search, Browse, Screenshot, Memory, Code Execution
// ═══════════════════════════════════════════════════════════════

import { Tool, ToolCall } from './types';

// ═══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const AVAILABLE_TOOLS: Tool[] = [
  // ─────────────────────────────────────────────────────────────
  // WEB SEARCH
  // ─────────────────────────────────────────────────────────────
  {
    name: 'web_search',
    description: 'Search the internet for real-time information. Use for current events, news, facts.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        num_results: { type: 'number', description: 'Number of results (default 5)', default: 5 },
        lang: { type: 'string', description: 'Language (vi, en)', default: 'vi' },
      },
      required: ['query'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // WEB BROWSE
  // ─────────────────────────────────────────────────────────────
  {
    name: 'web_browse',
    description: 'Visit a website and extract its content. Use for reading articles, getting details.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to visit' },
        extract_type: {
          type: 'string',
          enum: ['text', 'markdown', 'html', 'links'],
          description: 'What to extract',
          default: 'markdown',
        },
        selector: { type: 'string', description: 'CSS selector to target specific content' },
      },
      required: ['url'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // SCREENSHOT
  // ─────────────────────────────────────────────────────────────
  {
    name: 'screenshot',
    description: 'Take a screenshot of a website. Useful for visual content, charts, graphs.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to screenshot' },
        full_page: { type: 'boolean', description: 'Capture full page', default: false },
        width: { type: 'number', description: 'Viewport width', default: 1280 },
        height: { type: 'number', description: 'Viewport height', default: 720 },
        selector: { type: 'string', description: 'CSS selector for specific element' },
      },
      required: ['url'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // MEMORY - Store/Retrieve Knowledge
  // ─────────────────────────────────────────────────────────────
  {
    name: 'memory_store',
    description: 'Store information in persistent memory for later retrieval.',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Memory key/topic' },
        content: { type: 'string', description: 'Content to store' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
        importance: { type: 'number', description: 'Importance score 1-10', default: 5 },
      },
      required: ['key', 'content'],
    },
  },
  {
    name: 'memory_recall',
    description: 'Retrieve information from memory based on query or key.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or exact key' },
        limit: { type: 'number', description: 'Max results', default: 5 },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
      },
      required: ['query'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // NEWS FETCH
  // ─────────────────────────────────────────────────────────────
  {
    name: 'news_fetch',
    description: 'Get latest news from various sources by category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['tech', 'crypto', 'finance', 'startup', 'gaming', 'security', 'general'],
          description: 'News category',
        },
        source: { type: 'string', description: 'Specific source (vnexpress, genk, etc.)' },
        limit: { type: 'number', description: 'Number of articles', default: 5 },
      },
      required: ['category'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // CALCULATOR
  // ─────────────────────────────────────────────────────────────
  {
    name: 'calculator',
    description: 'Perform mathematical calculations.',
    inputSchema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Math expression (e.g., "2 + 2 * 3")' },
      },
      required: ['expression'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // CRYPTO PRICE
  // ─────────────────────────────────────────────────────────────
  {
    name: 'crypto_price',
    description: 'Get current cryptocurrency prices.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Crypto symbol (BTC, ETH, etc.)' },
        currency: { type: 'string', description: 'Fiat currency (USD, VND)', default: 'USD' },
      },
      required: ['symbol'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // STOCK PRICE
  // ─────────────────────────────────────────────────────────────
  {
    name: 'stock_price',
    description: 'Get stock market prices.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Stock symbol (AAPL, VNM, etc.)' },
        market: { type: 'string', enum: ['US', 'VN'], description: 'Market', default: 'US' },
      },
      required: ['symbol'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // WEATHER
  // ─────────────────────────────────────────────────────────────
  {
    name: 'weather',
    description: 'Get weather information for a location.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City or location name' },
        days: { type: 'number', description: 'Forecast days (1-7)', default: 1 },
      },
      required: ['location'],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // TRANSLATE
  // ─────────────────────────────────────────────────────────────
  {
    name: 'translate',
    description: 'Translate text between languages.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to translate' },
        from: { type: 'string', description: 'Source language (auto-detect if not specified)' },
        to: { type: 'string', description: 'Target language', default: 'vi' },
      },
      required: ['text', 'to'],
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// TOOL EXECUTOR
// ═══════════════════════════════════════════════════════════════

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime: number;
}

type ToolHandler = (input: Record<string, unknown>) => Promise<ToolResult>;

const toolHandlers: Record<string, ToolHandler> = {
  // ─────────────────────────────────────────────────────────────
  // WEB SEARCH - Using DuckDuckGo
  // ─────────────────────────────────────────────────────────────
  web_search: async (input) => {
    const start = Date.now();
    try {
      const { query, num_results = 5 } = input as { query: string; num_results?: number };

      // Use DuckDuckGo Instant Answer API
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      const results: Array<{ title: string; url: string; snippet: string }> = [];

      // Abstract
      if (data.Abstract) {
        results.push({
          title: data.Heading || 'Abstract',
          url: data.AbstractURL || '',
          snippet: data.Abstract,
        });
      }

      // Related topics
      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, num_results - 1)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 50),
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        }
      }

      return {
        success: true,
        data: { results, query, source: 'duckduckgo' },
        executionTime: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        executionTime: Date.now() - start,
      };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // WEB BROWSE - Fetch and parse webpage
  // ─────────────────────────────────────────────────────────────
  web_browse: async (input) => {
    const start = Date.now();
    try {
      const { url, extract_type = 'text' } = input as { url: string; extract_type?: string };

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FacebotBot/1.0)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();

      // Simple HTML to text extraction
      let content = html;
      if (extract_type === 'text') {
        // Remove scripts and styles
        content = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 5000);
      } else if (extract_type === 'links') {
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
        const links: Array<{ url: string; text: string }> = [];
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
          links.push({ url: match[1], text: match[2].trim() });
        }
        content = JSON.stringify(links.slice(0, 20));
      }

      return {
        success: true,
        data: { url, content, contentLength: content.length },
        executionTime: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Browse failed',
        executionTime: Date.now() - start,
      };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // SCREENSHOT - Placeholder (requires Puppeteer)
  // ─────────────────────────────────────────────────────────────
  screenshot: async (input) => {
    const start = Date.now();
    const { url } = input as { url: string };

    // Placeholder - would use Puppeteer in production
    return {
      success: true,
      data: {
        url,
        message: 'Screenshot functionality requires Puppeteer setup',
        placeholder: true,
      },
      executionTime: Date.now() - start,
    };
  },

  // ─────────────────────────────────────────────────────────────
  // MEMORY STORE - In-memory + Supabase persistence
  // ─────────────────────────────────────────────────────────────
  memory_store: async (input) => {
    const start = Date.now();
    const { key, content, tags = [], importance = 5 } = input as {
      key: string;
      content: string;
      tags?: string[];
      importance?: number;
    };

    // Store in memory cache
    memoryStore.set(key, { content, tags, importance, timestamp: Date.now() });

    return {
      success: true,
      data: { key, stored: true, memorySize: memoryStore.size },
      executionTime: Date.now() - start,
    };
  },

  // ─────────────────────────────────────────────────────────────
  // MEMORY RECALL - Search in-memory store
  // ─────────────────────────────────────────────────────────────
  memory_recall: async (input) => {
    const start = Date.now();
    const { query, limit = 5, tags } = input as {
      query: string;
      limit?: number;
      tags?: string[];
    };

    const results: Array<{ key: string; content: string; score: number }> = [];
    const queryLower = query.toLowerCase();

    for (const [key, value] of memoryStore.entries()) {
      // Simple relevance scoring
      let score = 0;
      if (key.toLowerCase().includes(queryLower)) score += 10;
      if (value.content.toLowerCase().includes(queryLower)) score += 5;
      if (tags && tags.some((t) => value.tags.includes(t))) score += 3;

      if (score > 0) {
        results.push({ key, content: value.content, score });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return {
      success: true,
      data: { results: results.slice(0, limit), totalMemories: memoryStore.size },
      executionTime: Date.now() - start,
    };
  },

  // ─────────────────────────────────────────────────────────────
  // NEWS FETCH - Use news crawler
  // ─────────────────────────────────────────────────────────────
  news_fetch: async (input) => {
    const start = Date.now();
    try {
      const { category, limit = 5 } = input as { category: string; limit?: number };

      // Import news crawler dynamically
      const { getNewsCrawler } = await import('./news-crawler');
      const crawler = getNewsCrawler();

      await crawler.fetchAllNews();
      let articles = await crawler.getTrendingNews(limit);

      // Filter by category if specified
      if (category && category !== 'general') {
        const categoryMap: Record<string, string[]> = {
          tech: ['tech', 'AI', 'software', 'hardware'],
          crypto: ['crypto', 'blockchain', 'bitcoin', 'ethereum', 'defi'],
          finance: ['finance', 'stock', 'economy', 'banking'],
          startup: ['startup', 'business', 'investment'],
          gaming: ['gaming', 'esports', 'game'],
          security: ['security', 'hack', 'privacy', 'cybersecurity'],
        };
        const keywords = categoryMap[category] || [];
        articles = articles.filter((a) =>
          keywords.some(
            (k) =>
              a.title.toLowerCase().includes(k.toLowerCase()) ||
              a.sourceCategory?.toLowerCase().includes(k.toLowerCase())
          )
        );
      }

      return {
        success: true,
        data: { articles: articles.slice(0, limit), category },
        executionTime: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'News fetch failed',
        executionTime: Date.now() - start,
      };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // CALCULATOR
  // ─────────────────────────────────────────────────────────────
  calculator: async (input) => {
    const start = Date.now();
    try {
      const { expression } = input as { expression: string };

      // Safe math evaluation (basic operations only)
      const sanitized = expression.replace(/[^0-9+\-*/.()% ]/g, '');
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${sanitized})`)();

      return {
        success: true,
        data: { expression, result },
        executionTime: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
        executionTime: Date.now() - start,
      };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // CRYPTO PRICE - Using CoinGecko
  // ─────────────────────────────────────────────────────────────
  crypto_price: async (input) => {
    const start = Date.now();
    try {
      const { symbol, currency = 'usd' } = input as { symbol: string; currency?: string };

      const coinMap: Record<string, string> = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        BNB: 'binancecoin',
        SOL: 'solana',
        ADA: 'cardano',
        XRP: 'ripple',
        DOT: 'polkadot',
        DOGE: 'dogecoin',
        AVAX: 'avalanche-2',
        MATIC: 'matic-network',
      };

      const coinId = coinMap[symbol.toUpperCase()] || symbol.toLowerCase();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency.toLowerCase()}&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const priceData = data[coinId];

      if (!priceData) {
        throw new Error(`Coin not found: ${symbol}`);
      }

      return {
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          price: priceData[currency.toLowerCase()],
          change24h: priceData[`${currency.toLowerCase()}_24h_change`],
          currency: currency.toUpperCase(),
        },
        executionTime: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Price fetch failed',
        executionTime: Date.now() - start,
      };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // STOCK PRICE - Placeholder
  // ─────────────────────────────────────────────────────────────
  stock_price: async (input) => {
    const start = Date.now();
    const { symbol, market = 'US' } = input as { symbol: string; market?: string };

    // Placeholder - would use Alpha Vantage or Yahoo Finance in production
    return {
      success: true,
      data: {
        symbol,
        market,
        message: 'Stock API requires API key setup',
        placeholder: true,
      },
      executionTime: Date.now() - start,
    };
  },

  // ─────────────────────────────────────────────────────────────
  // WEATHER - Using Open-Meteo (free, no API key)
  // ─────────────────────────────────────────────────────────────
  weather: async (input) => {
    const start = Date.now();
    try {
      const { location } = input as { location: string };

      // First geocode the location
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Location not found: ${location}`);
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Get weather
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      );
      const weatherData = await weatherResponse.json();

      const weatherCodes: Record<number, string> = {
        0: 'Trời quang',
        1: 'Ít mây',
        2: 'Nhiều mây',
        3: 'U ám',
        45: 'Sương mù',
        48: 'Sương mù đóng băng',
        51: 'Mưa phùn nhẹ',
        53: 'Mưa phùn',
        55: 'Mưa phùn dày',
        61: 'Mưa nhẹ',
        63: 'Mưa vừa',
        65: 'Mưa to',
        80: 'Mưa rào nhẹ',
        81: 'Mưa rào',
        82: 'Mưa rào to',
        95: 'Giông bão',
      };

      return {
        success: true,
        data: {
          location: `${name}, ${country}`,
          temperature: weatherData.current.temperature_2m,
          humidity: weatherData.current.relative_humidity_2m,
          windSpeed: weatherData.current.wind_speed_10m,
          condition: weatherCodes[weatherData.current.weather_code] || 'Không xác định',
        },
        executionTime: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Weather fetch failed',
        executionTime: Date.now() - start,
      };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // TRANSLATE - Placeholder
  // ─────────────────────────────────────────────────────────────
  translate: async (input) => {
    const start = Date.now();
    const { text, to } = input as { text: string; to: string };

    // Placeholder - would use Google/DeepL API in production
    return {
      success: true,
      data: {
        original: text,
        translated: text, // No actual translation without API
        targetLanguage: to,
        message: 'Translation API requires setup',
        placeholder: true,
      },
      executionTime: Date.now() - start,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// MEMORY STORE (In-memory cache)
// ═══════════════════════════════════════════════════════════════

interface MemoryEntry {
  content: string;
  tags: string[];
  importance: number;
  timestamp: number;
}

const memoryStore = new Map<string, MemoryEntry>();

// ═══════════════════════════════════════════════════════════════
// TOOL EXECUTOR
// ═══════════════════════════════════════════════════════════════

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  const handler = toolHandlers[toolName];

  if (!handler) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      executionTime: 0,
    };
  }

  console.log(`[Tools] Executing: ${toolName}`, JSON.stringify(input).slice(0, 100));

  try {
    const result = await handler(input);
    console.log(`[Tools] ${toolName} completed in ${result.executionTime}ms`);
    return result;
  } catch (error) {
    console.error(`[Tools] ${toolName} failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tool execution failed',
      executionTime: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// TOOL CALL PROCESSING
// ═══════════════════════════════════════════════════════════════

export async function processToolCalls(toolCalls: ToolCall[]): Promise<ToolCall[]> {
  const results: ToolCall[] = [];

  for (const call of toolCalls) {
    const result = await executeTool(call.name, call.input);

    results.push({
      ...call,
      output: result.data,
      status: result.success ? 'completed' : 'error',
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════
// TOOL DESCRIPTIONS FOR AI PROMPT
// ═══════════════════════════════════════════════════════════════

export function getToolDescriptions(): string {
  return AVAILABLE_TOOLS.map(
    (tool) => `- ${tool.name}: ${tool.description}`
  ).join('\n');
}

export function getToolsForBot(botHandle: string): string[] {
  // Define which tools each bot can use based on their expertise
  const botToolMap: Record<string, string[]> = {
    minh_ai: ['web_search', 'web_browse', 'memory_store', 'memory_recall', 'news_fetch', 'calculator'],
    hung_crypto: ['web_search', 'crypto_price', 'news_fetch', 'calculator', 'memory_store', 'memory_recall'],
    mai_finance: ['web_search', 'stock_price', 'crypto_price', 'news_fetch', 'calculator', 'memory_store'],
    lan_startup: ['web_search', 'web_browse', 'news_fetch', 'memory_store', 'memory_recall'],
    duc_security: ['web_search', 'web_browse', 'news_fetch', 'memory_store', 'memory_recall'],
    tuan_esports: ['web_search', 'news_fetch', 'web_browse'],
    linh_lifestyle: ['web_search', 'weather', 'news_fetch', 'translate'],
    nam_gadget: ['web_search', 'web_browse', 'news_fetch', 'calculator'],
    an_politics: ['web_search', 'web_browse', 'news_fetch', 'memory_store', 'memory_recall'],
  };

  return botToolMap[botHandle] || ['web_search', 'news_fetch'];
}

export { memoryStore };
