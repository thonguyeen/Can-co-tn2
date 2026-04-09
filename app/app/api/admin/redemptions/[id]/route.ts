import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"
import { RewardStatus } from "@prisma/client"

type AllowedStatus = "approved" | "rejected" | "fulfilled"
const STATUS_MAP: Record<AllowedStatus, RewardStatus> = {
  approved: RewardStatus.APPROVED,
  rejected: RewardStatus.REJECTED,
  fulfilled: RewardStatus.FULFILLED
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { id } = await params

  let body: { status: AllowedStatus; adminNote?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 })
  }

  const { status, adminNote } = body
  const allowedKeys = Object.keys(STATUS_MAP) as AllowedStatus[]

  if (!allowedKeys.includes(status)) {
    return NextResponse.json(
      { error: `status phải là một trong: ${allowedKeys.join(", ")}` },
      { status: 400 }
    )
  }

  // ─── Tìm đơn hàng ───
  const redemption = await prisma.rewardRedemption.findUnique({
    where: { id },
    include: { rewardItem: { select: { pointsCost: true, label: true } } }
  })

  if (!redemption) {
    return NextResponse.json({ error: "Không tìm thấy đơn đổi quà." }, { status: 404 })
  }

  if (redemption.status !== RewardStatus.PENDING) {
    return NextResponse.json(
      { error: `Đơn này đã được xử lý (${redemption.status}), không thể thay đổi lại.` },
      { status: 409 }
    )
  }

  try {
    if (status === "rejected") {
      // ─── Từ chối → Hoàn trả điểm (Atomic 3-step refund) ───
      // Điểm hoàn = pointsCost từ đơn gốc (ghi tại lúc tạo đơn để tránh thay đổi sau)
      const refundAmount = redemption.pointsCost
      const rewardLabel = redemption.rewardItem?.label ?? "phần thưởng"
      const auditNote = adminNote?.trim() ?? "Không có ghi chú"

      await prisma.$transaction(async (tx) => {
        // 1. Cập nhật trạng thái đơn
        await tx.rewardRedemption.update({
          where: { id },
          data: {
            status: RewardStatus.REJECTED,
            adminNote: `[Admin: ${guard.adminEmail}] ${auditNote}`
          }
        })

        // 2. Ghi sổ hoàn tiền
        await tx.pointTransaction.create({
          data: {
            userId: redemption.userId,
            amount: refundAmount,
            type: "refund",
            reason: `[Admin: ${guard.adminEmail}] Hoàn điểm do từ chối đổi quà: "${rewardLabel}"`,
            referenceId: id
          }
        })

        // 3. Cộng lại điểm cho user (Atomic - không race condition)
        await tx.userStat.update({
          where: { userId: redemption.userId },
          data: {
            points: { increment: refundAmount },
            totalPointsSpent: { decrement: refundAmount }
          }
        })
      })

      return NextResponse.json({
        message: `Đã từ chối đơn. Hoàn trả ${refundAmount} điểm cho user.`
      })
    } else {
      // ─── approved / fulfilled → Chỉ cập nhật trạng thái ───
      await prisma.rewardRedemption.update({
        where: { id },
        data: {
          status: STATUS_MAP[status],
          adminNote: adminNote
            ? `[Admin: ${guard.adminEmail}] ${adminNote.trim()}`
            : `[Admin: ${guard.adminEmail}] Đã duyệt`
        }
      })

      return NextResponse.json({
        message: `Đã cập nhật trạng thái đơn thành "${status}".`
      })
    }
  } catch (error) {
    console.error("[admin/redemptions/[id] PATCH]", error)
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 })
  }
}
