import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ReferralService } from "@/lib/referral/referral-service"
import { BOOST_POINTS_COST } from "@/lib/referral/constants"
import crypto from "crypto"

export async function GET() {
  const logs: string[] = []
  const testEmailPrefix = `diag-${Date.now()}-`
  
  try {
    logs.push("🚀 Bắt đầu Diagnostic Test cho Phase 02...")

    // 1. Tạo Referrer
    const referrerId = crypto.randomUUID()
    const referrerEmail = `${testEmailPrefix}referrer@test.com`
    const diagReferralCode = `DIAG${Date.now().toString().slice(-4)}`
    await prisma.user.create({
      data: {
        id: referrerId,
        email: referrerEmail,
        name: "Referrer Diag",
        profile: {
          create: {
            displayName: "Người mời Diag",
            referralCode: diagReferralCode, 
            userStats: { create: { points: 100 } }
          }
        }
      }
    })
    logs.push(`✅ Đã tạo Referrer: ${referrerEmail} (Code: ${diagReferralCode})`)

    // 2. Test Referral (Mời 1 người)
    const refereeId = crypto.randomUUID()
    const refereeEmail = `${testEmailPrefix}referee@test.com`
    await prisma.user.create({
      data: {
          id: refereeId,
          email: refereeEmail,
          name: "Referee Diag",
          profile: { create: { displayName: "Bạn Diag" } }
      }
    })
    
    await ReferralService.processReferral(diagReferralCode, refereeId)
    
    const referrerAfter = await prisma.profile.findUnique({
      where: { id: referrerId },
      include: { userStats: true }
    })
    
    if (referrerAfter?.userStats?.points === 120 && referrerAfter.totalReferrals === 1) {
      logs.push("✅ Test Referral: THÀNH CÔNG (Points: 120, Count: 1)")
    } else {
      logs.push(`❌ Test Referral: THẤT BẠI (Points: ${referrerAfter?.userStats?.points}, Count: ${referrerAfter?.totalReferrals})`)
    }

    // 3. Test Boost
    const intentId = crypto.randomUUID()
    await prisma.intent.create({
      data: {
        id: intentId,
        userId: referrerId,
        title: "Intent Diag",
        rawText: "Diag description",
        type: "CAN"
      }
    })

    // Simulating API logic
    await prisma.$transaction(async (tx) => {
      const updateRes = await tx.userStat.updateMany({
        where: { userId: referrerId, points: { gte: BOOST_POINTS_COST } },
        data: { points: { decrement: BOOST_POINTS_COST }, totalPointsSpent: { increment: BOOST_POINTS_COST } }
      })
      if (updateRes.count === 0) throw new Error("LOW_POINTS")
      await tx.intentBoost.create({
        data: { intentId, userId: referrerId, pointsSpent: BOOST_POINTS_COST, startAt: new Date(), endAt: new Date(Date.now() + 86400000) }
      })
    })

    const statAfterBoost = await prisma.userStat.findUnique({ where: { userId: referrerId } })
    if (statAfterBoost?.points === 70) {
      logs.push("✅ Test Boost: THÀNH CÔNG (Points: 70)")
    } else {
      logs.push(`❌ Test Boost: THẤT BẠI (Points: ${statAfterBoost?.points})`)
    }

    return NextResponse.json({ success: true, logs })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, logs })
  }
}
