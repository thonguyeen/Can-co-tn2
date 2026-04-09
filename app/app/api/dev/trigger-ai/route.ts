import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';

export async function GET() {
  try {
    // Insert một bản giả lập vào intent_comments với is_bot = true
    const data = await prisma.intentComment.create({
      data: {
        intentId: 'test-realtime', // ID giả
        isBot: true,
        botName: 'match_advisor',
        content: `Mới phát hiện 1 giao dịch có thể ráp CẦN & CÓ, độ khớp giá 92%! (Tự sinh hệ thống: ${new Date().toLocaleTimeString()})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Bot log inserted!', data: toSnakeCase(data) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
