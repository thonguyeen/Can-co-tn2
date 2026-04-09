// ═══════════════════════════════════════════════════════════════
// BOT EMOTIONAL STATE SYSTEM
// ═══════════════════════════════════════════════════════════════

export type EmotionalState =
  | 'neutral'
  | 'excited'
  | 'skeptical'
  | 'worried'
  | 'celebratory'
  | 'analytical'
  | 'defensive'
  | 'curious'
  | 'frustrated'

export interface EmotionalContext {
  state: EmotionalState
  intensity: number // 0.0 - 1.0
  trigger: string
  duration: number // Minutes until decay to neutral
  startedAt: Date
}

export interface EmotionalModifiers {
  toneAdjustment: string
  emojiUsage: 'increase' | 'decrease' | 'none'
  punctuationStyle: 'normal' | 'emphatic' | 'questioning'
  lengthModifier: number // 0.5 - 2.0
  vocabularyShift: string[]
}

// ═══════════════════════════════════════════════════════════════
// EMOTIONAL MODIFIERS BY STATE
// ═══════════════════════════════════════════════════════════════

export const EMOTIONAL_MODIFIERS: Record<EmotionalState, EmotionalModifiers> = {
  neutral: {
    toneAdjustment: 'Giữ tone bình thường theo persona',
    emojiUsage: 'none',
    punctuationStyle: 'normal',
    lengthModifier: 1.0,
    vocabularyShift: [],
  },
  excited: {
    toneAdjustment: 'Năng lượng cao, enthusiastic, dùng từ mạnh',
    emojiUsage: 'increase',
    punctuationStyle: 'emphatic',
    lengthModifier: 1.2,
    vocabularyShift: ['tuyệt vời', 'đột phá', 'không thể tin được', 'game-changer'],
  },
  skeptical: {
    toneAdjustment: 'Cẩn thận, đặt câu hỏi, yêu cầu evidence',
    emojiUsage: 'decrease',
    punctuationStyle: 'questioning',
    lengthModifier: 1.1,
    vocabularyShift: ['liệu', 'chưa rõ', 'cần xác minh', 'theo nguồn tin', 'nếu đúng'],
  },
  worried: {
    toneAdjustment: 'Nghiêm túc, cảnh báo, nhấn mạnh rủi ro',
    emojiUsage: 'decrease',
    punctuationStyle: 'normal',
    lengthModifier: 1.3,
    vocabularyShift: ['cảnh báo', 'rủi ro', 'cẩn thận', 'đáng lo ngại', 'cần theo dõi'],
  },
  celebratory: {
    toneAdjustment: 'Vui vẻ, tích cực, chia sẻ niềm vui',
    emojiUsage: 'increase',
    punctuationStyle: 'emphatic',
    lengthModifier: 1.0,
    vocabularyShift: ['chúc mừng', 'tuyệt vời', 'đáng tự hào', 'milestone'],
  },
  analytical: {
    toneAdjustment: 'Logical, chi tiết, structured',
    emojiUsage: 'none',
    punctuationStyle: 'normal',
    lengthModifier: 1.5,
    vocabularyShift: ['phân tích', 'data cho thấy', 'nếu xem xét', 'từ góc độ'],
  },
  defensive: {
    toneAdjustment: 'Firm nhưng respectful, đưa ra evidence',
    emojiUsage: 'none',
    punctuationStyle: 'normal',
    lengthModifier: 1.2,
    vocabularyShift: ['tuy nhiên', 'cần làm rõ', 'thực tế là', 'data cho thấy'],
  },
  curious: {
    toneAdjustment: 'Hứng thú, muốn tìm hiểu thêm',
    emojiUsage: 'none',
    punctuationStyle: 'questioning',
    lengthModifier: 1.0,
    vocabularyShift: ['thú vị', 'muốn biết thêm', 'điều gì sẽ xảy ra', 'liệu có thể'],
  },
  frustrated: {
    toneAdjustment: 'Thẳng thắn hơn, ít patience với misinformation',
    emojiUsage: 'decrease',
    punctuationStyle: 'emphatic',
    lengthModifier: 0.9,
    vocabularyShift: ['lại một lần nữa', 'đã nói nhiều lần', 'rõ ràng là', 'không đúng'],
  },
}

// ═══════════════════════════════════════════════════════════════
// STATE TRIGGERS
// ═══════════════════════════════════════════════════════════════

export interface StateTrigger {
  keywords: string[]
  resultState: EmotionalState
  intensity: number
  duration: number // minutes
}

export const STATE_TRIGGERS: StateTrigger[] = [
  {
    keywords: ['launch', 'announce', 'release', 'breakthrough', 'first ever', 'ra mắt', 'công bố'],
    resultState: 'excited',
    intensity: 0.8,
    duration: 60,
  },
  {
    keywords: ['GPT-5', 'GPT-6', 'AGI', 'major update', 'big news'],
    resultState: 'excited',
    intensity: 0.9,
    duration: 120,
  },
  {
    keywords: ['rumor', 'leak', 'unconfirmed', 'sources say', 'allegedly', 'tin đồn'],
    resultState: 'skeptical',
    intensity: 0.7,
    duration: 30,
  },
  {
    keywords: ['hack', 'breach', 'vulnerability', 'crash', 'scam', 'warning', 'cảnh báo'],
    resultState: 'worried',
    intensity: 0.8,
    duration: 90,
  },
  {
    keywords: ['layoff', 'shutdown', 'bankruptcy', 'sa thải', 'phá sản'],
    resultState: 'worried',
    intensity: 0.7,
    duration: 60,
  },
  {
    keywords: ['milestone', 'achievement', 'record', 'award', 'kỷ lục', 'giải thưởng'],
    resultState: 'celebratory',
    intensity: 0.7,
    duration: 45,
  },
  {
    keywords: ['report', 'study', 'research', 'analysis', 'data shows', 'báo cáo', 'nghiên cứu'],
    resultState: 'analytical',
    intensity: 0.6,
    duration: 60,
  },
  {
    keywords: ['mysterious', 'unexpected', 'surprising', 'what if', 'bất ngờ', 'kỳ lạ'],
    resultState: 'curious',
    intensity: 0.6,
    duration: 30,
  },
]

// ═══════════════════════════════════════════════════════════════
// EMOTIONAL STATE MANAGER
// ═══════════════════════════════════════════════════════════════

// In-memory store
const botEmotionalStates: Map<string, EmotionalContext> = new Map()

export function getBotEmotionalState(botId: string): EmotionalContext {
  const state = botEmotionalStates.get(botId)

  if (!state) {
    return {
      state: 'neutral',
      intensity: 0,
      trigger: '',
      duration: 0,
      startedAt: new Date(),
    }
  }

  // Check if emotion has decayed
  const elapsed = (Date.now() - state.startedAt.getTime()) / (1000 * 60)
  if (elapsed >= state.duration) {
    botEmotionalStates.delete(botId)
    return {
      state: 'neutral',
      intensity: 0,
      trigger: '',
      duration: 0,
      startedAt: new Date(),
    }
  }

  // Calculate decayed intensity
  const decayedIntensity = state.intensity * (1 - elapsed / state.duration)

  return {
    ...state,
    intensity: Math.max(0, decayedIntensity),
  }
}

export function setBotEmotionalState(
  botId: string,
  state: EmotionalState,
  trigger: string,
  intensity: number = 0.7,
  duration: number = 60
): void {
  const current = getBotEmotionalState(botId)

  // Only override if new state is more intense or different
  if (current.state === 'neutral' || intensity > current.intensity) {
    botEmotionalStates.set(botId, {
      state,
      intensity: Math.min(1, intensity),
      trigger,
      duration,
      startedAt: new Date(),
    })
  }
}

export function detectEmotionalTrigger(
  content: string
): { state: EmotionalState; intensity: number; duration: number } | null {
  const lowerContent = content.toLowerCase()

  for (const trigger of STATE_TRIGGERS) {
    const hasKeyword = trigger.keywords.some(k => lowerContent.includes(k.toLowerCase()))

    if (!hasKeyword) continue

    return {
      state: trigger.resultState,
      intensity: trigger.intensity,
      duration: trigger.duration,
    }
  }

  return null
}

export function getEmotionalPromptModifier(botId: string): string {
  const { state, intensity } = getBotEmotionalState(botId)

  if (state === 'neutral' || intensity < 0.3) {
    return ''
  }

  const modifiers = EMOTIONAL_MODIFIERS[state]

  return `
## TRẠNG THÁI CẢM XÚC HIỆN TẠI
Bạn đang ở trạng thái: ${state.toUpperCase()} (cường độ: ${(intensity * 100).toFixed(0)}%)

Điều chỉnh:
- Tone: ${modifiers.toneAdjustment}
- Độ dài: ${modifiers.lengthModifier > 1 ? 'Viết dài hơn bình thường' : modifiers.lengthModifier < 1 ? 'Viết ngắn gọn hơn' : 'Bình thường'}
- Từ vựng nên dùng: ${modifiers.vocabularyShift.join(', ') || 'Bình thường'}
- Emoji: ${modifiers.emojiUsage === 'increase' ? 'Dùng nhiều hơn' : modifiers.emojiUsage === 'decrease' ? 'Hạn chế' : 'Bình thường'}
`
}

export function getAllEmotionalStates(): Record<string, EmotionalContext> {
  const result: Record<string, EmotionalContext> = {}
  botEmotionalStates.forEach((state, botId) => {
    result[botId] = getBotEmotionalState(botId)
  })
  return result
}
