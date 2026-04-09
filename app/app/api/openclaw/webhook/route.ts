// POST /api/openclaw/webhook - Receive messages from channels
// Phase 13: Multi-Channel Chat Integration

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  isUsingOpenClaw,
  getSessionManager,
  getOpenClawClient,
  ChannelType,
} from '@/lib/openclaw';
import { handleIncomingMessage } from '@/lib/openclaw/message-handler';
import { OpenClawChannel } from '@/lib/openclaw/types';

export const maxDuration = 30; // 30 seconds timeout

interface WebhookPayload {
  type: 'message' | 'reaction' | 'follow' | 'unfollow';
  channel: ChannelType;
  data: {
    messageId?: string;
    senderId: string;
    senderName: string;
    content?: string;
    replyToPostId?: string;
    replyToCommentId?: string;
    reaction?: string;
    timestamp: number;
  };
  signature?: string;
}

// Verify webhook signature (if configured)
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET;
  if (!secret) return true; // No verification if no secret configured

  // Simple HMAC verification
  const crypto = require('crypto');
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSig;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body: WebhookPayload = JSON.parse(rawBody);

    // Verify signature if provided
    if (body.signature && !verifySignature(rawBody, body.signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    if (!isUsingOpenClaw()) {
      return NextResponse.json(
        { error: 'OpenClaw is disabled' },
        { status: 400 }
      );
    }

    console.log(`[OpenClaw Webhook] Received ${body.type} from ${body.channel}`);

    switch (body.type) {
      case 'message':
        return handleMessage(body);
      case 'reaction':
        return handleReaction(body);
      case 'follow':
      case 'unfollow':
        return handleFollow(body);
      default:
        return NextResponse.json({ received: true, processed: false });
    }
  } catch (error) {
    console.error('[OpenClaw Webhook] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleMessage(payload: WebhookPayload): Promise<NextResponse> {
  const { data, channel } = payload;

  if (!data.content) {
    return NextResponse.json({ received: true, processed: false });
  }

  // Check if this is a reply to a FACEBOT post
  if (data.replyToPostId) {
    // Create comment in database
    // Note: Comment model uses userId/botId refs, no author_name/source_channel columns.
    // External channel comments are stored with content only; senderId context logged.
    try {
      const comment = await prisma.comment.create({
        data: {
          postId: data.replyToPostId,
          content: data.content,
          // userId is null for external channel users (no platform account)
          // botId is null (this is a user comment from external channel)
          createdAt: new Date(data.timestamp),
        },
      });

      console.log(`[OpenClaw Webhook] Comment created from ${channel}:${data.senderId} (${data.senderName})`);

      // Trigger bot reply (async)
      triggerBotReply(data.replyToPostId, comment.id, data.content).catch(
        console.error
      );

      return NextResponse.json({
        received: true,
        processed: true,
        action: 'comment_created',
        commentId: comment.id,
      });
    } catch (error) {
      console.error('[OpenClaw Webhook] Failed to create comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }
  }

  // Check if this is a reply to a comment
  if (data.replyToCommentId) {
    try {
      // Get parent comment to inherit its postId
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.replyToCommentId },
        select: { postId: true },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      const reply = await prisma.comment.create({
        data: {
          postId: parentComment.postId,
          parentId: data.replyToCommentId,
          content: data.content,
          createdAt: new Date(data.timestamp),
        },
      });

      return NextResponse.json({
        received: true,
        processed: true,
        action: 'reply_created',
        replyId: reply.id,
      });
    } catch (error) {
      console.error('[OpenClaw Webhook] Failed to create reply:', error);
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }
  }

  // Phase 13: Handle as multi-channel chat command
  try {
    const client = getOpenClawClient();
    const message = client.parseWebhookMessage({
      id: data.messageId,
      channel: channel as OpenClawChannel,
      sender: data.senderId,
      senderName: data.senderName,
      content: data.content,
      timestamp: new Date(data.timestamp).toISOString(),
    });

    const result = await handleIncomingMessage(message);

    // Send response back via OpenClaw
    if (result.response) {
      await client.send({
        channel: channel as OpenClawChannel,
        recipient: data.senderId,
        content: result.response,
        format: result.canvas ? 'canvas' : 'text',
        canvas: result.canvas,
        replyTo: data.messageId,
      });
    }

    return NextResponse.json({
      received: true,
      processed: true,
      action: 'chat_command',
    });
  } catch (error) {
    console.error('[OpenClaw Webhook] Chat command error:', error);
    return NextResponse.json({
      received: true,
      processed: false,
      reason: 'chat_command_error',
    });
  }
}

async function handleReaction(payload: WebhookPayload): Promise<NextResponse> {
  const { data, channel } = payload;

  if (!data.replyToPostId || !data.reaction) {
    return NextResponse.json({ received: true, processed: false });
  }

  // Map channel emoji to FACEBOT reaction type
  const reactionMap: Record<string, string> = {
    '❤️': 'heart',
    '👍': 'like',
    '😍': 'love',
    '💡': 'insight',
    '😂': 'haha',
    '🤔': 'think',
    '😠': 'angry',
    '🔥': 'fire',
    '🤯': 'mindblown',
  };

  const reactionType = reactionMap[data.reaction] || 'like';

  // Reaction model requires userId (platform user).
  // External channel users don't have a platform userId.
  // Log the reaction attempt but skip DB write for external users.
  console.log(
    `[OpenClaw Webhook] Reaction ${reactionType} from ${channel}:${data.senderId} on post ${data.replyToPostId} — skipped (no platform userId)`
  );

  return NextResponse.json({
    received: true,
    processed: true,
    action: 'reaction_logged',
    reactionType,
  });
}

async function handleFollow(payload: WebhookPayload): Promise<NextResponse> {
  // Log follow/unfollow for analytics
  console.log(
    `[OpenClaw Webhook] ${payload.type}: ${payload.data.senderName} on ${payload.channel}`
  );

  return NextResponse.json({
    received: true,
    processed: true,
    action: payload.type,
  });
}

async function triggerBotReply(
  postId: string,
  commentId: string,
  commentContent: string
): Promise<void> {
  // Get post details
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      content: true,
      bot: { select: { id: true, handle: true } },
    },
  });

  if (!post?.bot?.handle) return;

  // Generate bot reply
  const sessionManager = getSessionManager();
  const reply = await sessionManager.generateReply(
    post.bot.handle,
    post.content,
    commentContent
  );

  // Save reply to database  
  await prisma.comment.create({
    data: {
      postId,
      parentId: commentId,
      content: reply,
      botId: post.bot.id,
    },
  });

  // Distribute reply back to channels
  const client = getOpenClawClient();
  // Implementation depends on OpenClaw's channel reply mechanism
}
