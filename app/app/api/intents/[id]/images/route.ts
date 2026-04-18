import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/data/get-user';
import { promises as fs } from 'fs';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_PER_INTENT = 5;

// POST /api/intents/[id]/images — upload images (local storage)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await requireAuth(request);
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    // Verify ownership using Prisma ORM
    const intent = await prisma.intent.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!intent) {
      return NextResponse.json({ error: 'Intent not found or not owned' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (files.length > MAX_IMAGES_PER_INTENT) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES_PER_INTENT} images per upload` }, { status: 400 });
    }

    // Guard: count existing images for this intent
    const existingCount = await prisma.intentImage.count({
      where: { intentId: id },
    });
    const remaining = MAX_IMAGES_PER_INTENT - existingCount;
    if (remaining <= 0) {
      return NextResponse.json({ error: 'Đã đủ 5 ảnh, không thể thêm' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'intents', id);
    await fs.mkdir(uploadDir, { recursive: true });

    const uploaded = [];
    const filesToProcess = files.slice(0, remaining); // Only process up to remaining slots

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        console.warn(`[images] Skipping file ${file.name}: invalid type ${file.type}`);
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`[images] Skipping file ${file.name}: too large ${file.size}`);
        continue;
      }

      const ext = file.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');
      const fileName = `${Date.now()}_${i}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      // Write file to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/intents/${id}/${fileName}`;

      // Insert using Prisma ORM (safer than raw SQL)
      const img = await prisma.intentImage.create({
        data: {
          intentId: id,
          url: publicUrl,
          displayOrder: existingCount + i,
        },
      });

      uploaded.push({
        id: img.id,
        intent_id: img.intentId,
        url: img.url,
        display_order: img.displayOrder,
        created_at: img.createdAt,
      });
    }

    if (uploaded.length === 0) {
      return NextResponse.json({ error: 'No valid images uploaded (check type/size)' }, { status: 400 });
    }

    console.log(`[images] Uploaded ${uploaded.length} images for intent ${id}`);
    return NextResponse.json({ images: uploaded }, { status: 201 });
  } catch (err) {
    console.error('[images] Upload failed:', err);
    return NextResponse.json(
      { error: 'Upload failed', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
