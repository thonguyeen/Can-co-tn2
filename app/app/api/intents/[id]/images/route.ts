import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/data/get-user';
import { promises as fs } from 'fs';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/intents/[id]/images — upload images (local storage)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { userId } = auth;

  // Verify ownership
  const intentList = await prisma.$queryRaw<any[]>`SELECT id FROM intents WHERE id = ${id}::uuid AND user_id = ${userId}::uuid LIMIT 1`;
  const intent = intentList[0];

  if (!intent) {
    return NextResponse.json({ error: 'Intent not found or not owned' }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll('images') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  if (files.length > 10) {
    return NextResponse.json({ error: 'Maximum 10 images per upload' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'intents', id);
  await fs.mkdir(uploadDir, { recursive: true });

  const uploaded = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      continue; // Skip invalid files silently
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      continue;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${i}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/intents/${id}/${fileName}`;

    const data = await prisma.$queryRaw<any[]>`
      INSERT INTO intent_images (intent_id, url, display_order)
      VALUES (${id}::uuid, ${publicUrl}, ${i})
      RETURNING id, intent_id, url, display_order, created_at
    `;
    const img = data[0];

    uploaded.push({
      id: img.id,
      intent_id: img.intent_id,
      url: img.url,
      display_order: img.display_order,
      created_at: img.created_at,
    });
  }

  if (uploaded.length === 0) {
    return NextResponse.json({ error: 'No valid images uploaded (check type/size)' }, { status: 400 });
  }

  return NextResponse.json({ images: uploaded }, { status: 201 });
}
