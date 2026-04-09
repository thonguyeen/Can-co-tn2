import { NextRequest, NextResponse } from 'next/server';
import {
  queryMemories,
  deleteMemory,
  deleteAllUserMemories,
  getUserMemorySummary,
  storeMemory,
  MemoryType,
} from '@/lib/intelligence/memory/persistent-memory';

// GET: Get user memories
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const action = req.nextUrl.searchParams.get('action');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    if (action === 'summary') {
      const summary = await getUserMemorySummary(userId);
      return NextResponse.json({ success: true, summary });
    }

    const typesParam = req.nextUrl.searchParams.get('types');
    const types = typesParam ? typesParam.split(',') as MemoryType[] : undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    const memories = await queryMemories({
      userId,
      types,
      limit,
    });

    return NextResponse.json({ success: true, memories });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

// POST: Store new memory
export async function POST(req: NextRequest) {
  try {
    const { userId, type, content, metadata, importance, source, expiresIn } = await req.json();

    if (!userId || !type || !content) {
      return NextResponse.json(
        { error: 'userId, type, and content required' },
        { status: 400 }
      );
    }

    const memory = await storeMemory(userId, type, content, metadata, {
      importance,
      source,
      expiresIn,
    });

    return NextResponse.json({ success: true, memory });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

// DELETE: Delete memories
export async function DELETE(req: NextRequest) {
  try {
    const { userId, memoryId, deleteAll } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (deleteAll) {
      await deleteAllUserMemories(userId);
    } else if (memoryId) {
      await deleteMemory(memoryId);
    } else {
      return NextResponse.json({ error: 'memoryId or deleteAll required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
