import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Kết quả trả về từ requireAdmin() — legacy, giữ cho backward-compat.
 */
export type AdminGuardResult =
  | { isAdmin: true; adminEmail: string }
  | { isAdmin: false; response: NextResponse }

/**
 * Kết quả trả về từ requireRole().
 */
export type RoleGuardResult =
  | { ok: true; role: string; userId: string }
  | { ok: false; response: NextResponse }

// Thứ tự cấp bậc: ADMIN cao hơn MODERATOR cao hơn USER
const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 2,
  MODERATOR: 1,
  USER: 0,
}

/**
 * Helper bảo vệ API theo role — đọc role từ Session JWT (Phase 02).
 *
 * @param minimumRole - Role tối thiểu được phép truy cập
 * @example
 * const guard = await requireRole("MODERATOR")
 * if (!guard.ok) return guard.response
 * // guard.role, guard.userId dùng được
 */
export async function requireRole(
  minimumRole: "ADMIN" | "MODERATOR"
): Promise<RoleGuardResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized: Cần đăng nhập để truy cập." },
        { status: 401 }
      ),
    }
  }

  const userRole = (session.user as any).role ?? "USER"
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0

  if (userLevel < requiredLevel) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Forbidden: Cần quyền ${minimumRole} để thực hiện thao tác này.` },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true,
    role: userRole,
    userId: (session.user as any).id ?? "",
  }
}

/**
 * Helper bảo vệ cổng Admin — LEGACY (dùng env ADMIN_EMAILS).
 * Giữ lại để không break các routes đang dùng.
 * TODO: Migrate dần sang requireRole("MODERATOR") sau.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return {
      isAdmin: false,
      response: NextResponse.json(
        { error: "Unauthorized: Cần đăng nhập để truy cập." },
        { status: 401 }
      )
    }
  }

  const userEmail = session.user.email.toLowerCase()

  // Đọc từ env, fallback sang mảng rỗng nếu chưa cấu hình
  const adminEmailsRaw = process.env.ADMIN_EMAILS ?? ""
  const adminEmails = adminEmailsRaw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!adminEmails.includes(userEmail)) {
    return {
      isAdmin: false,
      response: NextResponse.json(
        { error: "Forbidden: Bạn không có quyền quản trị." },
        { status: 403 }
      )
    }
  }

  return { isAdmin: true, adminEmail: userEmail }
}

