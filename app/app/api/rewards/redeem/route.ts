import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { rewardItemId } = await request.json()

    if (!rewardItemId) {
      return NextResponse.json({ error: "rewardItemId is required" }, { status: 400 })
    }

    const reward = await prisma.rewardItem.findUnique({
      where: { id: rewardItemId }
    })

    if (!reward || !reward.isActive) {
      return NextResponse.json({ error: "Reward not found or inactive" }, { status: 404 })
    }

    if (reward.stock !== null && reward.stock === 0) {
      return NextResponse.json({ error: "Reward is out of stock" }, { status: 400 })
    }

    // Atomic decrement & Creation (Tech Lead Checkpoint)
    const redemption = await prisma.$transaction(async (tx) => {
      // 1. Trừ điểm an toàn
      const updateRes = await tx.userStat.updateMany({
        where: {
          userId,
          points: { gte: reward.pointsCost }
        },
        data: {
          points: { decrement: reward.pointsCost },
          totalPointsSpent: { increment: reward.pointsCost }
        }
      });

      if (updateRes.count === 0) {
        throw new Error("INSUFFICIENT_POINTS");
      }

      // 2. Trừ kho quà (nếu quà này có quản lý số lượng tồn kho)
      if (reward.stock !== null && reward.stock > 0) {
        const updateStock = await tx.rewardItem.updateMany({
           where: { id: rewardItemId, stock: { gt: 0 } },
           data: { stock: { decrement: 1 } }
        });
        if (updateStock.count === 0) {
           throw new Error("OUT_OF_STOCK");
        }
      }

      // 3. Log điểm Transaction
      await tx.pointTransaction.create({
        data: {
          userId,
          amount: -reward.pointsCost,
          reason: `Đổi quà: ${reward.label}`,
          type: "redeem",
          referenceId: rewardItemId
        }
      });

      // 4. Record Redemption Log
      return await tx.rewardRedemption.create({
        data: {
          userId,
          rewardItemId,
          rewardLabel: reward.label,
          pointsCost: reward.pointsCost,
          status: "PENDING"
        }
      });
    });

    return NextResponse.json({ success: true, redemption })

  } catch (error: any) {
    if (error.message === "INSUFFICIENT_POINTS") {
      return NextResponse.json({ error: "Bạn không đủ điểm để đổi món quà này" }, { status: 402 })
    }
    if (error.message === "OUT_OF_STOCK") {
      return NextResponse.json({ error: "Rất tiếc, món quà này vừa hết hàng" }, { status: 400 })
    }
    console.error("POST REDEEM ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
