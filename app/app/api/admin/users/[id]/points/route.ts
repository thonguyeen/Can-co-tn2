import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { id } = params

  let body: { amount: number; reason: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 })
  }

  const { amount, reason } = body

  // ─── Validation ───
  if (typeof amount !== "number" || amount === 0) {
    return NextResponse.json(
      { error: "amount phải là số khác 0 (dương = cộng, âm = trừ)." },
      { status: 400 }
    )
  }

  if (!reason || reason.trim().length < 5) {
    return NextResponse.json(
      { error: "reason phải có ít nhất 5 ký tự." },
      { status: 400 }
    )
  }

  // ─── Kiểm tra user tồn tại ───
  const profile = await prisma.profile.findUnique({ where: { id } })
  if (!profile) {
    return NextResponse.json({ error: "Không tìm thấy user." }, { status: 404 })
  }

  // ─── Kiểm tra trừ điểm không vượt quá tồn kho ───
  // Tech Lead Condition: Không cho phép âm điểm.
  if (amount < 0) {
    const stats = await prisma.userStat.findUnique({ where: { userId: id } })
    const currentPoints = stats?.points ?? 0
    if (currentPoints + amount < 0) {
      return NextResponse.json(
        {
          error: `Số điểm không đủ. User hiện có ${currentPoints} điểm, không thể trừ ${Math.abs(amount)} điểm.`
        },
        { status: 400 }
      )
    }
  }

  // ─── Atomic transaction: Ghi sổ + Cập nhật số dư ───
  // Tech Lead Condition: Audit trail ghi rõ Admin nào thao tác.
  const auditReason = `[Admin: ${guard.adminEmail}] ${reason.trim()}`

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ghi sổ giao dịch
      const transaction = await tx.pointTransaction.create({
        data: {
          userId: id,
          amount,
          type: "manual",
          reason: auditReason
        }
      })

      // 2. Cập nhật số dư (Atomic increment/decrement — không bao giờ race condition)
      const updatedStats = await tx.userStat.upsert({
        where: { userId: id },
        create: {
          userId: id,
          points: Math.max(0, amount),
          totalPointsEarned: amount > 0 ? amount : 0,
          totalPointsSpent: amount < 0 ? Math.abs(amount) : 0
        },
        update: {
          points: { increment: amount },
          ...(amount > 0
            ? { totalPointsEarned: { increment: amount } }
            : { totalPointsSpent: { increment: Math.abs(amount) } })
        }
      })

      return { transaction, updatedStats }
    })

    return NextResponse.json({
      message: `Đã ${amount > 0 ? "cộng" : "trừ"} ${Math.abs(amount)} điểm thành công.`,
      newBalance: result.updatedStats.points,
      transactionId: result.transaction.id
    })
  } catch (error) {
    console.error("[admin/users/[id]/points POST]", error)
    return NextResponse.json({ error: "Lỗi server khi xử lý điểm." }, { status: 500 })
  }
}
