import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"
import { RewardStatus } from "@prisma/client"

// ─── PATCH: Sửa thông tin quà / Ẩn/hiện quà ───
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { id } = await params

  let body: {
    label?: string
    description?: string
    pointsCost?: number
    imageUrl?: string
    stock?: number | null
    isActive?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 })
  }

  // Chỉ update những field được gửi lên
  const updateData: Record<string, unknown> = {}
  if (body.label !== undefined) {
    if (body.label.trim().length < 2) {
      return NextResponse.json({ error: "Tên quà phải có ít nhất 2 ký tự." }, { status: 400 })
    }
    updateData.label = body.label.trim()
  }
  if (body.description !== undefined) updateData.description = body.description?.trim() ?? null
  if (body.pointsCost !== undefined) {
    if (body.pointsCost <= 0) {
      return NextResponse.json({ error: "pointsCost phải là số dương." }, { status: 400 })
    }
    updateData.pointsCost = body.pointsCost
  }
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
  if (body.stock !== undefined) updateData.stock = body.stock
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Không có trường nào để cập nhật." }, { status: 400 })
  }

  try {
    const item = await prisma.rewardItem.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json({ message: "Đã cập nhật thành công.", item })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy quà tặng." }, { status: 404 })
    }
    console.error("[admin/reward-items/[id] PATCH]", error)
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 })
  }
}

// ─── DELETE: Xóa quà khỏi catalog ───
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { id } = await params

  // Kiểm tra còn đơn PENDING trỏ vào quà này không (dùng enum đúng chuẩn)
  const pendingCount = await prisma.rewardRedemption.count({
    where: { rewardItemId: id, status: RewardStatus.PENDING }
  })

  if (pendingCount > 0) {
    return NextResponse.json(
      {
        error: `Không thể xóa khi còn ${pendingCount} đơn đang chờ duyệt. Hãy xử lý hết đơn trước hoặc ẩn quà (isActive: false) thay vì xóa.`
      },
      { status: 409 }
    )
  }

  try {
    await prisma.rewardItem.delete({ where: { id } })
    return NextResponse.json({ message: "Đã xóa quà khỏi catalog." })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Không tìm thấy quà tặng." }, { status: 404 })
    }
    console.error("[admin/reward-items/[id] DELETE]", error)
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 })
  }
}
