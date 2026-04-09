import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Kết quả trả về từ requireAdmin().
 * Nếu isAdmin = true, adminEmail sẽ có giá trị để ghi vào audit trail.
 */
export type AdminGuardResult =
  | { isAdmin: true; adminEmail: string }
  | { isAdmin: false; response: NextResponse }

/**
 * Helper bảo vệ cổng Admin.
 * 
 * - Đọc danh sách email admin từ env ADMIN_EMAILS (CSV format).
 * - So sánh case-insensitive với session user.
 * - Trả về adminEmail để dùng trong audit trail (PointTransaction.reason).
 * 
 * Tech Lead Condition: Email so sánh bằng toLowerCase() để chống bypass qua Spoof case.
 * 
 * @example
 * const guard = await requireAdmin()
 * if (!guard.isAdmin) return guard.response
 * // guard.adminEmail bây giờ dùng được
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
