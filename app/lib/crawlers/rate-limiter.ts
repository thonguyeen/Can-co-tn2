// ═══════════════════════════════════════════════════════════════
// RATE LIMITER FOR API CALLS
// ═══════════════════════════════════════════════════════════════

interface RateLimitState {
  requests: number
  windowStart: number
  cooldownUntil: number | null
}

// In-memory store (use Redis in production)
const rateLimitStore: Map<string, RateLimitState> = new Map()

export interface RateLimitConfig {
  requestsPerMinute: number
  cooldownMinutes: number
}

export function checkRateLimit(
  sourceId: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window

  let state = rateLimitStore.get(sourceId)

  // Check cooldown
  if (state?.cooldownUntil && now < state.cooldownUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((state.cooldownUntil - now) / 1000),
    }
  }

  // Initialize or reset window
  if (!state || now - state.windowStart > windowMs) {
    state = {
      requests: 0,
      windowStart: now,
      cooldownUntil: null,
    }
  }

  // Check rate limit
  if (state.requests >= config.requestsPerMinute) {
    state.cooldownUntil = now + config.cooldownMinutes * 60 * 1000
    rateLimitStore.set(sourceId, state)

    return {
      allowed: false,
      retryAfter: config.cooldownMinutes * 60,
    }
  }

  // Allow request
  state.requests++
  rateLimitStore.set(sourceId, state)

  return { allowed: true }
}

export function resetRateLimit(sourceId: string): void {
  rateLimitStore.delete(sourceId)
}

export function getRateLimitStatus(sourceId: string): RateLimitState | null {
  return rateLimitStore.get(sourceId) || null
}

export function getAllRateLimitStatus(): Record<string, RateLimitState> {
  const result: Record<string, RateLimitState> = {}
  rateLimitStore.forEach((state, key) => {
    result[key] = state
  })
  return result
}
