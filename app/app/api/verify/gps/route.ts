import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';
import { verifyProximity, isAccuracyAcceptable } from '@/lib/engine/gps';
import { calculateTrustScore, calculateLevel } from '@/lib/engine/trust';
import type { Verification } from '@/lib/engine/types';

// POST /api/verify/gps — GPS verification
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { intent_id, user_lat, user_lng, accuracy } = body;

  if (!intent_id || user_lat == null || user_lng == null) {
    return NextResponse.json({ error: 'intent_id, user_lat, user_lng required' }, { status: 400 });
  }

  if (accuracy && !isAccuracyAcceptable(accuracy)) {
    return NextResponse.json({ error: 'GPS accuracy too low. Vui lòng thử lại ở nơi thoáng hơn.' }, { status: 400 });
  }

  // Get intent location
  const intent = await prisma.intent.findUnique({
    where: { id: intent_id },
    select: { lat: true, lng: true },
  });

  if (!intent || !intent.lat || !intent.lng) {
    return NextResponse.json({ error: 'Intent has no location data' }, { status: 400 });
  }

  const result = verifyProximity(user_lat, user_lng, Number(intent.lat), Number(intent.lng));

  const verification = await prisma.verification.create({
    data: {
      userId,
      intentId: intent_id,
      type: 'gps',
      status: result.isNear ? 'approved' : 'rejected',
      data: { distance: result.distance, isNear: result.isNear },
      gpsLat: user_lat,
      gpsLng: user_lng,
      gpsAccuracy: accuracy || null,
    },
  });

  // Recalculate trust
  const allVerifications = await prisma.verification.findMany({
    where: { userId },
  });

  if (allVerifications.length > 0) {
    const score = calculateTrustScore(allVerifications as unknown as Verification[]);
    const level = calculateLevel(score);
    await prisma.profile.update({
      where: { id: userId },
      data: { trustScore: score, verificationLevel: level },
    });
  }

  return NextResponse.json({ verification: toSnakeCase(verification), gps: result }, { status: 201 });
}
