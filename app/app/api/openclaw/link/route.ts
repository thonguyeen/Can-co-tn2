import { NextRequest, NextResponse } from 'next/server';
import { initiateChannelLink, getUserChannels, unlinkChannel } from '@/lib/openclaw/channel-manager';
import { OpenClawChannel } from '@/lib/openclaw/types';

const VALID_CHANNELS: OpenClawChannel[] = ['whatsapp', 'telegram', 'discord', 'imessage'];

// POST: Initiate channel link
export async function POST(req: NextRequest) {
  try {
    const { userId, channel } = await req.json();

    if (!userId || !channel) {
      return NextResponse.json(
        { error: 'userId and channel required' },
        { status: 400 }
      );
    }

    if (!VALID_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: `Invalid channel. Must be one of: ${VALID_CHANNELS.join(', ')}` },
        { status: 400 }
      );
    }

    const { code, expiresAt } = await initiateChannelLink(userId, channel);

    return NextResponse.json({
      success: true,
      code,
      expiresAt,
      instructions: getInstructions(channel, code),
    });

  } catch (error) {
    console.error('Link initiation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Link failed' },
      { status: 500 }
    );
  }
}

// GET: Get user's linked channels
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const channels = await getUserChannels(userId);

    return NextResponse.json({
      success: true,
      channels,
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get channels' },
      { status: 500 }
    );
  }
}

// DELETE: Unlink channel
export async function DELETE(req: NextRequest) {
  try {
    const { userId, channel } = await req.json();

    if (!userId || !channel) {
      return NextResponse.json(
        { error: 'userId and channel required' },
        { status: 400 }
      );
    }

    await unlinkChannel(userId, channel);

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unlink failed' },
      { status: 500 }
    );
  }
}

function getInstructions(channel: OpenClawChannel, code: string): string {
  const instructions: Record<OpenClawChannel, string> = {
    whatsapp: `1. Mở WhatsApp
2. Tìm số FACEBOT (trong danh bạ)
3. Gửi tin nhắn: ${code}`,
    telegram: `1. Mở Telegram
2. Tìm @FacebotNewsBot
3. Gửi tin nhắn: ${code}`,
    discord: `1. Mở Discord
2. Gửi DM đến FACEBOT bot
3. Gửi: ${code}`,
    imessage: `1. Mở Messages
2. Gửi đến facebot@icloud.com
3. Gửi: ${code}`,
  };

  return instructions[channel];
}
