import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { toSnakeCase } from '@/lib/data/helpers';
import { processSodo } from '@/lib/engine/ocr';
import { calculateTrustScore, calculateLevel } from '@/lib/engine/trust';
import type { Verification } from '@/lib/engine/types';
import { promises as fs } from 'fs';
import path from 'path';

// POST /api/verify/sodo — upload + OCR sổ đỏ
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const intentId = formData.get('intent_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'image file required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Local Storage (replaces Supabase until S3/R2 migration)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'verification-scans', 'sodo', userId);
    await fs.mkdir(uploadDir, { recursive: true });
    
    const fileName = `${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    const publicUrl = `/uploads/verification-scans/sodo/${userId}/${fileName}`;

    const ocrData = await processSodo(buffer);

    // Create verification record — Prisma
    const verification = await prisma.verification.create({
      data: {
        userId,
        intentId: intentId || null,
        type: 'sodo',
        status: 'pending',
        data: ocrData as unknown as Prisma.InputJsonValue,
        imageUrl: publicUrl,
      },
    });

    // Recalculate trust score
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

    return NextResponse.json({ verification: toSnakeCase(verification), ocr: ocrData }, { status: 201 });
  } catch (error) {
    console.error('OCR API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
