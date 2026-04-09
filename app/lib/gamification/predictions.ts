// ═══════════════════════════════════════════════════════════════
// PREDICTION MARKET
// ═══════════════════════════════════════════════════════════════

import { awardPoints } from './points'
import { checkAchievement } from './achievements'
import { prisma } from '@/lib/db'

export interface Prediction {
  id: string
  question: string
  category: string
  options: PredictionOption[]
  createdBy: string
  status: 'open' | 'closed' | 'resolved'
  correctOption?: string
  resolvedAt?: string
  closesAt: string
  createdAt: string
  totalParticipants: number
}

export interface PredictionOption {
  id: string
  text: string
  odds?: number
  voteCount: number
}

export interface UserPrediction {
  id: string
  predictionId: string
  userId: string
  optionId: string
  confidence: number
  createdAt: string
  result?: 'correct' | 'wrong' | 'pending'
  pointsEarned?: number
}

// ═══════════════════════════════════════════════════════════════
// SAMPLE PREDICTIONS (for demo)
// ═══════════════════════════════════════════════════════════════

export const SAMPLE_PREDICTIONS: Omit<Prediction, 'id' | 'totalParticipants' | 'createdAt'>[] = [
  // ... omitting samples as they are unused DB seed content
]

// ═══════════════════════════════════════════════════════════════
// PREDICTION OPERATIONS
// ═══════════════════════════════════════════════════════════════

export async function createPrediction(
  prediction: Omit<Prediction, 'id' | 'totalParticipants' | 'createdAt' | 'status'>
): Promise<Prediction> {
  const result = await prisma.$queryRaw<any[]>`
    INSERT INTO predictions (question, category, options, created_by, closes_at, status, total_participants)
    VALUES (${prediction.question}, ${prediction.category}, ${JSON.stringify(prediction.options)}::jsonb, ${prediction.createdBy}, ${prediction.closesAt}::timestamptz, 'open', 0)
    RETURNING *
  `
  
  const data = result[0]
  if (!data) throw new Error("Failed to create prediction")

  return {
    id: data.id,
    question: data.question,
    category: data.category,
    options: data.options,
    createdBy: data.created_by,
    status: data.status,
    closesAt: data.closes_at,
    createdAt: data.created_at,
    totalParticipants: data.total_participants,
  }
}

export async function makePrediction(
  userId: string,
  predictionId: string,
  optionId: string,
  confidence: number = 5
): Promise<UserPrediction> {
  const existing = await prisma.$queryRaw<any[]>`
    SELECT id FROM user_predictions WHERE user_id = ${userId} AND prediction_id = ${predictionId} LIMIT 1
  `

  if (existing.length > 0) throw new Error('Already made a prediction')

  const preds = await prisma.$queryRaw<any[]>`
    SELECT status, closes_at FROM predictions WHERE id = ${predictionId} LIMIT 1
  `
  const prediction = preds[0]

  if (!prediction || prediction.status !== 'open') {
    throw new Error('Prediction is not open')
  }

  if (new Date(prediction.closes_at) < new Date()) {
    throw new Error('Prediction has closed')
  }

  const resultData = await prisma.$queryRaw<any[]>`
    INSERT INTO user_predictions (user_id, prediction_id, option_id, confidence, result)
    VALUES (${userId}, ${predictionId}, ${optionId}, ${Math.min(10, Math.max(1, confidence))}, 'pending')
    RETURNING *
  `
  const data = resultData[0]

  await prisma.$executeRaw`SELECT increment_prediction_votes(${predictionId}, ${optionId})`
  await prisma.$executeRaw`SELECT increment_user_stat(${userId}, 'predictions_made')`

  return {
    id: data.id,
    predictionId: data.prediction_id,
    userId: data.user_id,
    optionId: data.option_id,
    confidence: data.confidence,
    createdAt: data.created_at,
    result: data.result,
  }
}

export async function resolvePrediction(
  predictionId: string,
  correctOptionId: string
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE predictions 
    SET status = 'resolved', correct_option = ${correctOptionId}, resolved_at = NOW() 
    WHERE id = ${predictionId}
  `

  const userPredictions = await prisma.$queryRaw<any[]>`
    SELECT * FROM user_predictions WHERE prediction_id = ${predictionId}
  `

  if (!userPredictions || userPredictions.length === 0) return

  for (const up of userPredictions) {
    const isCorrect = up.option_id === correctOptionId
    const result = isCorrect ? 'correct' : 'wrong'

    let points = 0
    if (isCorrect) {
      points = Math.round(50 * (1 + (up.confidence - 5) * 0.1))
    } else {
      points = -10
    }

    await prisma.$executeRaw`
      UPDATE user_predictions 
      SET result = ${result}, points_earned = ${points} 
      WHERE id = ${up.id}
    `

    await awardPoints(
      up.user_id,
      isCorrect ? 'prediction_correct' : 'prediction_wrong',
      { prediction_id: predictionId, confidence: up.confidence }
    )

    if (isCorrect) {
      await checkAchievement(up.user_id, 'oracle')
    }

    await prisma.$executeRaw`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (${up.user_id}, 'prediction_result', ${isCorrect ? 'Du doan dung!' : 'Du doan sai'}, ${isCorrect ? `Ban da du doan dung va nhan ${points} diem!` : `Du doan cua ban khong chinh xac.`})
    `
  }
}

export async function getOpenPredictions(
  category?: string,
  limit: number = 10
): Promise<Prediction[]> {
  const data = category 
    ? await prisma.$queryRaw<any[]>`
        SELECT * FROM predictions 
        WHERE status = 'open' AND closes_at > NOW() AND category = ${category}
        ORDER BY closes_at ASC LIMIT ${limit}
      `
    : await prisma.$queryRaw<any[]>`
        SELECT * FROM predictions 
        WHERE status = 'open' AND closes_at > NOW()
        ORDER BY closes_at ASC LIMIT ${limit}
      `

  return (data || []).map((d: any) => ({
    id: d.id,
    question: d.question,
    category: d.category,
    options: d.options,
    createdBy: d.created_by,
    status: d.status,
    closesAt: d.closes_at,
    createdAt: d.created_at,
    totalParticipants: d.total_participants,
  }))
}
