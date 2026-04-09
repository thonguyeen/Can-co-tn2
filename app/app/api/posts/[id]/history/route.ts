import { NextRequest, NextResponse } from 'next/server'
import { getPostVerificationHistory } from '@/lib/ai/agents/status-manager'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const history = await getPostVerificationHistory(id)
  return NextResponse.json({ history })
}
