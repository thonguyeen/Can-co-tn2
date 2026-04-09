import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const now = new Date()
    const activeBoosts = await prisma.intentBoost.findMany({
      where: {
        endAt: { gt: now }
      },
      select: { intentId: true }
    })

    const boostedIntentIds = activeBoosts.map(b => b.intentId)
    
    // Xóa trùng lặp (phòng hờ)
    const uniqueIds = Array.from(new Set(boostedIntentIds))

    return NextResponse.json({ boostedIntentIds: uniqueIds })
  } catch (error) {
    console.error("GET ACTIVE BOOSTS ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
