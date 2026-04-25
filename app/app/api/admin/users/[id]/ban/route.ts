// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { id } = await params

  let body: { ban: boolean; reason?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 })
  }

  const { ban, reason } = body

  if (typeof ban !== "boolean") {
    return NextResponse.json(
      { error: "Trường 'ban' phải là boolean (true = khóa, false = mở khóa)." },
      { status: 400 }
    )
  }

  // Nếu ban = true, bắt buộc phải có lý do
  if (ban && (!reason || reason.trim().length < 5)) {
    return NextResponse.json(
      { error: "Phải cung cấp lý do khóa tài khoản (ít nhất 5 ký tự)." },
      { status: 400 }
    )
  }

  const profile = await prisma.profile.findUnique({ where: { id } })
  if (!profile) {
    return NextResponse.json({ error: "Không tìm thấy user." }, { status: 404 })
  }

  try {
    const updated = await prisma.profile.update({
      where: { id },
      data: {
        isBanned: ban,
        banReason: ban ? `[Admin: ${guard.adminEmail}] ${reason!.trim()}` : null,
        bannedAt: ban ? new Date() : null
      },
      select: { id: true, displayName: true, isBanned: true, banReason: true, bannedAt: true }
    })

    return NextResponse.json({
      message: ban
        ? `Đã khóa tài khoản ${updated.displayName ?? id}.`
        : `Đã mở khóa tài khoản ${updated.displayName ?? id}.`,
      user: updated
    })
  } catch (error) {
    console.error("[admin/users/[id]/ban POST]", error)
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 })
  }
}
