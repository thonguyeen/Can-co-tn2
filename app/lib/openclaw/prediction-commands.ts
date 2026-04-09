// ═══════════════════════════════════════════════════════════════
// PREDICTION COMMANDS
// ═══════════════════════════════════════════════════════════════
//
// Handles prediction market commands via chat
//

import { prisma } from '@/lib/db';
import { CommandContext, CommandResult } from './message-handler';
import { CanvasCard } from './types';

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handlePredictionCommand(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  if (!context.isLinked) {
    return {
      response: context.language === 'vi'
        ? '🔗 Liên kết tài khoản để tham gia dự đoán. Gõ "link" để xem hướng dẫn.'
        : '🔗 Link your account to participate. Type "link" for instructions.',
    };
  }

  const subCommand = args[0]?.toLowerCase();

  switch (subCommand) {
    case 'vote':
    case 'yes':
    case 'no':
      return handleVote(args, context);

    case 'my':
    case 'mine':
      return getMyPredictions(context);

    case 'results':
      return getPredictionResults(args[1], context);

    default:
      return listOpenPredictions(context);
  }
}

// ═══════════════════════════════════════════════════════════════
// LIST OPEN PREDICTIONS
// ═══════════════════════════════════════════════════════════════

async function listOpenPredictions(context: CommandContext): Promise<CommandResult> {
  const predictions = await prisma.$queryRaw<any[]>`
    SELECT * FROM predictions 
    WHERE status = 'open' 
    ORDER BY created_at DESC 
    LIMIT 5
  `;

  if (!predictions || predictions.length === 0) {
    return {
      response: context.language === 'vi'
        ? '🎯 Không có dự đoán mở lúc này.'
        : '🎯 No open predictions right now.',
    };
  }

  const items = predictions.map((p, i) => {
    const options = (p.options || []).map((o: { id: string; text: string; vote_count?: number }) => {
      const total = p.total_participants || 1;
      const percent = Math.round(((o.vote_count || 0) / total) * 100);
      return `${o.id}: ${o.text} (${percent}%)`;
    }).join(' | ');

    const closes = new Date(p.closes_at).toLocaleDateString('vi-VN');

    return `${i + 1}. *${p.question}*
${options}
👥 ${p.total_participants || 0} người | ⏰ ${closes}
Vote: \`predict ${p.id.slice(0, 6)} yes/no\``;
  });

  return {
    response: `🎯 *Dự đoán đang mở:*\n\n${items.join('\n\n')}`,
    canvas: createPredictionsCanvas(predictions),
  };
}

// ═══════════════════════════════════════════════════════════════
// HANDLE VOTE
// ═══════════════════════════════════════════════════════════════

async function handleVote(
  args: string[],
  context: CommandContext
): Promise<CommandResult> {
  let predictionId = args[0];
  let optionId = args[1]?.toLowerCase();
  let confidence = parseInt(args[2]) || 5;

  // Handle shorthand: "yes abc123" or "no abc123"
  if (['yes', 'no'].includes(args[0]?.toLowerCase())) {
    optionId = args[0].toLowerCase();
    predictionId = args[1];
  }

  if (!predictionId || !optionId) {
    return {
      response: context.language === 'vi'
        ? 'Dùng: `predict <id> yes/no [confidence 1-10]`\nVí dụ: `predict abc123 yes 8`'
        : 'Use: `predict <id> yes/no [confidence 1-10]`\nExample: `predict abc123 yes 8`',
    };
  }

  // Find prediction by partial ID
  const predictions = await prisma.$queryRaw<any[]>`
    SELECT * FROM predictions 
    WHERE id ILIKE ${predictionId + '%'} AND status = 'open' 
    LIMIT 1
  `;
  const prediction = predictions[0];

  if (!prediction) {
    return {
      response: context.language === 'vi'
        ? `❌ Không tìm thấy dự đoán "${predictionId}"`
        : `❌ Prediction "${predictionId}" not found`,
    };
  }

  // Check if already voted
  const existingVote = await prisma.$queryRaw<any[]>`
    SELECT id FROM user_predictions 
    WHERE user_id = ${context.userId} AND prediction_id = ${prediction.id} 
    LIMIT 1
  `;

  if (existingVote && existingVote.length > 0) {
    return {
      response: context.language === 'vi'
        ? '❌ Bạn đã vote cho dự đoán này rồi.'
        : '❌ You already voted on this prediction.',
    };
  }

  // Map yes/no to actual option IDs
  const options = prediction.options || [];
  const optionMap: Record<string, string> = {
    yes: options[0]?.id || 'yes',
    no: options[1]?.id || 'no',
    có: options[0]?.id || 'yes',
    không: options[1]?.id || 'no',
  };

  const actualOptionId = optionMap[optionId] || optionId;
  const selectedOption = options.find((o: { id: string; text: string }) => o.id === actualOptionId);

  if (!selectedOption) {
    return {
      response: context.language === 'vi'
        ? `❌ Option không hợp lệ. Chọn: ${options.map((o: { id: string }) => o.id).join(', ')}`
        : `❌ Invalid option. Choose: ${options.map((o: { id: string }) => o.id).join(', ')}`,
    };
  }

  // Record vote
  try {
    await prisma.$executeRaw`
      INSERT INTO user_predictions (user_id, prediction_id, selected_option, confidence, source)
      VALUES (${context.userId}, ${prediction.id}, ${actualOptionId}, ${Math.min(10, Math.max(1, confidence))}, 'openclaw')
    `;

    // Update vote count
    await prisma.$executeRaw`SELECT increment_prediction_vote(${prediction.id}, ${actualOptionId})`;
  } catch (error) {
    console.error('Vote error:', error);
    return {
      response: context.language === 'vi'
        ? '❌ Lỗi khi ghi nhận vote. Thử lại sau.'
        : '❌ Error recording vote. Try again later.',
    };
  }

  return {
    response: context.language === 'vi'
      ? `✅ Đã ghi nhận dự đoán của bạn!

*${prediction.question}*
📍 Bạn chọn: ${selectedOption.text}
💪 Confidence: ${confidence}/10

Kết quả sẽ được công bố khi hết hạn. Good luck! 🍀`
      : `✅ Prediction recorded!

*${prediction.question}*
📍 Your pick: ${selectedOption.text}
💪 Confidence: ${confidence}/10

Results will be announced when closed. Good luck! 🍀`,
  };
}

// ═══════════════════════════════════════════════════════════════
// MY PREDICTIONS
// ═══════════════════════════════════════════════════════════════

async function getMyPredictions(context: CommandContext): Promise<CommandResult> {
  const userPredictions = await prisma.$queryRaw<any[]>`
    SELECT up.*, 
           json_build_object('question', p.question, 'status', p.status, 'correct_option', p.correct_option) as predictions
    FROM user_predictions up
    JOIN predictions p ON p.id = up.prediction_id
    WHERE up.user_id = ${context.userId}
    ORDER BY up.created_at DESC
    LIMIT 10
  `;

  if (!userPredictions || userPredictions.length === 0) {
    return {
      response: context.language === 'vi'
        ? '📭 Bạn chưa có dự đoán nào.'
        : '📭 You have no predictions yet.',
    };
  }

  const pending = userPredictions.filter(p => p.predictions?.status === 'open');
  const resolved = userPredictions.filter(p => p.predictions?.status === 'resolved');
  const correct = resolved.filter(p => p.selected_option === p.predictions?.correct_option);
  const wrong = resolved.filter(p => p.selected_option !== p.predictions?.correct_option);

  const stats = `✅ ${correct.length} đúng | ❌ ${wrong.length} sai | ⏳ ${pending.length} chờ`;

  const recent = userPredictions.slice(0, 5).map(p => {
    const pred = p.predictions;
    const status = pred?.status === 'open' ? '⏳' :
                   p.selected_option === pred?.correct_option ? '✅' : '❌';
    const points = p.points_earned ? ` (${p.points_earned > 0 ? '+' : ''}${p.points_earned})` : '';
    return `${status} ${pred?.question?.slice(0, 40) || 'Unknown'}...${points}`;
  });

  return {
    response: context.language === 'vi'
      ? `🎯 *Dự đoán của bạn:*\n\n${stats}\n\n*Gần đây:*\n${recent.join('\n')}`
      : `🎯 *Your predictions:*\n\n${stats}\n\n*Recent:*\n${recent.join('\n')}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// PREDICTION RESULTS
// ═══════════════════════════════════════════════════════════════

async function getPredictionResults(
  predictionId: string | undefined,
  context: CommandContext
): Promise<CommandResult> {
  if (!predictionId) {
    const resolved = await prisma.$queryRaw<any[]>`
      SELECT * FROM predictions 
      WHERE status = 'resolved' 
      ORDER BY resolved_at DESC 
      LIMIT 5
    `;

    if (!resolved || resolved.length === 0) {
      return {
        response: context.language === 'vi'
          ? '📭 Chưa có kết quả nào.'
          : '📭 No results yet.',
      };
    }

    const items = resolved.map(p => {
      const correct = (p.options || []).find((o: { id: string; text: string }) => o.id === p.correct_option);
      return `• *${p.question?.slice(0, 40)}...*\n  ✅ ${correct?.text || 'N/A'}`;
    });

    return {
      response: `📊 *Kết quả gần đây:*\n\n${items.join('\n\n')}`,
    };
  }

  const predictions = await prisma.$queryRaw<any[]>`
    SELECT * FROM predictions 
    WHERE id ILIKE ${predictionId + '%'} 
    LIMIT 1
  `;
  const prediction = predictions[0];

  if (!prediction) {
    return {
      response: `❌ Không tìm thấy dự đoán "${predictionId}"`,
    };
  }

  if (prediction.status !== 'resolved') {
    return {
      response: context.language === 'vi'
        ? '⏳ Dự đoán này chưa có kết quả.'
        : '⏳ This prediction is not resolved yet.',
    };
  }

  const correctOption = (prediction.options || []).find((o: { id: string; text: string }) => o.id === prediction.correct_option);

  return {
    response: `📊 *${prediction.question}*

✅ Kết quả: *${correctOption?.text || 'N/A'}*
👥 Người tham gia: ${prediction.total_participants || 0}
📅 Kết thúc: ${new Date(prediction.resolved_at).toLocaleDateString('vi-VN')}`,
  };
}

// ═══════════════════════════════════════════════════════════════
// CANVAS
// ═══════════════════════════════════════════════════════════════

function createPredictionsCanvas(predictions: Array<{ id: string; question: string; options: Array<{ id: string; text: string }> }>): CanvasCard {
  return {
    type: 'prediction',
    title: '🎯 Dự đoán',
    subtitle: `${predictions.length} đang mở`,
    body: predictions[0]?.question || '',
    actions: predictions.slice(0, 2).flatMap(p =>
      (p.options || []).slice(0, 2).map((o: { id: string; text: string }) => ({
        type: 'button' as const,
        label: `${o.text} (${p.id.slice(0, 4)})`,
        action: `predict ${p.id.slice(0, 6)} ${o.id}`,
        style: 'secondary' as const,
      }))
    ),
  };
}
