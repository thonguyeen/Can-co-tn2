/**
 * Common Prisma helpers for API routes.
 * Replaces repetitive patterns from Supabase SDK.
 */
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

/**
 * Standardized error response.
 * Supabase returned { error: message }, we keep the same format.
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Wrap an async API handler with try/catch.
 *
 * Usage:
 *   export const GET = withErrorHandler(async (req) => {
 *     const data = await prisma.bot.findMany()
 *     return NextResponse.json({ success: true, data })
 *   })
 */
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error('API Error:', error)
      const message = error instanceof Error ? error.message : 'Internal Server Error'
      return errorResponse(message, 500)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════

/**
 * Parse pagination params from URL search params.
 * Supabase used .range(offset, offset+limit-1), Prisma uses skip/take.
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit

  return { page, limit, skip, take: limit }
}

/**
 * Build paginated response matching existing frontend expectations.
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
    totalPages: Math.ceil(total / limit),
  }
}

// ═══════════════════════════════════════════════════════════════
// SNAKE_CASE ↔ CAMELCASE CONVERSION
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a camelCase key to snake_case.
 * Used when Prisma returns camelCase but frontend expects snake_case.
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * Recursively convert all keys in an object from camelCase to snake_case.
 * Handles nested objects and arrays.
 *
 * Usage:
 *   const prismaResult = await prisma.intent.findMany(...)
 *   return NextResponse.json(toSnakeCase(prismaResult))
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (obj instanceof Date) return obj.toISOString()
  if (typeof obj === 'bigint') return Number(obj)
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (typeof obj !== 'object') return obj

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = toSnakeCase(value)
  }
  return result
}

/**
 * Convert snake_case to camelCase (for receiving frontend data → Prisma).
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (typeof obj !== 'object' || obj instanceof Date) return obj

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = toCamelCase(value)
  }
  return result
}
