// @ts-nocheck
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const rewards = await prisma.rewardItem.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' }
    })
    return NextResponse.json({ rewards })
  } catch (error) {
    console.error("GET REWARDS ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
