import OpenAI from 'openai'

// ═══════════════════════════════════════════════════════
// AI FALLBACK SYSTEM
// Primary: 9Router (nhanh ~2s, nhưng hay bị WAF chặn 403)
// Fallback: SimpleVerse (ổn định 100%)
// ═══════════════════════════════════════════════════════

interface AIProvider {
  name: string
  apiKey: string
  baseURL: string
  model: string
}

function getProviders(): AIProvider[] {
  const providers: AIProvider[] = []

  // 🥇 Primary: 9Router
  if (process.env.AI_PRIMARY_API_KEY) {
    providers.push({
      name: '9Router',
      apiKey: process.env.AI_PRIMARY_API_KEY,
      baseURL: process.env.AI_PRIMARY_BASE_URL || '',
      model: process.env.AI_PRIMARY_MODEL || 'cb1',
    })
  }

  // 🥈 Fallback: SimpleVerse
  if (process.env.AI_FALLBACK_API_KEY) {
    providers.push({
      name: 'SimpleVerse',
      apiKey: process.env.AI_FALLBACK_API_KEY,
      baseURL: process.env.AI_FALLBACK_BASE_URL || '',
      model: process.env.AI_FALLBACK_MODEL || 'auto',
    })
  }

  // 🥉 Legacy: OPENAI_* vars (giữ tương thích ngược)
  if (providers.length === 0 && process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'Legacy',
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    })
  }

  if (providers.length === 0) {
    throw new Error('Không tìm thấy API Key AI nào trong .env.local!')
  }

  return providers
}

function createClient(provider: AIProvider): OpenAI {
  return new OpenAI({
    apiKey: provider.apiKey,
    ...(provider.baseURL ? { baseURL: provider.baseURL } : {}),
  })
}

// ── LEGACY: Giữ lại cho các module cũ (crawler, openclaw...) ──
export function getOpenAIClient(): OpenAI {
  const providers = getProviders()
  // Legacy caller gets the first available provider
  return createClient(providers[0])
}

export async function chat(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const providers = getProviders()

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]
    const isLast = i === providers.length - 1

    try {
      console.log(`[AI] 🔄 Đang gọi ${provider.name}...`)

      const client = createClient(provider)
      const response = await client.chat.completions.create({
        model: provider.model,
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature || 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      })

      const result = response.choices[0]?.message?.content || ''
      console.log(`[AI] ✅ ${provider.name} trả lời OK (${result.length} ký tự)`)
      return result

    } catch (error: any) {
      console.error(`[AI] ❌ ${provider.name} lỗi: ${error.message}`)

      if (isLast) {
        // Hết trạm rồi, ném lỗi ra ngoài
        throw error
      }

      // Còn trạm dự phòng → nhảy sang
      console.log(`[AI] ↪️ Chuyển sang ${providers[i + 1].name}...`)
    }
  }

  throw new Error('Tất cả AI providers đều thất bại')
}

export async function chatWithJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
    maxRetries?: number
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;
  let promptSuffix = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await chat(systemPrompt, userMessage + promptSuffix, options);

      // Extract JSON from response
      const jsonMatch =
        response.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON structure found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr) as T;
    } catch (error: any) {
      lastError = error;
      console.warn(`[AI] JSON Parse fail, attempt ${attempt + 1}/${maxRetries + 1}... Retrying...`);
      promptSuffix = `\n\n[HỆ THỐNG]: Output trước đó của bạn không phải là JSON hợp lệ. Lỗi: ${error.message}. Bạn BẮT BUỘC phải xuất ra định dạng JSON chuẩn. KHÔNG bọc trong block code markdown nếu không cần thiết. CHỈ trả về một block JSON duy nhất.`;
    }
  }

  throw new Error(`Failed to return valid JSON after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`);
}
