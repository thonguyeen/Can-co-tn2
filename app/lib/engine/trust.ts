// ═══════════════════════════════════════════════════════
// CẦN & CÓ — Trust Score Engine (framework-agnostic)
// Ported from NHA.AI verify logic
// ═══════════════════════════════════════════════════════

import type { VerificationLevel, Verification } from './types';

/**
 * Calculate trust score (0-5) based on completed verifications
 */
export function calculateTrustScore(verifications: Verification[]): number {
  const approved = verifications.filter((v) => v.status === 'approved');
  if (approved.length === 0) return 1;

  let score = 1;
  const types = new Set(approved.map((v) => v.type));

  if (types.has('cccd')) score += 2;
  if (types.has('sodo')) score += 1;
  if (types.has('gps')) score += 1;

  return Math.min(score, 5);
}

/**
 * Determine verification level from trust score
 */
export function calculateLevel(trustScore: number): VerificationLevel {
  if (trustScore >= 5) return 'verified';
  if (trustScore >= 3) return 'kyc';
  return 'none';
}

/**
 * Get Vietnamese label for verification level
 */
export function getVerificationLabel(level: VerificationLevel): string {
  switch (level) {
    case 'verified': return 'Đã xác thực';
    case 'kyc': return 'Đã KYC';
    case 'none': return 'Chưa xác thực';
  }
}

/**
 * Get badge color class for verification level
 */
export function getVerificationBadgeClass(level: VerificationLevel): string {
  switch (level) {
    case 'verified': return 'badge-normal';
    case 'kyc': return 'badge-info';
    case 'none': return 'badge-elevated';
  }
}
