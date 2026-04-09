import { NextRequest, NextResponse } from 'next/server'
import {
  getOpenPredictions,
  createPrediction,
  makePrediction,
  resolvePrediction,
} from '@/lib/gamification/predictions'

// GET: List open predictions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    const predictions = await getOpenPredictions(category, limit)

    return NextResponse.json({
      success: true,
      predictions,
    })
  } catch (error) {
    console.error('Predictions fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch predictions' },
      { status: 500 }
    )
  }
}

// POST: Create prediction or make a prediction vote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const { question, category, options, createdBy, closesAt } = body
        if (!question || !options || !closesAt) {
          return NextResponse.json(
            { error: 'question, options, and closesAt are required' },
            { status: 400 }
          )
        }
        const prediction = await createPrediction({
          question,
          category: category || 'general',
          options,
          createdBy: createdBy || 'system',
          closesAt,
        })
        return NextResponse.json({ success: true, prediction })
      }

      case 'vote': {
        const { userId, predictionId, optionId, confidence } = body
        if (!userId || !predictionId || !optionId) {
          return NextResponse.json(
            { error: 'userId, predictionId, and optionId are required' },
            { status: 400 }
          )
        }
        const result = await makePrediction(userId, predictionId, optionId, confidence)
        return NextResponse.json({ success: true, prediction: result })
      }

      case 'resolve': {
        const { predictionId, correctOptionId } = body
        if (!predictionId || !correctOptionId) {
          return NextResponse.json(
            { error: 'predictionId and correctOptionId are required' },
            { status: 400 }
          )
        }
        await resolvePrediction(predictionId, correctOptionId)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Predictions action error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Action failed' },
      { status: 500 }
    )
  }
}
