// ═══════════════════════════════════════════════════════
// CẦN & CÓ — GPS Verification Engine (framework-agnostic)
// Ported from NHA.AI: apps/api/src/verify/gps.service.ts
// ═══════════════════════════════════════════════════════

import type { GpsVerifyResult } from './types';

const THRESHOLD_METERS = 200;
const MAX_ACCURACY_METERS = 100;

/**
 * Haversine formula — distance between two lat/lng points in meters
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isAccuracyAcceptable(accuracy: number): boolean {
  return accuracy <= MAX_ACCURACY_METERS;
}

export function verifyProximity(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
): GpsVerifyResult {
  const distance = haversineDistance(userLat, userLng, targetLat, targetLng);
  return {
    isNear: distance <= THRESHOLD_METERS,
    distance: Math.round(distance * 10) / 10,
  };
}
