import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"
import { RewardStatus } from "@prisma/client"

// ─── GET: Danh sách quà tặng ───
export async function GET(_request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const items = await prisma.rewardItem.findMany({
    orderBy: [{ isActive: "desc" }, { pointsCost: "asc" }]
  })

  return NextResponse.json({ items })
}

// ─── POST: Thêm quà mới vào catalog ───
export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  let body: {
    label: string
    description?: string
    pointsCost: number
    imageUrl?: string
    stock?: number
    isActive?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 })
  }

  const { label, description, pointsCost, imageUrl, stock, isActive } = body

  if (!label || label.trim().length < 2) {
    return NextResponse.json({ error: "Tên quà (label) phải có ít nhất 2 ký tự." }, { status: 400 })
  }

  if (typeof pointsCost !== "number" || pointsCost <= 0) {
    return NextResponse.json({ error: "pointsCost phải là số dương." }, { status: 400 })
  }

  try {
    const item = await prisma.rewardItem.create({
      data: {
        label: label.trim(),
        description: description?.trim() ?? null,
        pointsCost,
        imageUrl: imageUrl ?? null,
        stock: stock ?? -1,   // -1 = không giới hạn (theo schema default)
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({ message: "Đã thêm quà mới.", item }, { status: 201 })
  } catch (error) {
    console.error("[admin/reward-items POST]", error)
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 })
  }
}
