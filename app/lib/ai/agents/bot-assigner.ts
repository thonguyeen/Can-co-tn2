import { BOT_PERSONAS } from '../prompts/bot-personas'

interface RawNewsWithSource {
  id: string
  original_title: string
  original_content: string | null
  sources: {
    category: string[]
  }
}

interface AssignmentResult {
  botId: string
  botHandle: string
  confidence: number
  reason: string
  alternativeBots: string[]
}

// Category to bot mapping (expanded for 9 bots)
const CATEGORY_BOT_MAP: Record<string, string[]> = {
  // Minh AI
  ai: ['minh_ai'],
  ml: ['minh_ai'],
  llm: ['minh_ai'],
  research: ['minh_ai'],
  robotics: ['minh_ai'],

  // Lan Startup
  startup: ['lan_startup'],
  funding: ['lan_startup'],
  business: ['lan_startup'],
  saas: ['lan_startup'],
  vc: ['lan_startup'],

  // Nam Gadget
  gadget: ['nam_gadget'],
  hardware: ['nam_gadget'],
  reviews: ['nam_gadget'],
  mobile: ['nam_gadget'],
  android: ['nam_gadget'],
  apple: ['nam_gadget'],
  laptop: ['nam_gadget'],

  // Hùng Crypto
  crypto: ['hung_crypto'],
  bitcoin: ['hung_crypto'],
  ethereum: ['hung_crypto'],
  defi: ['hung_crypto'],
  nft: ['hung_crypto'],
  web3: ['hung_crypto'],
  blockchain: ['hung_crypto'],

  // Mai Finance
  finance: ['mai_finance'],
  stock: ['mai_finance'],
  market: ['mai_finance'],
  investment: ['mai_finance'],
  macro: ['mai_finance'],

  // Tuấn Esports
  gaming: ['tuan_esports', 'nam_gadget'],
  esports: ['tuan_esports'],
  game: ['tuan_esports'],

  // Linh Lifestyle
  viral: ['linh_lifestyle'],
  trending: ['linh_lifestyle'],
  meme: ['linh_lifestyle'],
  influencer: ['linh_lifestyle'],
  tiktok: ['linh_lifestyle'],

  // Đức Security
  security: ['duc_security'],
  hack: ['duc_security'],
  breach: ['duc_security'],
  privacy: ['duc_security'],
  malware: ['duc_security'],

  // An Politics
  politics: ['an_politics'],
  policy: ['an_politics'],
  government: ['an_politics'],
  law: ['an_politics'],
  society: ['an_politics'],
}

// Keyword patterns for matching (RegExp)
const KEYWORD_PATTERNS: Record<string, RegExp[]> = {
  minh_ai: [
    /\b(gpt|llm|chatgpt|claude|gemini|openai|anthropic|deepmind)\b/i,
    /\b(machine learning|deep learning|neural|transformer|ai model)\b/i,
    /\b(artificial intelligence|trí tuệ nhân tạo)\b/i,
  ],
  lan_startup: [
    /\b(series [a-d]|seed round|funding|ipo|valuation)\b/i,
    /\b(startup|khởi nghiệp|gọi vốn|đầu tư|investor)\b/i,
    /\b(unicorn|acquisition|merger|revenue|mrr|arr)\b/i,
  ],
  nam_gadget: [
    /\b(iphone|samsung|pixel|macbook|laptop|smartphone)\b/i,
    /\b(review|đánh giá|specs|camera|battery|chip)\b/i,
    /\b(processor|gpu|rtx|amd|intel|qualcomm)\b/i,
  ],
  hung_crypto: [
    /\b(btc|eth|bitcoin|ethereum|crypto|token|coin)\b/i,
    /\b(defi|nft|web3|blockchain|wallet|staking)\b/i,
    /\b(binance|coinbase|exchange|trading|hodl)\b/i,
  ],
  mai_finance: [
    /\b(fed|interest rate|inflation|gdp|cpi)\b/i,
    /\b(stock|share|equity|bond|treasury)\b/i,
    /\b(vn-?index|hnx|chứng khoán|cổ phiếu)\b/i,
  ],
  tuan_esports: [
    /\b(esports|league of legends|valorant|dota|csgo)\b/i,
    /\b(tournament|championship|worlds|msi)\b/i,
    /\b(team|roster|player|pro gamer|streamer)\b/i,
  ],
  linh_lifestyle: [
    /\b(viral|trending|meme|influencer|creator)\b/i,
    /\b(tiktok|instagram|youtube shorts|reels)\b/i,
    /\b(drama|scandal|cancel|beef)\b/i,
  ],
  duc_security: [
    /\b(hack|breach|vulnerability|exploit|zero-?day)\b/i,
    /\b(malware|ransomware|phishing|scam)\b/i,
    /\b(cybersecurity|data leak|password|2fa)\b/i,
  ],
  an_politics: [
    /\b(chính phủ|quốc hội|bộ trưởng|thủ tướng)\b/i,
    /\b(policy|legislation|regulation|law|luật)\b/i,
    /\b(election|vote|democracy|politics|chính trị)\b/i,
  ],
}

export function assignBotToNews(news: RawNewsWithSource): AssignmentResult {
  const scores: Record<string, number> = {}
  const allBots = Object.values(BOT_PERSONAS).filter(b => b.isActive)

  // Initialize scores
  allBots.forEach(bot => {
    scores[bot.handle] = 0
  })

  const text = `${news.original_title} ${news.original_content || ''}`.toLowerCase()
  const categories = news.sources?.category || []

  // 1. Score by source categories
  for (const category of categories) {
    const botHandles = CATEGORY_BOT_MAP[category.toLowerCase()]
    if (botHandles) {
      botHandles.forEach((handle, idx) => {
        scores[handle] = (scores[handle] || 0) + (10 - idx * 2)
      })
    }
  }

  // 2. Score by keyword patterns (RegExp)
  for (const [handle, patterns] of Object.entries(KEYWORD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        scores[handle] = (scores[handle] || 0) + 8
      }
    }
  }

  // 3. Score by expertise keywords
  allBots.forEach(bot => {
    for (const expertise of bot.expertise) {
      if (text.includes(expertise.toLowerCase())) {
        scores[bot.handle] = (scores[bot.handle] || 0) + 5
      }
    }
  })

  // 4. Find winner and alternatives
  const sortedBots = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)

  const [winnerHandle, winnerScore] = sortedBots[0]
  const winner = BOT_PERSONAS[winnerHandle]

  // Get alternative bots (score > 50% of winner)
  const alternativeBots = sortedBots
    .slice(1, 4)
    .filter(([, score]) => score > winnerScore * 0.5)
    .map(([handle]) => handle)

  // Calculate confidence
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = totalScore > 0
    ? Math.min(100, Math.round((winnerScore / totalScore) * 100 * 1.5))
    : 50

  return {
    botId: winner.id,
    botHandle: winnerHandle,
    confidence,
    reason: generateAssignmentReason(winnerHandle, scores, categories),
    alternativeBots,
  }
}

function generateAssignmentReason(
  winner: string,
  scores: Record<string, number>,
  categories: string[]
): string {
  const botName = BOT_PERSONAS[winner].name
  const score = scores[winner]

  if (categories.length > 0) {
    return `Gán cho ${botName} (score: ${score}) dựa trên categories: ${categories.join(', ')}`
  }

  return `Gán cho ${botName} (score: ${score}) dựa trên phân tích nội dung`
}
