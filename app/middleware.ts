import { getToken } from "next-auth/jwt"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  const pathname = request.nextUrl.pathname

  // Bỏ qua kiểm tra cho hệ thống xác thực NextAuth
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Các Cron Job được check bảo mật bằng CRON_SECRET bên trong code Route, được đi qua
  if (pathname.startsWith('/api/cron')) {
    return NextResponse.next()
  }

  // Khóa CHẶT tất cả các API route còn lại. Trả về 401 nếu gõ lệnh láo
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized / Cần đăng nhập để dùng API" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Vùng Demo cho phép truy cập Public
  if (pathname.startsWith('/demo')) {
    return NextResponse.next()
  }

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  // Đã có session thì đá đít khỏi trang đăng nhập
  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protected routes - Người lạ cấm vào
  if (!token) {
    const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
