// ═══════════════════════════════════════════════════════════════
// OPENCLAW SECURITY MODULE
// ═══════════════════════════════════════════════════════════════
//
// Input sanitization and security utilities for OpenClaw messages
//

// ═══════════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Sanitize user input to prevent XSS, injection, and other attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, 2000);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Prevent command injection - remove shell metacharacters
  sanitized = sanitized.replace(/[`$\\]/g, '');

  // Prevent SQL injection patterns
  sanitized = sanitized.replace(/('|"|;|--|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/gi, '');

  // Prevent HTML/Script injection
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+=/gi, '');

  // Normalize whitespace (but keep newlines)
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  return sanitized;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  // Valid phone: 10-15 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate channel ID format
 */
export function validateChannelId(channel: string, channelId: string): boolean {
  switch (channel) {
    case 'whatsapp':
      return validatePhoneNumber(channelId);
    case 'telegram':
      // Telegram chat IDs are numeric (positive or negative)
      return /^-?\d+$/.test(channelId);
    case 'discord':
      // Discord user IDs are snowflakes (large numbers)
      return /^\d{17,19}$/.test(channelId);
    case 'imessage':
      // iMessage can be phone or email
      return validatePhoneNumber(channelId) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(channelId);
    default:
      return false;
  }
}

/**
 * Rate limit tracking
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 3600000 // 1 hour
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 10 * 60 * 1000);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string): string {
  // Mask phone numbers
  let masked = data.replace(/\+?\d{10,15}/g, (match) => {
    return match.slice(0, 4) + '*'.repeat(match.length - 7) + match.slice(-3);
  });

  // Mask email addresses
  masked = masked.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, (match) => {
    const [local, domain] = match.split('@');
    return local.slice(0, 2) + '***@' + domain;
  });

  return masked;
}

/**
 * Generate secure verification code
 */
export function generateVerificationCode(): string {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

/**
 * Validate verification code format
 */
export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
