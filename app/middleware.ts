import { getToken } from "next-auth/jwt"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  const pathname = request.nextUrl.pathname

  // ═══ AUTH SYSTEM — luôn cho qua ═══
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // ═══ CRON JOB — check bảo mật bên trong route ═══
  if (pathname.startsWith('/api/cron')) {
    return NextResponse.next()
  }

  // ═══ API PROTECTION ═══
  // Public APIs: GET /api/intents, /api/map/*, /api/intents/[id] (GET)
  // Protected APIs: tất cả mutation + private endpoints
  if (pathname.startsWith('/api/')) {
    const isPublicApi =
      pathname.startsWith('/api/map') ||
      (pathname === '/api/intents' && request.method === 'GET') ||
      (pathname.match(/^\/api\/intents\/[^/]+$/) && request.method === 'GET');

    if (!isPublicApi && !token) {
      return NextResponse.json(
        { error: "Unauthorized — Đăng nhập để dùng tính năng này" },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // ═══════════════════════════════════════════════════════════════
  // ADMIN RBAC — Bảo vệ khu vực /admin theo role
  // ═══════════════════════════════════════════════════════════════
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    const role = (token as any).role ?? "USER"

    if (role === "USER") {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (role === "MODERATOR" && pathname.startsWith('/admin/bots')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()
  }

  // ═══ DEMO — public ═══
  if (pathname.startsWith('/demo')) {
    return NextResponse.next()
  }

  // ═══ AUTH ROUTES (/login, /register) ═══
  // Đã login → đá ra khỏi trang đăng nhập
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // ═══════════════════════════════════════════════════════════════
  // GUEST BROWSE MODE — Cho phép guest xem tất cả page routes
  // Actions (like, save, chat...) được gate ở client-side
  // bằng useAuthGate() hook + AuthGateModal
  // ═══════════════════════════════════════════════════════════════
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
