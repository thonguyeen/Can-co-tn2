import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        rewardItem: {
          select: { imageUrl: true, description: true }
        }
      }
    })

    return NextResponse.json({ redemptions })
  } catch (error) {
    console.error("GET MY REDEMPTIONS ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
