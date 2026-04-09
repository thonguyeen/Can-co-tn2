
import { PrismaClient } from "@prisma/client";
import { ReferralService } from "../lib/referral/referral-service.js"; // Use .js extension for ESM compatibility if needed, or .ts if the loader handles it
import { BOOST_POINTS_COST } from "../lib/referral/constants.js";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Đang bắt đầu kiểm tra Phase 02: Referral & Points logic...");

  try {
    // 1. Dọn dẹp dữ liệu cũ (Dùng cho test sạch)
    console.log("🧹 Đang dọn dẹp dữ liệu test...");
    const testEmailPrefix = "test-ref-";
    
    await prisma.user.deleteMany({
      where: { email: { startsWith: testEmailPrefix } }
    });

    // 2. Tạo Người mời (Referrer)
    const referrerId = crypto.randomUUID();
    const referrerEmail = `${testEmailPrefix}referrer@example.com`;
    console.log(`👤 Tạo Người mời: ${referrerEmail}`);
    
    await prisma.user.create({
      data: {
        id: referrerId,
        email: referrerEmail,
        name: "Referrer Test",
        profile: {
          create: {
            displayName: "Người mời",
            referralCode: "TESTCODE",
            userStats: {
                create: {
                    points: 100 
                }
            }
          }
        }
      }
    });

    // 3. Test Referral Success (Mời 3 người dể lên hạng)
    console.log("🔗 Test: Mời 3 người thành viên mới...");
    for (let i = 1; i <= 3; i++) {
        const refereeId = crypto.randomUUID();
        const refereeEmail = `${testEmailPrefix}referee-${i}@example.com`;
        
        await prisma.user.create({
            data: {
                id: refereeId,
                email: refereeEmail,
                name: `Referee ${i}`,
                profile: {
                    create: { displayName: `Bạn ${i}` }
                }
            }
        });

        console.log(`   > Xử lý referral cho ${refereeEmail}...`);
        await ReferralService.processReferral("TESTCODE", refereeId);
    }

    // Kiểm tra kết quả mời
    const updatedReferrer = await prisma.profile.findUnique({
        where: { id: referrerId },
        include: { userStats: true, referralsMade: true }
    });

    console.log("\n📊 Kết quả sau khi mời 3 người:");
    console.log(`   - Tổng số lượt mời: ${updatedReferrer?.totalReferrals} (Kỳ vọng: 3)`);
    console.log(`   - Cấp bậc (Tier): ${updatedReferrer?.tier} (Kỳ vọng: 2 - Bạc)`);
    console.log(`   - Số điểm: ${updatedReferrer?.userStats?.points} (Kỳ vọng: 100 + 3*20 = 160)`);

    if (updatedReferrer?.totalReferrals === 3 && updatedReferrer.tier === 2 && updatedReferrer.userStats?.points === 160) {
        console.log("✅ Test Referral: THÀNH CÔNG");
    } else {
        console.error("❌ Test Referral: THẤT BẠI");
    }

    // 4. Test Intent Boost
    console.log("\n🚀 Test: Boost bài đăng...");
    const intentId = crypto.randomUUID();
    await prisma.intent.create({
        data: {
            id: intentId,
            userId: referrerId,
            title: "Cần mua Laptop test",
            rawText: "Test boost description",
            type: "CAN"
        }
    });

    console.log(`   > Đang thực hiện boost bài ${intentId}...`);
    const now = new Date();
    await prisma.$transaction(async (tx) => {
        const updateRes = await tx.userStat.updateMany({
            where: { userId: referrerId, points: { gte: BOOST_POINTS_COST } },
            data: {
                points: { decrement: BOOST_POINTS_COST },
                totalPointsSpent: { increment: BOOST_POINTS_COST }
            }
        });

        if (updateRes.count === 0) throw new Error("INSUFFICIENT_POINTS");

        await tx.pointTransaction.create({
            data: {
                userId: referrerId,
                amount: -BOOST_POINTS_COST,
                reason: "Boost bài",
                type: "boost",
                referenceId: intentId
            }
        });

        const endAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        await tx.intentBoost.create({
            data: {
                intentId,
                userId: referrerId,
                pointsSpent: BOOST_POINTS_COST,
                startAt: now,
                endAt: endAt
            }
        });
    });

    const statAfterBoost = await prisma.userStat.findUnique({ where: { userId: referrerId } });
    const boostRecord = await prisma.intentBoost.findFirst({ where: { intentId } });

    console.log("📊 Kết quả sau khi Boost:");
    console.log(`   - Điểm còn lại: ${statAfterBoost?.points} (Kỳ vọng: 160 - 50 = 110)`);
    console.log(`   - Bản ghi Boost: ${boostRecord ? "Tìm thấy" : "Không thấy"}`);

    if (statAfterBoost?.points === 110 && boostRecord) {
        console.log("✅ Test Boost: THÀNH CÔNG");
    } else {
        console.error("❌ Test Boost: THẤT BẠI");
    }

    // 5. Test Reward Redemption
    console.log("\n🎁 Test: Đổi quà...");
    const rewardId = crypto.randomUUID();
    await prisma.rewardItem.create({
        data: {
            id: rewardId,
            label: "Voucher 50k",
            pointsCost: 100,
            stock: 5,
            isActive: true
        }
    });

    console.log(`   > Đang thực hiện đổi quà ${rewardId}...`);
    await prisma.$transaction(async (tx) => {
        const updateRes = await tx.userStat.updateMany({
            where: { userId: referrerId, points: { gte: 100 } },
            data: {
                points: { decrement: 100 },
                totalPointsSpent: { increment: 100 }
            }
        });

        if (updateRes.count === 0) throw new Error("INSUFFICIENT_POINTS");

        await tx.rewardItem.update({
            where: { id: rewardId },
            data: { stock: { decrement: 1 } }
        });

        await tx.rewardRedemption.create({
            data: {
                userId: referrerId,
                rewardItemId: rewardId,
                rewardLabel: "Voucher 50k",
                pointsCost: 100,
                status: "PENDING"
            }
        });
    });

    const statAfterRedeem = await prisma.userStat.findUnique({ where: { userId: referrerId } });
    const rewardAfter = await prisma.rewardItem.findUnique({ where: { id: rewardId } });

    console.log("📊 Kết quả sau khi Đổi quà:");
    console.log(`   - Điểm còn lại: ${statAfterRedeem?.points} (Kỳ vọng: 110 - 100 = 10)`);
    console.log(`   - Tồn kho còn: ${rewardAfter?.stock} (Kỳ vọng: 4)`);

    if (statAfterRedeem?.points === 10 && rewardAfter?.stock === 4) {
        console.log("✅ Test Redeem: THÀNH CÔNG");
    } else {
        console.error("❌ Test Redeem: THẤT BẠI");
    }

    console.log("\n🏁 Hoàn tất tất cả bài kiểm tra!");

  } catch (error) {
    console.error("\n💥 LỖI TRONG QUÁ TRÌNH TEST:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
