/**
 * Auth helper for API routes — replaces supabase.auth.getUser()
 *
 * TRƯỚC (Supabase):
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   const userId = user?.id
 *
 * SAU (NextAuth):
 *   const userId = await getAuthUserId(req)
 *   if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET

/**
 * Get the authenticated user's ID from the NextAuth JWT token.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET })
    return token?.sub ?? null
  } catch {
    return null
  }
}

/**
 * Get the full NextAuth token (includes sub, email, name, etc.)
 * Returns null if not authenticated.
 */
export async function getAuthToken(req: NextRequest) {
  try {
    return await getToken({ req, secret: NEXTAUTH_SECRET })
  } catch {
    return null
  }
}

/**
 * Require authentication — throws-free pattern for API routes.
 * Returns { userId } or { error response }.
 *
 * Usage:
 *   const auth = await requireAuth(req)
 *   if ('error' in auth) return auth.error
 *   const { userId } = auth
 */
export async function requireAuth(req: NextRequest): Promise<
  { userId: string } | { error: Response }
> {
  const userId = await getAuthUserId(req)
  if (!userId) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Vui lòng đăng nhập' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }
  return { userId }
}
